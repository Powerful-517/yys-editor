import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
// import type { Edge, Node, ViewportTransform } from '@vue-flow/core';
import { ElMessageBox } from "element-plus";
import { useGlobalMessage } from "./useGlobalMessage";

const { showMessage } = useGlobalMessage();

function getDefaultState() {
    return {
        fileList: [
            {
                label: "File 1",
                name: "1",
                visible: true,
                type: "FLOW",
                groups: [
                    {
                        shortDescription: "File 1 Group",
                        groupInfo: [{}, {}, {}, {}, {}],
                        details: "File 1 详情"
                    }
                ],
                flowData: {
                    nodes: [
                        {
                            id: "node-1",
                            type: "rect",
                            x: 100,
                            y: 100,
                            text: "File1-矩形节点"
                        },
                        {
                            id: "node-2",
                            type: "ellipse",
                            x: 350,
                            y: 120,
                            text: "File1-圆形节点"
                        }
                    ],
                    edges: [
                        {
                            id: "edge-1",
                            type: "polyline",
                            sourceNodeId: "node-1",
                            targetNodeId: "node-2"
                        }
                    ],
                    viewport: { x: 0, y: 0, zoom: 1 }
                }
            },
            {
                label: "File 2",
                name: "2",
                visible: true,
                type: "FLOW",
                groups: [
                    {
                        shortDescription: "File 2 Group",
                        groupInfo: [{}, {}, {}, {}, {}],
                        details: "File 2 详情"
                    }
                ],
                flowData: {
                    nodes: [
                        {
                            id: "node-1",
                            type: "rect",
                            x: 100,
                            y: 100,
                            text: "File2-矩形节点"
                        },
                        {
                            id: "node-2",
                            type: "ellipse",
                            x: 350,
                            y: 120,
                            text: "File2222-圆形节点"
                        }
                    ],
                    edges: [
                        {
                            id: "edge-1",
                            type: "polyline",
                            sourceNodeId: "node-1",
                            targetNodeId: "node-2"
                        }
                    ],
                    viewport: { x: 0, y: 0, zoom: 1 }
                }
            }
        ],
        activeFile: "1",
    };
}

function saveStateToLocalStorage(state: any) {
    try {
        localStorage.setItem('filesStore', JSON.stringify(state));
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

// 文件相关的类型定义
interface FileGroup {
    shortDescription: string;
    groupInfo: Record<string, any>[];
    details: string;
}

interface FlowFile {
    label: string;
    name: string;
    visible: boolean;
    type: string;
    groups: FileGroup[];
    flowData?: any;
}

export const useFilesStore = defineStore('files', () => {
    // 文件列表状态
    const fileList = ref<FlowFile[]>([]);
    const activeFile = ref<string>('');

    // 计算属性：获取可见的文件
    const visibleFiles = computed(() => {
        return fileList.value.filter(file => file.visible);
    });

    // 获取当前活动文件的节点和边
    const activeFileNodes = computed(() => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        return file?.flowData?.nodes || [];
    });

    const activeFileEdges = computed(() => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        return file?.flowData?.edges || [];
    });

    // 添加新文件
    const addFile = (file: FlowFile) => {
        const newFile = {
            ...file,
            flowData: {
                nodes: [],
                edges: [],
                viewport: { x: 0, y: 0, zoom: 1 }
            }
        };
        fileList.value.push(newFile);
        activeFile.value = file.name;
    };

    // 关闭文件标签
    const closeTab = (fileName: string | undefined) => {
        if (!fileName) return;

        const index = fileList.value.findIndex(file => file.name === fileName);
        if (index === -1) return;

        fileList.value.splice(index, 1);

        // 如果关闭的是当前活动文件，则切换到其他文件
        if (activeFile.value === fileName) {
            activeFile.value = fileList.value[Math.max(0, index - 1)]?.name || '';
        }
    };

    // 添加节点
    const addNode = (node: Node) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file) return;
        if (!file.flowData) file.flowData = { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
        file.flowData.nodes.push(node);
    };

    // 更新节点
    const updateNode = (nodeId: string, updateData: Partial<Node>) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file || !file.flowData || !file.flowData.nodes) return;
        const nodeIndex = file.flowData.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) return;
        file.flowData.nodes[nodeIndex] = {
            ...file.flowData.nodes[nodeIndex],
            ...updateData,
        };
    };

    // 删除节点
    const removeNode = (nodeId: string) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file || !file.flowData || !file.flowData.nodes) return;
        file.flowData.nodes = file.flowData.nodes.filter(n => n.id !== nodeId);
        // 同时删除相关的边
        if (file.flowData.edges) {
            file.flowData.edges = file.flowData.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
        }
    };

    // 添加边
    const addEdge = (edge) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file) return;
        if (!file.flowData) file.flowData = { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } };
        file.flowData.edges.push(edge);
    };

    // 删除边
    const removeEdge = (edgeId: string) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file || !file.flowData || !file.flowData.edges) return;
        file.flowData.edges = file.flowData.edges.filter(e => e.id !== edgeId);
    };

    // 更新节点位置
    const updateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file || !file.flowData || !file.flowData.nodes) return;
        const node = file.flowData.nodes.find(n => n.id === nodeId);
        if (node) {
            node.position = position;
        }
    };

    // 更新节点顺序
    const updateNodesOrder = (nodes: Node[]) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file || !file.flowData) return;
        file.flowData.nodes = nodes;
    };

    // 更新文件的 viewport
    const updateFileViewport = (fileName: string, viewport: { x: number; y: number; zoom: number }) => {
        const file = fileList.value.find(f => f.name === fileName);
        if (file && file.flowData) {
            console.log(`[updateFileViewport] 保存 tab "${fileName}" 的视口信息:`, viewport);
            file.flowData.viewport = viewport;
        }
    };

    const getFileViewport = (fileName: string) => {
        const file = fileList.value.find(f => f.name === fileName);
        const v = file?.flowData?.viewport;
        if (v && typeof v.x === 'number' && typeof v.y === 'number' && typeof v.zoom === 'number') {
            return v ;
        }
        return { x: 0, y: 0, zoom: 1 };
    };

    // 更新文件的 flowData
    const updateFileFlowData = (fileName: string, flowData: any) => {
        const file = fileList.value.find(f => f.name === fileName);
        if (file) file.flowData = flowData;
    };

    // 获取文件的 flowData
    const getFileFlowData = (fileName: string): any => {
        const file = fileList.value.find(f => f.name === fileName);
        return file?.flowData;
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

    // 设置自动保存
    const setupAutoSave = () => {
        console.log('自动保存功能已启动，每30秒保存一次');
        setInterval(() => {
            try {
                saveStateToLocalStorage({
                    fileList: fileList.value,
                    activeFile: activeFile.value
                });
                console.log('数据已自动保存到 localStorage');
            } catch (error) {
                console.error('自动保存失败:', error);
            }
        }, 30000); // 设置间隔时间为30秒
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

    // 导入数据
    const importData = (data: any) => {
        try {
            if (data.fileList && Array.isArray(data.fileList)) {
                // 新版本格式：包含 fileList 和 activeFile
                fileList.value = data.fileList;
                activeFile.value = data.activeFile || "1";
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
                    flowData: {
                        nodes: [],
                        edges: [],
                        viewport: { x: 0, y: 0, zoom: 1 }
                    }
                };
                addFile(newFile);
                showMessage('success', '数据导入成功');
            }
            // 导入后立即保存到 localStorage
            saveStateToLocalStorage({
                fileList: fileList.value,
                activeFile: activeFile.value
            });
        } catch (error) {
            console.error('Failed to import file', error);
            showMessage('error', '数据导入失败');
        }
    };

    return {
        fileList,
        activeFile,
        visibleFiles,
        activeFileNodes,
        activeFileEdges,
        addFile,
        closeTab,
        addNode,
        updateNode,
        removeNode,
        addEdge,
        removeEdge,
        updateNodePosition,
        updateNodesOrder,
        updateFileViewport,
        getFileViewport,
        updateFileFlowData,
        getFileFlowData,
        initializeWithPrompt,
        setupAutoSave,
        exportData,
        importData,
    };
});