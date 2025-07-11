<template>
  <div class="container" ref="containerRef" :style="{ height }"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, defineExpose } from 'vue';
import type { PropType } from 'vue';
import LogicFlow from '@logicflow/core';
import '@logicflow/core/lib/style/index.css';

// 类型定义放在 import 之后，避免顶层 await 错误

type NodeData = {
  id: string;
  type: string;
  x: number;
  y: number;
  text?: string;
  properties?: Record<string, any>;
};

type EdgeData = {
  id: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  properties?: Record<string, any>;
};

type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

const props = defineProps<{
  nodes: NodeData[];
  edges: EdgeData[];
  viewport?: Viewport;
  height?: string;
}>();

const containerRef = ref<HTMLElement | null>(null);
let lf: LogicFlow | null = null;

// 初始化 LogicFlow
onMounted(() => {
  lf = new LogicFlow({
    container: containerRef.value as HTMLElement,
    grid: true,
  });
  // lf.zoom(2);
  // zoom(2);
  renderFlow();


  // if (props.viewport) setViewport(props.viewport);
});

// 销毁 LogicFlow
onBeforeUnmount(() => {
  lf?.destroy();
  lf = null;
});

// 响应式更新 nodes/edges
watch(
  () => [props.nodes, props.edges],
  () => {
    renderFlow();
  },
  { deep: true }
);

// 响应式更新 viewport
watch(
  () => props.viewport,
  (val) => {
    if (val) setViewport(val);
  }
);

function renderFlow() {
  if (!lf) return;
  lf.render({
    nodes: props.nodes,
    edges: props.edges,
  });
}

function setViewport(viewport: Viewport) {
  if (!lf || !viewport) return;
  lf.zoom(viewport.zoom);
  // lf.focusOn({ x: viewport.x, y: viewport.y });
}

function getViewport(): Viewport {
  if (!lf) return { x: 0, y: 0, zoom: 1 };
  const t = lf.getTransform();
  return {
    x: t.TRANSLATE_X,
    y: t.TRANSLATE_Y,
    zoom: t.SCALE_X
  };
}

function handleAddNode(node: NodeData) {
  if (!lf) return;
  lf.addNode(node);
}

function getGraphRawData() {
  if (!lf) return null;
  return lf.getGraphRawData();
}

function renderRawData(data: any) {
  if (!lf) return;
  lf.renderRawData(data);
}

defineExpose({
  getViewport,
  setViewport, // 新增暴露
  handleAddNode,
  getGraphRawData,
  renderRawData,
});
</script>

<style scoped>
.container {
  width: 100%;
  min-height: 300px;
  background: #fff;
}
</style>