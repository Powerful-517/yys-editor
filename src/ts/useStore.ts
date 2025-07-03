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
    nodes?: Node[];
    edges?: Edge[];
    viewport?: { x: number; y: number; zoom: number };
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
        return file?.nodes || [];
    });

    const activeFileEdges = computed(() => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        return file?.edges || [];
    });

    // 添加新文件
    const addFile = (file: FlowFile) => {
        // 确保新文件包含空的节点和边数组
        const newFile = {
            ...file,
            nodes: [],
            edges: []
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

        if (!file.nodes) file.nodes = [];
        file.nodes.push(node);
    };

    // 更新节点
    const updateNode = (nodeId: string, updateData: Partial<Node>) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file || !file.nodes) return;

        const nodeIndex = file.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) return;

        file.nodes[nodeIndex] = {
            ...file.nodes[nodeIndex],
            ...updateData,
        };
    };

    // 删除节点
    const removeNode = (nodeId: string) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file || !file.nodes) return;

        file.nodes = file.nodes.filter(n => n.id !== nodeId);
        // 同时删除相关的边
        if (file.edges) {
            file.edges = file.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
        }
    };

    // 添加边
    const addEdge = (edge: Edge) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file) return;

        if (!file.edges) file.edges = [];
        file.edges.push(edge);
    };

    // 删除边
    const removeEdge = (edgeId: string) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file || !file.edges) return;

        file.edges = file.edges.filter(e => e.id !== edgeId);
    };

    // 更新节点位置
    const updateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file || !file.nodes) return;

        const node = file.nodes.find(n => n.id === nodeId);
        if (node) {
            node.position = position;
        }
    };

    // 更新节点顺序
    const updateNodesOrder = (nodes: Node[]) => {
        const file = fileList.value.find(f => f.name === activeFile.value);
        if (!file) return;
        file.nodes = nodes;
    };

    // 更新文件的 viewport
    const updateFileViewport = (fileName: string, viewport: { x: number; y: number; zoom: number }) => {
        const file = fileList.value.find(f => f.name === fileName);
        if (file) file.viewport = viewport;
    };

    const getFileViewport = (fileName: string): ViewportTransform => {
        const file = fileList.value.find(f => f.name === fileName);
        const v = file?.viewport;
        if (v && typeof v.x === 'number' && typeof v.y === 'number' && typeof v.zoom === 'number') {
            return v as ViewportTransform;
        }
        return { x: 0, y: 0, zoom: 1 };
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
    };
});