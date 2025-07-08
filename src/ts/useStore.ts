import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Edge, Node, ViewportTransform } from '@vue-flow/core';

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
    const addEdge = (edge: Edge) => {
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
        if (file && file.flowData) file.flowData.viewport = viewport;
    };

    const getFileViewport = (fileName: string): ViewportTransform => {
        const file = fileList.value.find(f => f.name === fileName);
        const v = file?.flowData?.viewport;
        if (v && typeof v.x === 'number' && typeof v.y === 'number' && typeof v.zoom === 'number') {
            return v as ViewportTransform;
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
    };
});