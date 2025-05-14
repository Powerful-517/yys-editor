<script setup lang="ts">
import { ref, onMounted, shallowRef, markRaw } from 'vue';
import { VueFlow, useVueFlow, Panel, NodeTypes } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import ComponentsPanel from './ComponentsPanel.vue';
import PropertyPanel from './PropertyPanel.vue';
import ShikigamiSelectNode from './nodes/yys/ShikigamiSelectNode.vue';
import YuhunSelectNode from './nodes/yys/YuhunSelectNode.vue';
import PropertySelectNode from './nodes/yys/PropertySelectNode.vue';
import ImageNode from './nodes/common/ImageNode.vue';
import TextNode from './nodes/common/TextNode.vue';

const props = defineProps({
  height: {
    type: String,
    default: '100%'
  }
});

const emit = defineEmits(['open-shikigami-select', 'open-yuhun-select', 'open-property-select']);

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

// 处理拖拽放置
const handleDrop = (event) => {
  event.preventDefault();
  
  try {
    // 获取拖拽数据
    const nodeData = JSON.parse(event.dataTransfer.getData('application/json'));
    
    // 获取画布元素
    const flowContainer = event.currentTarget;
    const bounds = flowContainer.getBoundingClientRect();
    
    // 获取画布的缩放和偏移信息
    const { x: viewportX, y: viewportY, zoom } = getViewport();
    
    // 计算相对于画布的位置，并考虑缩放和偏移
    const position = {
      x: (event.clientX - bounds.left - viewportX) / zoom,
      y: (event.clientY - bounds.top - viewportY) / zoom
    };
    
    // 创建新节点
    const newNode = {
      ...nodeData,
      position,
      selected: true // 设置节点为选中状态
    };
    
    // 添加节点
    handleAddNode(newNode);
  } catch (error) {
    console.error('拖拽放置处理失败:', error);
  }
};

// 处理拖拽悬停
const handleDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
};

// 处理添加节点
const handleAddNode = (newNode) => {
  // 取消所有现有节点的选中状态
  nodes.value.forEach(node => {
    if (node.selected) {
      updateNode(node.id, { selected: false });
    }
  });
  
  // 根据节点类型设置初始数据
  let initialData = {};
  switch (newNode.type) {
    case 'shikigamiSelect':
      initialData = {
        shikigami: { name: '未选择式神', avatar: '', rarity: '' }
      };
      break;
    case 'yuhunSelect':
      initialData = {
        yuhun: { name: '未选择御魂', avatar: '', type: '' }
      };
      break;
    case 'propertySelect':
      initialData = {
        property: {
          type: '未选择',
          priority: 'optional',
          description: '',
          value: 0,
          valueType: '',
          levelRequired: "40",
          skillRequiredMode: "all",
          skillRequired: ["5", "5", "5"],
          yuhun: {
            yuhunSetEffect: [],
            target: "1",
            property2: ["Attack"],
            property4: ["Attack"],
            property6: ["Crit", "CritDamage"],
          },
          expectedDamage: 0,
          survivalRate: 50,
          damageType: "balanced"
        }
      };
      break;
    case 'imageNode':
      initialData = {
        url: '',
        width: 180,
        height: 120
      };
      break;
    case 'textNode':
      initialData = {
        html: '<div>双击右侧可编辑文字</div>',
        width: 200,
        height: 120
      };
      break;
  }
  
  // 添加新节点，并设置为选中状态
  addNodes([{
    ...newNode,
    selected: true,
    data: {
      ...newNode.data,
      ...initialData
    }
  }]);
  
  // 重新设置视图，使新节点可见
  setTransform({ x: 0, y: 0, zoom: 1 });
};

// 处理从属性面板打开式神选择
const handleOpenShikigamiSelect = (node) => {
  emit('open-shikigami-select', node);
};

// 处理从属性面板打开御魂选择
const handleOpenYuhunSelect = (node) => {
  emit('open-yuhun-select', node);
};

// 处理从属性面板打开属性选择
const handleOpenPropertySelect = (node) => {
  emit('open-property-select', node);
};

onMounted(() => {
  console.log('FlowEditor 组件已挂载');
});
</script>

<template>
  <div class="flow-editor" :style="{ height }">
    <div class="editor-layout">
      <!-- 左侧组件面板 -->
      <div class="components-sidebar">
        <ComponentsPanel @add-node="handleAddNode" />
      </div>
      
      <!-- 中间流程图区域 -->
      <div class="flow-container">
        <VueFlow 
          :nodes="nodes"
          :edges="edges"
          @nodes-change="onNodesChange"
          @edges-change="onEdgesChange"
          @connect="onConnect"
          fit-view-on-init
          @drop="handleDrop"
          @dragover="handleDragOver"
        >
          <Background pattern-color="#aaa" gap="8" />
          <Controls />
          <Panel position="top-right" class="flow-panel">
            <div>流程图编辑器 (模仿 draw.io)</div>
          </Panel>
        </VueFlow>
      </div>
      
      <!-- 右侧属性面板 -->
      <PropertyPanel 
        :height="height" 
        @open-shikigami-select="handleOpenShikigamiSelect"
        @open-yuhun-select="handleOpenYuhunSelect"
        @open-property-select="handleOpenPropertySelect"
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

.components-sidebar {
  width: 230px;
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.flow-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}

:deep(.vue-flow__node) {
  padding: 10px;
  border-radius: 5px;
  background-color: white;
  border: 1px solid #1a192b;
  color: #333;
  text-align: center;
}

:deep(.vue-flow__node-input) {
  background-color: #f6fafd;
  border: 1px solid #66B1FF;
}

:deep(.flow-panel) {
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}
</style> 