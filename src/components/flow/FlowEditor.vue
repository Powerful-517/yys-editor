<template>
  <div class="editor-layout" :style="{ height }">
    <!-- 中间流程图区域 -->
    <div class="flow-container">
      <div class="container" ref="containerRef" :style="{ height: '100%' }"></div>
    </div>
    <!-- 右侧属性面板 -->
    <PropertyPanel :height="height" :node="selectedNode" :lf="lf" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, defineExpose } from 'vue';
import LogicFlow, { EventType } from '@logicflow/core';
import '@logicflow/core/lib/style/index.css';
import { Menu } from "@logicflow/extension";
import "@logicflow/extension/lib/style/index.css";

import { register } from '@logicflow/vue-node-registry';
import ShikigamiSelectNode from './nodes/yys/ShikigamiSelectNode.vue';
import YuhunSelectNode from './nodes/yys/YuhunSelectNode.vue';
import PropertySelectNode from './nodes/yys/PropertySelectNode.vue';
// import ImageNode from './nodes/common/ImageNode.vue';
// import TextNode from './nodes/common/TextNode.vue';
import PropertyPanel from './PropertyPanel.vue';
import { useFilesStore } from "@/ts/useStore";
import { setLogicFlowInstance, destroyLogicFlowInstance } from '@/ts/useLogicFlow';
import Position = LogicFlow.Position;
import NodeData = LogicFlow.NodeData;
import EdgeData = LogicFlow.EdgeData;

const props = defineProps<{
  height?: string;
}>();

const containerRef = ref<HTMLElement | null>(null);
const lf = ref<LogicFlow | null>(null);

// 右键菜单相关
const contextMenu = ref({
  show: false,
  x: 0,
  y: 0,
  nodeId: null
});

// 当前选中节点
const selectedNode = ref<any>(null);

// 注册自定义节点
function registerNodes(lfInstance: LogicFlow) {
  register({ type: 'shikigamiSelect', component: ShikigamiSelectNode }, lfInstance);
  register({ type: 'yuhunSelect', component: YuhunSelectNode }, lfInstance);
  register({ type: 'propertySelect', component: PropertySelectNode }, lfInstance);

  // register({ type: 'imageNode', component: ImageNode }, lfInstance);
  // register({ type: 'textNode', component: TextNode }, lfInstance);
}

// 初始化 LogicFlow
onMounted(() => {
  lf.value = new LogicFlow({
    container: containerRef.value,
    // container: document.querySelector('#container'),
    grid: true,
    allowResize: true,
    allowRotate: true,
    plugins: [Menu],
    overlapMode:-1
  });

  const lfInstance = lf.value;
  if (!lfInstance) return;

  lfInstance.extension.menu.addMenuConfig({
    nodeMenu: [
      {
        text: '置于顶层',
        callback(node: NodeData) {
          console.log(lfInstance.getNodeModelById(node.id).zIndex)
          lfInstance.setElementZIndex(node.id, 'top');
        }
      },
      {
        text: '置于底层',
        callback(node: NodeData) {
          console.log(lfInstance.getNodeModelById(node.id).zIndex)
          lfInstance.setElementZIndex(node.id, 'bottom');
        }
      },
      {
        text: '删除节点',
        callback(node: NodeData) {
          lfInstance.deleteNode(node.id);
        }
      }
    ],
    edgeMenu: [
      {
        text: '删除边',
        callback(edge: EdgeData) {
          lfInstance.deleteEdge(edge.id);
        }
      }
    ],
    graphMenu: [
      {
        text: '添加节点',
        callback(data: Position) {
          lfInstance.addNode({
            type: 'rect',
            x: data.x,
            y: data.y
          });
        }
      }
    ]
  });

  registerNodes(lfInstance);
  setLogicFlowInstance(lfInstance);
  lfInstance.render({
    // 渲染的数据
  });

  // 监听节点点击事件，更新 selectedNode
  lfInstance.on(EventType.NODE_CLICK, ({ data }) => {
    selectedNode.value = data;
  });

  // 监听空白点击事件，取消选中
  lfInstance.on(EventType.BLANK_CLICK, () => {
    selectedNode.value = null;
  });

  // 节点属性改变，如果当前节点是选中节点，则同步更新 selectedNode
  lfInstance.on(EventType.NODE_PROPERTIES_CHANGE, (data) => {
    const nodeId = data.id;
    if (selectedNode.value && nodeId === selectedNode.value.id) {
      if (data.properties) {
        selectedNode.value = {
          ...selectedNode.value,
          properties: data.properties
        };
      }
    }
  });
});

// 销毁 LogicFlow
onBeforeUnmount(() => {
  lf.value?.destroy();
  lf.value = null;
  destroyLogicFlowInstance();
});




// 右键菜单相关
function handleNodeContextMenu({ data, e }: { data: any; e: MouseEvent }) {
  e.preventDefault();
  e.stopPropagation();
  contextMenu.value = {
    show: true,
    x: e.clientX,
    y: e.clientY,
    nodeId: data.id
  };
}
function handlePaneContextMenu({ e }: { e: MouseEvent }) {
  e.preventDefault();
  e.stopPropagation();
  contextMenu.value.show = false;
}


</script>

<style scoped>
.editor-layout {
  display: flex;
  height: 100%;
}
.flow-container {
  flex: 1;
  position: relative;
  overflow: hidden;
}
.container {
  width: 100%;
  min-height: 300px;
  background: #fff;
  height: 100%;
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