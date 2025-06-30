<script setup lang="ts">
import { ref, onMounted, shallowRef, markRaw, onUnmounted } from 'vue';
import { VueFlow, useVueFlow, Panel, NodeTypes } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import PropertyPanel from './PropertyPanel.vue';
import ShikigamiSelectNode from './nodes/yys/ShikigamiSelectNode.vue';
import YuhunSelectNode from './nodes/yys/YuhunSelectNode.vue';
import PropertySelectNode from './nodes/yys/PropertySelectNode.vue';
import ImageNode from './nodes/common/ImageNode.vue';
import TextNode from './nodes/common/TextNode.vue';
import useDragAndDrop from '@/ts/useDnD';

const props = defineProps({
  height: {
    type: String,
    default: '100%'
  }
});

// 设置节点类型
const nodeTypes = shallowRef({
  shikigamiSelect: markRaw(ShikigamiSelectNode),
  yuhunSelect: markRaw(YuhunSelectNode),
  propertySelect: markRaw(PropertySelectNode),
  imageNode: markRaw(ImageNode),
  textNode: markRaw(TextNode)
});

// 初始化流程图节点 - 使用普通数组而非ref
const initialNodes = [
  { id: '1', label: '开始', position: { x: 100, y: 100 }, type: 'input' }
];

// 初始化流程图连线 - 使用普通数组而非ref
const initialEdges = [];

// 使用VueFlow的API，传入普通数组而非ref
const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNodes, setTransform, getViewport, updateNode } = useVueFlow({
  defaultNodes: initialNodes,
  defaultEdges: initialEdges,
  nodeTypes
});

// 使用拖拽功能
const { onDragOver, onDrop } = useDragAndDrop();

// 右键菜单相关
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  nodeId: null
});

// 处理节点右键点击
const handleNodeContextMenu = (event) => {
  const { event: mouseEvent, node } = event;
  mouseEvent.preventDefault();
  mouseEvent.stopPropagation();

  contextMenu.value = {
    show: true,
    x: mouseEvent.clientX,
    y: mouseEvent.clientY,
    nodeId: node.id
  };
};

// 处理画布右键点击
const handlePaneContextMenu = (event) => {
  event.preventDefault();
  event.stopPropagation();
  contextMenu.value.show = false;
};

// 点击其他地方时关闭菜单
const handleClickOutside = (event) => {
  if (!event.target.closest('.context-menu')) {
    contextMenu.value.show = false;
  }
};

// 处理图层顺序调整
const handleLayerOrder = (action) => {
  if (!contextMenu.value.nodeId) return;

  const nodeId = contextMenu.value.nodeId;
  const nodeIndex = nodes.value.findIndex(n => n.id === nodeId);
  if (nodeIndex === -1) return;

  const node = nodes.value[nodeIndex];
  const newNodes = [...nodes.value];

  switch (action) {
    case 'bringToFront':
      // 移至最前
      newNodes.splice(nodeIndex, 1);
      newNodes.push(node);
      break;
    case 'sendToBack':
      // 移至最后
      newNodes.splice(nodeIndex, 1);
      newNodes.unshift(node);
      break;
    case 'bringForward':
      // 上移一层
      if (nodeIndex < newNodes.length - 1) {
        [newNodes[nodeIndex], newNodes[nodeIndex + 1]] = [newNodes[nodeIndex + 1], newNodes[nodeIndex]];
      }
      break;
    case 'sendBackward':
      // 下移一层
      if (nodeIndex > 0) {
        [newNodes[nodeIndex], newNodes[nodeIndex - 1]] = [newNodes[nodeIndex - 1], newNodes[nodeIndex]];
      }
      break;
  }

  // 更新节点顺序
  nodes.value = newNodes;
  contextMenu.value.show = false;
};

defineExpose({
  handleAddNode: addNodes,
  getViewport
});

onMounted(() => {
  console.log('FlowEditor 组件已挂载');
});

onUnmounted(() => {
  // 移除事件监听
  // document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="flow-editor" :style="{ height }">
    <div class="editor-layout">
      <!-- 中间流程图区域 -->
      <div class="flow-container">
        <VueFlow
            :nodes="nodes"
            :edges="edges"
            @nodes-change="onNodesChange"
            @edges-change="onEdgesChange"
            @connect="onConnect"
            fit-view-on-init
            @drop="onDrop"
            @dragover="onDragOver"
            @node-context-menu="handleNodeContextMenu"
            @pane-context-menu="handlePaneContextMenu"
        >
          <Background pattern-color="#aaa" gap="8" />
          <Controls />
          <Panel position="top-right" class="flow-panel">
            <div>流程图编辑器 (模仿 draw.io)</div>
          </Panel>
        </VueFlow>

        <!-- 右键菜单 -->
        <Teleport to="body">
          <div v-if="contextMenu.show"
               class="context-menu"
               :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
               @click.stop>
            <div class="menu-item" @click="handleLayerOrder('bringToFront')">移至最前</div>
            <div class="menu-item" @click="handleLayerOrder('sendToBack')">移至最后</div>
            <div class="menu-item" @click="handleLayerOrder('bringForward')">上移一层</div>
            <div class="menu-item" @click="handleLayerOrder('sendBackward')">下移一层</div>
          </div>
        </Teleport>
      </div>

      <!-- 右侧属性面板 -->
      <PropertyPanel
          :height="height"
      />
    </div>
  </div>
</template>

<style scoped>
.flow-editor {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.editor-layout {
  display: flex;
  height: 100%;
}

.flow-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}


.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 5px 0;
  z-index: 9999;
  min-width: 120px;
  user-select: none;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.menu-item:hover {
  background-color: #f5f7fa;
  color: #409eff;
}
</style> 