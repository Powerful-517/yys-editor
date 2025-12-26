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
import type { Position, NodeData, EdgeData, BaseNodeModel, GraphModel, GraphData } from '@logicflow/core';
import '@logicflow/core/lib/style/index.css';
import { Menu, Label, Snapshot, SelectionSelect } from '@logicflow/extension';
import '@logicflow/extension/lib/style/index.css';
import '@logicflow/core/es/index.css';
import '@logicflow/extension/es/index.css';
import { translateEdgeData, translateNodeData } from '@logicflow/core/es/keyboard/shortcut';

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

const MOVE_STEP = 2;
const MOVE_STEP_LARGE = 10;
const COPY_TRANSLATION = 40;

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
const copyBuffer = ref<GraphData | null>(null);
let nextPasteDistance = COPY_TRANSLATION;

function isInputLike(event?: KeyboardEvent) {
  const target = event?.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName?.toLowerCase();
  return ['input', 'textarea', 'select', 'option'].includes(tag) || target.isContentEditable;
}

function shouldSkipShortcut(event?: KeyboardEvent) {
  const lfInstance = lf.value as any;
  if (!lfInstance) return true;
  if (lfInstance.keyboard?.disabled) return true;
  if (lfInstance.graphModel?.textEditElement) return true;
  if (isInputLike(event)) return true;
  return false;
}

function ensureMeta(meta?: Record<string, any>) {
  const next: Record<string, any> = meta ? { ...meta } : {};
  if (next.visible == null) next.visible = true;
  if (next.locked == null) next.locked = false;
  return next;
}

function applyMetaToModel(model: BaseNodeModel, metaInput?: Record<string, any>) {
  const lfInstance = lf.value;
  const meta = ensureMeta(metaInput ?? (model.getProperties?.() as any)?.meta ?? (model as any)?.properties?.meta);
  model.visible = meta.visible !== false;
  model.draggable = !meta.locked;
  model.setHittable?.(!meta.locked);
  model.setHitable?.(!meta.locked);
  model.setIsShowAnchor?.(!meta.locked);
  model.setRotatable?.(!meta.locked);
  model.setResizable?.(!meta.locked);

  if (lfInstance) {
    const connectedEdges = lfInstance.getNodeEdges(model.id);
    connectedEdges.forEach((edgeModel) => {
      edgeModel.visible = meta.visible !== false;
    });
  }
}

function normalizeNodeModel(model: BaseNodeModel) {
  const lfInstance = lf.value;
  if (!lfInstance) return;

  const props = (model.getProperties?.() as any) ?? (model as any)?.properties ?? {};
  const incomingMeta = ensureMeta(props.meta);
  const currentMeta = ensureMeta((model as any)?.properties?.meta);
  const needPersist =
    currentMeta.visible !== incomingMeta.visible ||
    currentMeta.locked !== incomingMeta.locked ||
    currentMeta.groupId !== incomingMeta.groupId;

  if (needPersist) {
    lfInstance.setProperties(model.id, { ...props, meta: incomingMeta });
  }
  applyMetaToModel(model, incomingMeta);
}

function normalizeAllNodes() {
  const lfInstance = lf.value;
  if (!lfInstance) return;
  lfInstance.graphModel?.nodes.forEach((model: BaseNodeModel) => normalizeNodeModel(model));
}

function updateNodeMeta(model: BaseNodeModel, updater: (meta: Record<string, any>) => Record<string, any>) {
  const lfInstance = lf.value;
  if (!lfInstance) return;
  const props = (model.getProperties?.() as any) ?? (model as any)?.properties ?? {};
  const nextMeta = updater(ensureMeta(props.meta));
  lfInstance.setProperties(model.id, { ...props, meta: nextMeta });
  applyMetaToModel(model, nextMeta);
}

function getSelectedNodeModels() {
  const graphModel = lf.value?.graphModel;
  if (!graphModel) return [];
  return [...graphModel.selectNodes];
}

function collectGroupNodeIds(models: BaseNodeModel[]) {
  const graphModel = lf.value?.graphModel;
  if (!graphModel) return [];
  const ids = new Set<string>();
  models.forEach((model) => {
    const meta = ensureMeta((model.getProperties?.() as any)?.meta ?? (model as any)?.properties?.meta);
    if (meta.locked) return;
    if (meta.groupId) {
      graphModel.nodes.forEach((node) => {
        const peerMeta = ensureMeta((node.getProperties?.() as any)?.meta ?? (node as any)?.properties?.meta);
        if (peerMeta.groupId === meta.groupId && !peerMeta.locked) {
          ids.add(node.id);
        }
      });
    } else {
      ids.add(model.id);
    }
  });
  return Array.from(ids);
}

function moveSelectedNodes(deltaX: number, deltaY: number) {
  const graphModel = lf.value?.graphModel;
  if (!graphModel) return;
  const targets = collectGroupNodeIds(getSelectedNodeModels());
  if (!targets.length) return;
  graphModel.moveNodes(targets, deltaX, deltaY);
}

function deleteSelectedElements(event?: KeyboardEvent) {
  if (shouldSkipShortcut(event)) return true;
  const lfInstance = lf.value;
  if (!lfInstance) return true;

  const { nodes, edges } = lfInstance.getSelectElements(true);
  const lockedNodes = nodes.filter((node) => ensureMeta((node as any).properties?.meta).locked);
  edges.forEach((edge) => edge.id && lfInstance.deleteEdge(edge.id));
  nodes
    .filter((node) => {
      const meta = ensureMeta((node as any).properties?.meta);
      return !meta.locked && meta.visible !== false;
    })
    .forEach((node) => node.id && lfInstance.deleteNode(node.id));

  if (lockedNodes.length) {
    showMessage('warning', '部分节点已锁定，未删除');
  }
  updateSelectedCount();
  selectedNode.value = null;
  return false;
}

function toggleLockSelected(event?: KeyboardEvent) {
  if (shouldSkipShortcut(event)) return true;
  const models = getSelectedNodeModels();
  if (!models.length) {
    showMessage('info', '请选择节点后再执行锁定/解锁');
    return true;
  }
  const hasUnlocked = models.some((model) => !ensureMeta((model.getProperties?.() as any)?.meta).locked);
  models.forEach((model) => {
    updateNodeMeta(model, (meta) => ({ ...meta, locked: hasUnlocked ? true : false }));
  });
  return false;
}

function toggleVisibilitySelected(event?: KeyboardEvent) {
  if (shouldSkipShortcut(event)) return true;
  const models = getSelectedNodeModels();
  if (!models.length) {
    showMessage('info', '请选择节点后再执行显示/隐藏');
    return true;
  }
  const hasVisible = models.some((model) => ensureMeta((model.getProperties?.() as any)?.meta).visible !== false);
  models.forEach((model) => {
    updateNodeMeta(model, (meta) => ({ ...meta, visible: !hasVisible ? true : false }));
  });
  if (hasVisible) {
    selectedNode.value = null;
  }
  updateSelectedCount();
  return false;
}

function groupSelectedNodes(event?: KeyboardEvent) {
  if (shouldSkipShortcut(event)) return true;
  const models = getSelectedNodeModels().filter((model) => !ensureMeta((model.getProperties?.() as any)?.meta).locked);
  if (models.length < 2) {
    showMessage('warning', '请选择至少两个未锁定的节点进行分组');
    return true;
  }
  const groupId = `group_${Date.now().toString(36)}`;
  models.forEach((model) => {
    updateNodeMeta(model, (meta) => ({ ...meta, groupId }));
  });
  return false;
}

function ungroupSelectedNodes(event?: KeyboardEvent) {
  if (shouldSkipShortcut(event)) return true;
  const models = getSelectedNodeModels();
  if (!models.length) {
    showMessage('info', '请选择节点后再执行解组');
    return true;
  }
  models.forEach((model) => {
    updateNodeMeta(model, (meta) => {
      const nextMeta = { ...meta };
      delete nextMeta.groupId;
      return nextMeta;
    });
  });
  return false;
}

function handleArrowMove(direction: 'left' | 'right' | 'up' | 'down', event?: KeyboardEvent) {
  if (shouldSkipShortcut(event)) return true;
  const step = (event?.shiftKey ? MOVE_STEP_LARGE : MOVE_STEP) * (direction === 'left' || direction === 'up' ? -1 : 1);
  if (direction === 'left' || direction === 'right') {
    moveSelectedNodes(step, 0);
  } else {
    moveSelectedNodes(0, step);
  }
  return false;
}

function remapGroupIds(nodes: GraphData['nodes']) {
  const map = new Map<string, string>();
  const seed = Date.now().toString(36);
  nodes.forEach((node, index) => {
    const meta = ensureMeta((node as any).properties?.meta);
    if (meta.groupId) {
      if (!map.has(meta.groupId)) {
        map.set(meta.groupId, `group_${seed}_${index}`);
      }
      meta.groupId = map.get(meta.groupId);
    }
    (node as any).properties = { ...(node as any).properties, meta };
  });
}

function handleCopy(event?: KeyboardEvent) {
  if (shouldSkipShortcut(event)) return true;
  const lfInstance = lf.value;
  if (!lfInstance) return true;
  const elements = lfInstance.getSelectElements(false);
  if (!elements.nodes.length && !elements.edges.length) {
    copyBuffer.value = null;
    return true;
  }
  const nodes = elements.nodes.map((node) => translateNodeData(JSON.parse(JSON.stringify(node)), COPY_TRANSLATION));
  const edges = elements.edges.map((edge) => translateEdgeData(JSON.parse(JSON.stringify(edge)), COPY_TRANSLATION));
  remapGroupIds(nodes);
  copyBuffer.value = { nodes, edges };
  nextPasteDistance = COPY_TRANSLATION;
  return false;
}

function handlePaste(event?: KeyboardEvent) {
  if (shouldSkipShortcut(event)) return true;
  const lfInstance = lf.value;
  if (!lfInstance || !copyBuffer.value) return true;

  lfInstance.clearSelectElements();
  const added = lfInstance.addElements(copyBuffer.value, nextPasteDistance);
  if (added) {
    added.nodes.forEach((model) => {
      normalizeNodeModel(model);
      lfInstance.selectElementById(model.id, true);
    });
    added.edges.forEach((edge) => lfInstance.selectElementById(edge.id, true));
    copyBuffer.value.nodes.forEach((node) => translateNodeData(node, COPY_TRANSLATION));
    copyBuffer.value.edges.forEach((edge) => translateEdgeData(edge, COPY_TRANSLATION));
    nextPasteDistance += COPY_TRANSLATION;
    updateSelectedCount(lfInstance.graphModel);
  }
  return false;
}

function handleNodeDrag(args: { data: NodeData; deltaX: number; deltaY: number }) {
  const { data, deltaX, deltaY } = args;
  if (!deltaX && !deltaY) return;
  const graphModel = lf.value?.graphModel;
  if (!graphModel) return;
  const model = graphModel.getNodeModelById(data.id);
  if (!model) return;
  const targets = collectGroupNodeIds([model]).filter((id) => id !== model.id);
  if (!targets.length) return;
  graphModel.moveNodes(targets, deltaX, deltaY);
}

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
  const unlocked = lfInstance.graphModel.selectNodes.filter((model: BaseNodeModel) => {
    const meta = ensureMeta((model.getProperties?.() as any)?.meta ?? (model as any)?.properties?.meta);
    return !meta.locked && meta.visible !== false;
  });
  return unlocked.map((model: BaseNodeModel) => {
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
    keyboard: {
      enabled: true
    },
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

  lfInstance.keyboard.off(['cmd + c', 'ctrl + c']);
  lfInstance.keyboard.off(['cmd + v', 'ctrl + v']);
  lfInstance.keyboard.off(['backspace']);

  const bindShortcut = (keys: string | string[], handler: (event?: KeyboardEvent) => boolean | void) => {
    lfInstance.keyboard.on(keys, (event: KeyboardEvent) => handler(event));
  };

  bindShortcut(['del', 'backspace'], deleteSelectedElements);
  bindShortcut(['left'], (event) => handleArrowMove('left', event));
  bindShortcut(['right'], (event) => handleArrowMove('right', event));
  bindShortcut(['up'], (event) => handleArrowMove('up', event));
  bindShortcut(['down'], (event) => handleArrowMove('down', event));
  bindShortcut(['cmd + c', 'ctrl + c'], handleCopy);
  bindShortcut(['cmd + v', 'ctrl + v'], handlePaste);
  bindShortcut(['cmd + g', 'ctrl + g'], groupSelectedNodes);
  bindShortcut(['cmd + u', 'ctrl + u'], ungroupSelectedNodes);
  bindShortcut(['cmd + l', 'ctrl + l'], toggleLockSelected);
  bindShortcut(['cmd + shift + h', 'ctrl + shift + h'], toggleVisibilitySelected);

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
  normalizeAllNodes();
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

  lfInstance.on(EventType.NODE_DRAG, (args) => handleNodeDrag(args as any));

  lfInstance.on(EventType.NODE_ADD, ({ data }) => {
    const model = lfInstance.getNodeModelById(data.id);
    if (model) normalizeNodeModel(model);
  });

  lfInstance.on(EventType.GRAPH_RENDERED, () => normalizeAllNodes());

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
    const model = lfInstance.getNodeModelById(nodeId);
    if (model && data.properties?.meta) {
      applyMetaToModel(model, data.properties.meta);
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
