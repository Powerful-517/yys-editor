import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
// import type { Edge, Node, ViewportTransform } from '@vue-flow/core';
import {ElMessageBox} from "element-plus";
import {useGlobalMessage} from "./useGlobalMessage";
import {getLogicFlowInstance} from "./useLogicFlow";

const {showMessage} = useGlobalMessage();

// localStorage 防抖定时器
let localStorageDebounceTimer: NodeJS.Timeout | null = null;
const LOCALSTORAGE_DEBOUNCE_DELAY = 1000; // 1秒防抖

interface FlowFile {
    label: string;
    name: string;
    visible: boolean;
    type: string;
    graphRawData?: object;
    transform?: {
        "SCALE_X": number,
        "SCALE_Y": number,
        "TRANSLATE_X": number,
        "TRANSLATE_Y": number
    };
}

function getDefaultState() {
    return {
        "fileList": [
            {
                "label": "File 1",
                "name": "File 1",
                "visible": true,
                "type": "FLOW",
                "graphRawData": {
                    "nodes": [],
                    "edges": []
                },
                "transform": {
                    "SCALE_X": 1,
                    "SCALE_Y": 1,
                    "TRANSLATE_X": 0,
                    "TRANSLATE_Y": 0
                }
            }
        ],
        "activeFile": "File 1"
    };
}

function clearFilesStoreLocalStorage() {
    localStorage.removeItem('filesStore');
}

function loadStateFromLocalStorage() {
    try {
        const data = localStorage.getItem('filesStore');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('从 localStorage 加载数据失败:', error);
        return null;
    }
}

function saveStateToLocalStorage(state: any) {
    // 清除之前的防抖定时器
    if (localStorageDebounceTimer) {
        clearTimeout(localStorageDebounceTimer);
    }

    // 设置新的防抖定时器
    localStorageDebounceTimer = setTimeout(() => {
        try {
            localStorage.setItem('filesStore', JSON.stringify(state));
            console.log('数据已防抖保存到 localStorage');
        } catch (error) {
            console.error('保存到 localStorage 失败:', error);
            // 如果 localStorage 满了，尝试清理一些数据
            try {
                localStorage.clear();
                localStorage.setItem('filesStore', JSON.stringify(state));
            } catch (clearError) {
                console.error('清理 localStorage 后仍无法保存:', clearError);
            }
        }
    }, LOCALSTORAGE_DEBOUNCE_DELAY);
}


export const useFilesStore = defineStore('files', () => {
    // 文件列表状态
    const fileList = ref<FlowFile[]>([]);
    const activeFile = ref<string>('');

    // 计算属性：获取可见的文件
    const visibleFiles = computed(() => {
        return fileList.value.filter(file => file.visible);
    });

    // 导入数据
    const importData = (data: any) => {
        try {
            if (data.fileList && Array.isArray(data.fileList)) {
                // 新版本格式：包含 fileList 和 activeFile
                fileList.value = data.fileList;
                activeFile.value = data.activeFile || data[0]?.name;
                showMessage('success', '数据导入成功');
            } else if (Array.isArray(data) && data[0]?.visible === true) {
                // 兼容旧版本格式：直接是 fileList 数组
                fileList.value = data;
                activeFile.value = data[0]?.name || "1";
                showMessage('success', '数据导入成功');
            } else {
                // 兼容更旧版本格式：仅包含 groups 数组
                const newFile = {
                    label: `File ${fileList.value.length + 1}`,
                    name: String(fileList.value.length + 1),
                    visible: true,
                    type: "FLOW",
                    groups: data,
                    graphRawData: {
                        nodes: [],
                        edges: []
                    },
                    transform: {
                        SCALE_X: 1,
                        SCALE_Y: 1,
                        TRANSLATE_X: 0,
                        TRANSLATE_Y: 0
                    }
                };
                fileList.value.push(newFile);
                activeFile.value = newFile.name;
                showMessage('success', '数据导入成功');
            }
        } catch (error) {
            console.error('Failed to import file', error);
            showMessage('error', '数据导入失败');
        }
    };

    // 导出数据
    const exportData = () => {
        try {
            const dataStr = JSON.stringify({
                fileList: fileList.value,
                activeFile: activeFile.value
            }, null, 2);
            const blob = new Blob([dataStr], {type: 'application/json;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'yys-editor-files.json';
            link.click();
            URL.revokeObjectURL(url);
            showMessage('success', '数据导出成功');
        } catch (error) {
            console.error('导出数据失败:', error);
            showMessage('error', '数据导出失败');
        }
    };

    // 初始化时检查是否有未保存的数据
    const initializeWithPrompt = () => {
        const savedState = loadStateFromLocalStorage();
        const defaultState = getDefaultState();

        // 如果没有保存的数据，使用默认状态
        if (!savedState) {
            fileList.value = defaultState.fileList;
            activeFile.value = defaultState.activeFile;
            return;
        }

        const isSame = JSON.stringify(savedState) === JSON.stringify(defaultState);
        if (savedState && !isSame) {
            ElMessageBox.confirm(
                '检测到有未保存的旧数据，是否恢复？',
                '提示',
                {
                    confirmButtonText: '恢复',
                    cancelButtonText: '不恢复',
                    type: 'warning',
                }
            ).then(() => {
                fileList.value = savedState.fileList || [];
                activeFile.value = savedState.activeFile || "1";
                showMessage('success', '数据已恢复');
            }).catch(() => {
                clearFilesStoreLocalStorage();
                fileList.value = defaultState.fileList;
                activeFile.value = defaultState.activeFile;
                showMessage('info', '选择了不恢复旧数据');
            });
        } else {
            // 如果有保存的数据且与默认状态相同，直接使用保存的数据
            fileList.value = savedState.fileList || defaultState.fileList;
            activeFile.value = savedState.activeFile || defaultState.activeFile;
        }
    };

    // 设置自动更新
    const setupAutoSave = () => {
        console.log('自动更新功能已启动，每30秒更新一次');
        setInterval(() => {
            updateTab(); // 使用统一的更新方法
        }, 30000); // 设置间隔时间为30秒
    };

    // 添加新文件
    const addTab = () => {
        // 添加文件前先保存
        updateTab();

        requestAnimationFrame(() => {
            const newFileName = `File ${fileList.value.length + 1}`;
            const newFile = {
                label: newFileName,
                name: newFileName,
                visible: true,
                type: 'FLOW',
                graphRawData: {},
                transform: {
                    SCALE_X: 1,
                    SCALE_Y: 1,
                    TRANSLATE_X: 0,
                    TRANSLATE_Y: 0
                }
            };
            fileList.value.push(newFile);
            activeFile.value = newFileName;
        });
    };

    // 关闭文件标签
    const removeTab = (fileName: string | undefined) => {
        if (!fileName) return;

        const index = fileList.value.findIndex(file => file.name === fileName);
        if (index === -1) return;

        fileList.value.splice(index, 1);

        // 如果关闭的是当前活动文件，则切换到其他文件
        if (activeFile.value === fileName) {
            activeFile.value = fileList.value[Math.max(0, index - 1)]?.name || '';
        }

        // 关闭文件后立即更新
        updateTab();
    };

    // 更新指定 Tab - 内存操作即时，localStorage 操作防抖
    const updateTab = (fileName?: string) => {
        try {
            const targetFile = fileName || activeFile.value;

            // 先同步 LogicFlow 数据到内存
            syncLogicFlowDataToStore(targetFile);

            // 再保存到 localStorage（带防抖）
            const state = {
                fileList: fileList.value,
                activeFile: activeFile.value
            };
            saveStateToLocalStorage(state);
        } catch (error) {
            console.error('更新 Tab 失败:', error);
            showMessage('error', '数据更新失败');
        }
    };

    // 获取当前 Tab 数据
    const getTab = (fileName?: string) => {
        const targetFile = fileName || activeFile.value;
        return fileList.value.find(f => f.name === targetFile);
    };

    // 同步 LogicFlow 画布数据到 store 的内部方法
    const syncLogicFlowDataToStore = (fileName?: string) => {
        const logicFlowInstance = getLogicFlowInstance();
        const targetFile = fileName || activeFile.value;

        if (logicFlowInstance && targetFile) {
            try {
                // 获取画布最新数据
                const graphData = logicFlowInstance.getGraphRawData();
                const transform = logicFlowInstance.getTransform();

                if (graphData) {
                    // 直接保存原始数据到 GraphRawData
                    const file = fileList.value.find(f => f.name === targetFile);
                    if (file) {
                        file.graphRawData = graphData;
                        file.transform = transform;
                        console.log(`已同步画布数据到文件 "${targetFile}"`);
                    }
                }
            } catch (error) {
                console.warn('同步画布数据失败:', error);
            }
        }
    };





    return {
        importData,
        exportData,

        initializeWithPrompt,
        setupAutoSave,

        addTab,
        removeTab,
        updateTab,
        getTab,

        fileList,
        activeFile,
        visibleFiles,
    };
});