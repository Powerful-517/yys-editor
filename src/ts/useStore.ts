import {defineStore} from 'pinia';
import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
// import type { Edge, Node, ViewportTransform } from '@vue-flow/core';
import {ElMessageBox} from "element-plus";
import {useGlobalMessage} from "./useGlobalMessage";
import {getLogicFlowInstance} from "./useLogicFlow";
import {CURRENT_SCHEMA_VERSION, migrateToV1, RootDocument} from "./schema";

const {showMessage} = useGlobalMessage();

// localStorage 防抖定时器
let localStorageDebounceTimer: NodeJS.Timeout | null = null;
const LOCALSTORAGE_DEBOUNCE_DELAY = 1000; // 1秒防抖

type PersistedRoot = RootDocument & {
    activeFileId?: string;
    activeFile?: string;
};

interface FlowFile {
    id: string; // stable identity, do not rely on name for selection
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
    const id = 'f_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return {
        "fileList": [
            {
                "id": id,
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
        // legacy: kept for compatibility, actual selection uses activeFileId
        "activeFile": "File 1",
        "activeFileId": id
    } as any;
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
    // Helper: generate stable ids
    const genId = () => 'f_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    // 文件列表状态（以 id 作为主键）
    const fileList = ref<FlowFile[]>([]);
    const activeFileId = ref<string>('');

    // 计算属性：获取可见的文件
    const visibleFiles = computed(() => {
        return fileList.value.filter(file => file.visible);
    });

    // 根据传入列表补全缺省字段并补齐 id
    const normalizeList = (list: any[]): FlowFile[] => {
        return (list || []).map((f: any, i: number) => ({
            id: f?.id || genId(),
            label: f?.label ?? f?.name ?? `File ${i + 1}`,
            name: f?.name ?? f?.label ?? `File ${i + 1}`,
            visible: f?.visible ?? true,
            type: f?.type ?? 'FLOW',
            graphRawData: (f?.graphRawData && typeof f.graphRawData === 'object') ? f.graphRawData : { nodes: [], edges: [] },
            transform: f?.transform ?? {
                SCALE_X: 1,
                SCALE_Y: 1,
                TRANSLATE_X: 0,
                TRANSLATE_Y: 0
            },
        }));
    };

    const findById = (id?: string) => fileList.value.find(f => f.id === id);
    const findByName = (name?: string) => fileList.value.find(f => f.name === name);

    // 导入数据（兼容旧格式 activeFile/name）
    const importData = (data: any) => {
        try {
            // 如果已有 schemaVersion，则视为 v1 RootDocument；否则通过迁移器补齐
            const root: PersistedRoot = (data && typeof data === 'object' && (data as any).schemaVersion)
                ? (data as PersistedRoot)
                : migrateToV1(data) as PersistedRoot;

            const normalized = normalizeList(root.fileList || []);
            fileList.value = normalized;

            // 选中逻辑：优先 activeFileId -> 其次 activeFile(name) -> 首个
            let nextActiveId: string | undefined = undefined;
            const idFromData = (data as any).activeFileId ?? root.activeFileId;
            if (idFromData && normalized.some(f => f.id === idFromData)) {
                nextActiveId = idFromData;
            } else {
                const nameFromData = (data as any).activeFile ?? root.activeFile;
                if (nameFromData) {
                    const byName = normalized.find(f => f.name === nameFromData);
                    nextActiveId = byName?.id;
                }
            }
            activeFileId.value = nextActiveId || normalized[0]?.id || '';

            showMessage('success', '数据导入成功');
        } catch (error) {
            console.error('Failed to import file', error);
            showMessage('error', '数据导入失败');
        }
    };

    // 导出数据（同时携带 activeFile 与 activeFileId 以兼容旧版）
    const exportData = () => {
        try {
            const activeName = findById(activeFileId.value)?.name || '';
            const dataStr = JSON.stringify({
                schemaVersion: CURRENT_SCHEMA_VERSION,
                fileList: fileList.value,
                activeFileId: activeFileId.value,
                activeFile: activeName,
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

    // 启动自动恢复；如有保存的数据则直接恢复；否则用默认
    const initializeWithPrompt = () => {
        const savedStateRaw = loadStateFromLocalStorage();
        const defaultState = getDefaultState();

        if (savedStateRaw && (savedStateRaw as any).fileList) {
            // 若已有 schemaVersion，则视为 v1；否则通过迁移器补齐到 RootDocument 形态
            const root: PersistedRoot = ((savedStateRaw as any).schemaVersion)
                ? (savedStateRaw as PersistedRoot)
                : migrateToV1(savedStateRaw) as PersistedRoot;

            const normalized = normalizeList(root.fileList || []);
            fileList.value = normalized;

            let next: string | undefined;
            const idFromData = (savedStateRaw as any).activeFileId ?? root.activeFileId;
            if (idFromData && normalized.some(f => f.id === idFromData)) {
                next = idFromData;
            } else {
                const nameFromData = (savedStateRaw as any).activeFile ?? root.activeFile;
                if (nameFromData) {
                    next = normalized.find(f => f.name === nameFromData)?.id;
                }
            }
            activeFileId.value = next || normalized[0]?.id || '';
            showMessage('success', '已恢复上次工作区');
            return;
        }

        // 无保存数据：使用默认
        fileList.value = normalizeList(defaultState.fileList);
        activeFileId.value = fileList.value[0]?.id || '';
    };

    // 提供重置接口：清空本地并回到默认
    const resetWorkspace = () => {
        clearFilesStoreLocalStorage();
        const def = getDefaultState();
        fileList.value = normalizeList(def.fileList);
        activeFileId.value = fileList.value[0]?.id || '';
        showMessage('success', '已重置工作区');
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
            const newFile: FlowFile = {
                id: genId(),
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
            activeFileId.value = newFile.id;
        });
    };

    // 关闭文件标签
    const removeTab = (fileId: string | undefined) => {
        if (!fileId) return;

        const index = fileList.value.findIndex(file => file.id === fileId);
        if (index === -1) return;

        fileList.value.splice(index, 1);

        // 如果关闭的是当前活动文件，则切换到其他文件
        if (activeFileId.value === fileId) {
            activeFileId.value = fileList.value[Math.max(0, index - 1)]?.id || '';
        }

        // 关闭文件后立即更新
        // updateTab();
    };

    // 更新指定 Tab - 内存操作即时，localStorage 操作防抖
    const updateTab = (fileId?: string) => {
        try {
            const targetId = fileId || activeFileId.value;

            // 先同步 LogicFlow 数据到内存
            syncLogicFlowDataToStore(targetId);

            // 再保存到 localStorage（带防抖）
            const state: PersistedRoot = {
                schemaVersion: CURRENT_SCHEMA_VERSION,
                fileList: fileList.value as any,
                activeFileId: activeFileId.value,
                activeFile: findById(activeFileId.value)?.name || ''
            };
            saveStateToLocalStorage(state);
        } catch (error) {
            console.error('更新 Tab 失败:', error);
            showMessage('error', '数据更新失败');
        }
    };

    // 获取当前 Tab 数据（优先按 id，兼容按 name）
    const getTab = (fileKey?: string) => {
        const targetId = fileKey || activeFileId.value;
        return findById(targetId) || findByName(fileKey || '');
    };

    // 同步 LogicFlow 画布数据到 store 的内部方法
    const syncLogicFlowDataToStore = (fileId?: string) => {
        const logicFlowInstance = getLogicFlowInstance();
        const targetId = fileId || activeFileId.value;

        if (logicFlowInstance && targetId) {
            try {
                // 获取画布最新数据
                const graphData = logicFlowInstance.getGraphRawData();
                const transform = logicFlowInstance.getTransform();

                if (graphData) {
                    // 直接保存原始数据到 GraphRawData
                    const file = findById(targetId);
                    if (file) {
                        file.graphRawData = graphData;
                        file.transform = transform;
                        console.log(`已同步画布数据到文件 "${file.name}"(${targetId})`);
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
        resetWorkspace,
        setupAutoSave,

        addTab,
        removeTab,
        updateTab,
        getTab,

        fileList,
        activeFileId,
        visibleFiles,
    };
});;;
