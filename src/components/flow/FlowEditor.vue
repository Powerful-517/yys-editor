<template>
  <div class="editor-layout" :style="{ height }">
    <!-- 中间流程图区域 -->
    <div class="flow-container">
      <div class="container" ref="containerRef" :style="{ height: '100%' }"></div>
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
    <PropertyPanel :height="height" :node="selectedNode" :lf="lf" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, defineExpose } from 'vue';
import LogicFlow, { EventType } from '@logicflow/core';
import '@logicflow/core/lib/style/index.css';
import { register } from '@logicflow/vue-node-registry';
import ShikigamiSelectNode from './nodes/yys/ShikigamiSelectNode.vue';
import YuhunSelectNode from './nodes/yys/YuhunSelectNode.vue';
import PropertySelectNode from './nodes/yys/PropertySelectNode.vue';
// import ImageNode from './nodes/common/ImageNode.vue';
// import TextNode from './nodes/common/TextNode.vue';
import PropertyPanel from './PropertyPanel.vue';
import {useFilesStore} from "@/ts/useStore";

const props = defineProps<{
  nodes: any[];
  edges: any[];
  viewport?: { x: number; y: number; zoom: number };
  height?: string;
}>();

const filesStore = useFilesStore();
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
    container: containerRef.value as HTMLElement,
    grid: true,
  });
  registerNodes(lf.value);
  renderFlow();
  filesStore.setLogicFlowInstance(lf.value);

  // 监听节点点击事件，更新 selectedNode
  lf.value.on(EventType.NODE_CLICK, ({ data }) => {
    selectedNode.value = data;
  });

  // 监听空白点击事件，取消选中
  lf.value.on(EventType.BLANK_CLICK, () => {
    selectedNode.value = null;
  });

  // 节点属性改变，如果当前节点是选中节点，则同步更新 selectedNode
  lf.value.on(EventType.NODE_PROPERTIES_CHANGE, (data) => {
  const nodeId = data.id || (data.value && data.value.id);
  if (selectedNode.value && nodeId === selectedNode.value.id) {
    if (data.value) {
      selectedNode.value = data.value;
    } else if (data.properties) {
      selectedNode.value = {
        ...selectedNode.value,
        properties: data.properties
      };
    }
  }
});

  // 右键事件
  lf.value.on('node:contextmenu', handleNodeContextMenu);
  lf.value.on('blank:contextmenu', handlePaneContextMenu);
});

// 销毁 LogicFlow
onBeforeUnmount(() => {
  lf.value?.destroy();
  lf.value = null;
});

// 响应式更新 nodes/edges
// watch(
//     () => [props.nodes, props.edges],
//     () => {
//       renderFlow();
//     },
//     { deep: true }
// );

// 响应式更新 viewport
watch(
    () => props.viewport,
    (val) => {
      if (val) setViewport(val);
    }
);

function renderFlow() {
  if (!lf.value) return;
  lf.value.render({
    nodes: props.nodes,
    edges: props.edges,
  });
}

function setViewport(viewport?: { x: number; y: number; zoom: number }) {
  if (!lf.value || !viewport) return;
  lf.value.zoom(viewport.zoom);
  // lf.value.focusOn({ x: viewport.x, y: viewport.y });
}

function getViewport() {
  if (!lf.value) return { x: 0, y: 0, zoom: 1 };
  const t = lf.value.getTransform();
  return {
    x: t.TRANSLATE_X,
    y: t.TRANSLATE_Y,
    zoom: t.SCALE_X
  };
}

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
function handleLayerOrder(action: string) {
  // 这里需要结合你的 store 或数据结构实现节点顺序调整
  contextMenu.value.show = false;
}

function getGraphRawData() {
  if (!lf) return null;
  return lf.value.getGraphRawData();
}

function renderRawData(data: any) {
  if (!lf) return;
  lf.value.renderRawData(data);
}

defineExpose({
  getViewport,
  setViewport,
  renderFlow,
  getGraphRawData,
  renderRawData,
});
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