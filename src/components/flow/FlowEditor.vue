<template>
  <div class="editor-layout" :style="{ height }">
    <!-- 中间流程图区域 -->
    <div class="flow-container">
      <div class="flow-controls">
        <div class="control-row toggles">
          <label class="control-toggle">
            <input type="checkbox" v-model="selectionEnabled" />
            <span>框选</span>
          </label>
          <label class="control-toggle">
            <input type="checkbox" v-model="snapGridEnabled" />
            <span>吸附网格</span>
          </label>
          <span class="control-hint">对齐线已开启</span>
          <span class="control-hint">已选 {{ selectedCount }}</span>
        </div>
        <div class="control-row">
          <div class="control-label">对齐</div>
          <div class="control-buttons">
            <button
              v-for="btn in alignmentButtons"
              :key="btn.key"
              class="control-button"
              type="button"
              :disabled="selectedCount < 2"
              @click="() => alignSelected(btn.key)"
            >
              {{ btn.label }}
            </button>
          </div>
        </div>
        <div class="control-row">
          <div class="control-label">分布</div>
          <div class="control-buttons">
            <button
              v-for="btn in distributeButtons"
              :key="btn.key"
              class="control-button"
              type="button"
              :disabled="selectedCount < 3"
              @click="() => distributeSelected(btn.key)"
            >
              {{ btn.label }}
            </button>
          </div>
        </div>
      </div>
      <div class="container" ref="containerRef" :style="{ height: '100%' }"></div>
    </div>
    <!-- 右侧属性面板 -->
    <PropertyPanel :height="height" :node="selectedNode" :lf="lf" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import LogicFlow, { EventType } from '@logicflow/core';
import type { Position, NodeData, EdgeData, BaseNodeModel, GraphModel } from '@logicflow/core';
import '@logicflow/core/lib/style/index.css';
import { Menu, Label, Snapshot, SelectionSelect } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css';
import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';

import { register } from '@logicflow/vue-node-registry';
import ShikigamiSelectNode from './nodes/yys/ShikigamiSelectNode.vue';
import YuhunSelectNode from './nodes/yys/YuhunSelectNode.vue';
import PropertySelectNode from './nodes/yys/PropertySelectNode.vue';
import ImageNode from './nodes/common/ImageNode.vue';
// import TextNode from './nodes/common/TextNode.vue';
import PropertyPanel from './PropertyPanel.vue';
import { useGlobalMessage } from '@/ts/useGlobalMessage';
import { setLogicFlowInstance, destroyLogicFlowInstance } from '@/ts/useLogicFlow';

type AlignType = 'left' | 'right' | 'top' | 'bottom' | 'hcenter' | 'vcenter';
type DistributeType = 'horizontal' | 'vertical';

const props = defineProps<{
  height?: string;
}>();

const containerRef = ref<HTMLElement | null>(null);
const lf = ref<LogicFlow | null>(null);
const selectedCount = ref(0);
const selectionEnabled = ref(true);
const snapGridEnabled = ref(true);
const alignmentButtons: { key: AlignType; label: string }[] = [
  { key: 'left', label: '左对齐' },
  { key: 'right', label: '右对齐' },
  { key: 'top', label: '上对齐' },
  { key: 'bottom', label: '下对齐' },
  { key: 'hcenter', label: '水平居中' },
  { key: 'vcenter', label: '垂直居中' }
];
const distributeButtons: { key: DistributeType; label: string }[] = [
  { key: 'horizontal', label: '水平等距' },
  { key: 'vertical', label: '垂直等距' }
];
const { showMessage } = useGlobalMessage();

// 当前选中节点
const selectedNode = ref<any>(null);

function updateSelectedCount(model?: GraphModel) {
  const lfInstance = lf.value;
  const graphModel = model ?? lfInstance?.graphModel;
  selectedCount.value = graphModel?.selectNodes.length ?? 0;
}

function applySelectionSelect(enabled: boolean) {
  const lfInstance = lf.value as any;
  if (!lfInstance) return;
  if (enabled) {
    lfInstance.openSelectionSelect?.();
  } else {
    lfInstance.closeSelectionSelect?.();
  }
}

function applySnapGrid(enabled: boolean) {
  const lfInstance = lf.value;
  if (!lfInstance) return;
  lfInstance.updateEditConfig({ snapGrid: enabled });
}

function getSelectedRects() {
  const lfInstance = lf.value;
  if (!lfInstance) return [];
  return lfInstance.graphModel.selectNodes.map((model: BaseNodeModel) => {
    const bounds = model.getBounds();
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    return {
      model,
      bounds,
      width,
      height,
      centerX: (bounds.maxX + bounds.minX) / 2,
      centerY: (bounds.maxY + bounds.minY) / 2
    };
  });
}

function alignSelected(direction: AlignType) {
  const rects = getSelectedRects();
  if (rects.length < 2) {
    showMessage('warning', '请选择至少两个节点再执行对齐');
    return;
  }

  const minX = Math.min(...rects.map((item) => item.bounds.minX));
  const maxX = Math.max(...rects.map((item) => item.bounds.maxX));
  const minY = Math.min(...rects.map((item) => item.bounds.minY));
  const maxY = Math.max(...rects.map((item) => item.bounds.maxY));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  rects.forEach(({ model, width, height }) => {
    let targetX = model.x;
    let targetY = model.y;

    switch (direction) {
      case 'left':
        targetX = minX + width / 2;
        break;
      case 'right':
        targetX = maxX - width / 2;
        break;
      case 'hcenter':
        targetX = centerX;
        break;
      case 'top':
        targetY = minY + height / 2;
        break;
      case 'bottom':
        targetY = maxY - height / 2;
        break;
      case 'vcenter':
        targetY = centerY;
        break;
    }

    model.moveTo(targetX, targetY);
  });
}

function distributeSelected(type: DistributeType) {
  const rects = getSelectedRects();
  if (rects.length < 3) {
    showMessage('warning', '请选择至少三个节点再执行分布');
    return;
  }

  const sorted = [...rects].sort((a, b) =>
    type === 'horizontal' ? a.bounds.minX - b.bounds.minX : a.bounds.minY - b.bounds.minY
  );
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  if (type === 'horizontal') {
    const totalWidth = sorted.reduce((sum, item) => sum + item.width, 0);
    const gap = (last.bounds.maxX - first.bounds.minX - totalWidth) / (sorted.length - 1);
    let cursor = first.bounds.minX + first.width;

    for (let i = 1; i < sorted.length - 1; i += 1) {
      cursor += gap;
      const item = sorted[i];
      item.model.moveTo(cursor + item.width / 2, item.centerY);
      cursor += item.width;
    }
  } else {
    const totalHeight = sorted.reduce((sum, item) => sum + item.height, 0);
    const gap = (last.bounds.maxY - first.bounds.minY - totalHeight) / (sorted.length - 1);
    let cursor = first.bounds.minY + first.height;

    for (let i = 1; i < sorted.length - 1; i += 1) {
      cursor += gap;
      const item = sorted[i];
      item.model.moveTo(item.centerX, cursor + item.height / 2);
      cursor += item.height;
    }
  }
}

// 注册自定义节点
function registerNodes(lfInstance: LogicFlow) {
  register({ type: 'shikigamiSelect', component: ShikigamiSelectNode }, lfInstance);
  register({ type: 'yuhunSelect', component: YuhunSelectNode }, lfInstance);
  register({ type: 'propertySelect', component: PropertySelectNode }, lfInstance);

  register({ type: 'imageNode', component: ImageNode }, lfInstance);
  // register({ type: 'textNode', component: TextNode }, lfInstance);
}

// 初始化 LogicFlow
onMounted(() => {
  lf.value = new LogicFlow({
    container: containerRef.value,
    grid: { type: 'dot', size: 10 },
    allowResize: true,
    allowRotate: true,
    overlapMode: -1,
    snapline: true,
    plugins: [Menu, Label, Snapshot, SelectionSelect],
    pluginsOptions: {
      label: {
        isMultiple: true,
        maxCount: 3,
        labelWidth: 80,
        // textOverflowMode -> 'ellipsis' | 'wrap' | 'clip' | 'nowrap' | 'default'
        textOverflowMode: 'wrap',
      },
    },
  });

  const lfInstance = lf.value;
  if (!lfInstance) return;

  lfInstance.extension.menu.addMenuConfig({
    nodeMenu: [
      {
        text: '置于顶层',
        callback(node: NodeData) {
          lfInstance.setElementZIndex(node.id, 'top');
          console.log('置顶' + lfInstance.getNodeModelById(node.id).zIndex);
        }
      },
      {
        text: '置于底层',
        callback(node: NodeData) {
          lfInstance.setElementZIndex(node.id, 'bottom');
          console.log('置底' + lfInstance.getNodeModelById(node.id).zIndex);
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
  lfInstance.updateEditConfig({
    multipleSelectKey: 'shift',
    snapGrid: snapGridEnabled.value
  });
  applySelectionSelect(selectionEnabled.value);
  updateSelectedCount(lfInstance.graphModel);

  // 监听节点点击事件，更新 selectedNode
  lfInstance.on(EventType.NODE_CLICK, ({ data }) => {
    selectedNode.value = data;
    updateSelectedCount();
  });

  // 监听空白点击事件，取消选中
  lfInstance.on(EventType.BLANK_CLICK, () => {
    selectedNode.value = null;
    updateSelectedCount();
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

  lfInstance.on('selection:selected', () => updateSelectedCount());
  lfInstance.on('selection:drop', () => updateSelectedCount());
});

watch(selectionEnabled, (enabled) => {
  applySelectionSelect(enabled);
});

watch(snapGridEnabled, (enabled) => {
  applySnapGrid(enabled);
});

// 销毁 LogicFlow
onBeforeUnmount(() => {
  lf.value?.destroy();
  lf.value = null;
  destroyLogicFlowInstance();
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
.flow-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  max-width: 460px;
  font-size: 12px;
}
.control-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}
.control-row:last-child {
  margin-bottom: 0;
}
.control-label {
  font-weight: 600;
  color: #303133;
}
.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.control-button {
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  color: #303133;
}
.control-button:hover:enabled {
  background: #f5f7fa;
}
.control-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.control-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
}
.control-hint {
  color: #909399;
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
