<template>
  <div
    class="yys-editor-embed"
    :class="{ 'preview-mode': mode === 'preview', 'edit-mode': mode === 'edit' }"
    :style="containerStyle"
  >
    <!-- 编辑模式：完整 UI -->
    <template v-if="mode === 'edit'">
      <!-- 工具栏 -->
      <Toolbar
        v-if="showToolbar"
        :is-embed="true"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <!-- 主内容区 -->
      <div class="editor-content" :style="{ height: contentHeight }">
        <!-- 左侧组件库 -->
        <ComponentsPanel v-if="showComponentPanel" />

        <!-- 中间画布 + 右侧属性面板 -->
        <FlowEditor
          ref="flowEditorRef"
          :height="contentHeight"
        />
      </div>
    </template>

    <!-- 预览模式：只有画布（只读） -->
    <template v-else>
      <div class="preview-container" :style="{ height: containerHeight }">
        <div class="container" ref="previewContainerRef"></div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, provide } from 'vue'
import { createPinia } from 'pinia'
import LogicFlow from '@logicflow/core'
import '@logicflow/core/lib/style/index.css'
import { Snapshot, MiniMap, Control } from '@logicflow/extension'
import '@logicflow/extension/lib/style/index.css'

import FlowEditor from './components/flow/FlowEditor.vue'
import Toolbar from './components/Toolbar.vue'
import ComponentsPanel from './components/flow/ComponentsPanel.vue'
import { useFilesStore } from '@/ts/useStore'
import { setLogicFlowInstance, destroyLogicFlowInstance, getLogicFlowInstance } from '@/ts/useLogicFlow'
import { register } from '@logicflow/vue-node-registry'
import ImageNode from './components/flow/nodes/common/ImageNode.vue'
import AssetSelectorNode from './components/flow/nodes/common/AssetSelectorNode.vue'
import TextNode from './components/flow/nodes/common/TextNode.vue'
import TextNodeModel from './components/flow/nodes/common/TextNodeModel'
import VectorNode from './components/flow/nodes/common/VectorNode.vue'
import VectorNodeModel from './components/flow/nodes/common/VectorNodeModel'

// 类型定义
export interface GraphData {
  nodes: NodeData[]
  edges: EdgeData[]
}

export interface NodeData {
  id: string
  type: string
  x: number
  y: number
  properties?: Record<string, any>
  text?: { value: string }
}

export interface EdgeData {
  id: string
  type: string
  sourceNodeId: string
  targetNodeId: string
  properties?: Record<string, any>
}

export interface EditorConfig {
  grid?: boolean
  snapline?: boolean
  keyboard?: boolean
  theme?: 'light' | 'dark'
  locale?: 'zh' | 'ja' | 'en'
}

// Props
const props = withDefaults(defineProps<{
  data?: GraphData
  mode?: 'preview' | 'edit'
  width?: string | number
  height?: string | number
  showToolbar?: boolean
  showPropertyPanel?: boolean
  showComponentPanel?: boolean
  config?: EditorConfig
}>(), {
  mode: 'edit',
  width: '100%',
  height: '600px',
  showToolbar: true,
  showPropertyPanel: true,
  showComponentPanel: true,
  config: () => ({
    grid: true,
    snapline: true,
    keyboard: true,
    theme: 'light',
    locale: 'zh'
  })
})

// Emits
const emit = defineEmits<{
  'update:data': [data: GraphData]
  'save': [data: GraphData]
  'cancel': []
  'error': [error: Error]
}>()

// 创建局部 Pinia 实例（状态隔离）
const localPinia = createPinia()
provide('pinia', localPinia)

// Refs
const flowEditorRef = ref<InstanceType<typeof FlowEditor>>()
const previewContainerRef = ref<HTMLElement | null>(null)
const previewLf = ref<LogicFlow | null>(null)

// Computed
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

const containerHeight = computed(() => {
  return typeof props.height === 'number' ? `${props.height}px` : props.height
})

const contentHeight = computed(() => {
  if (props.showToolbar) {
    const toolbarHeight = 48
    const totalHeight = typeof props.height === 'number' ? props.height : 600
    return `${totalHeight - toolbarHeight}px`
  }
  return containerHeight.value
})

// 初始化预览模式的 LogicFlow
const initPreviewMode = () => {
  if (!previewContainerRef.value) return

  // 创建 LogicFlow 实例（只读模式）
  previewLf.value = new LogicFlow({
    container: previewContainerRef.value,
    width: previewContainerRef.value.offsetWidth,
    height: previewContainerRef.value.offsetHeight,
    grid: false,
    keyboard: {
      enabled: false
    },
    // 禁用所有交互
    isSilentMode: true,
    stopScrollGraph: true,
    stopZoomGraph: true,
    stopMoveGraph: true,
    adjustNodePosition: false,
    plugins: [Snapshot, MiniMap, Control]
  })

  // 注册自定义节点（必须在 LogicFlow 实例创建后）
  register({
    type: 'imageNode',
    component: ImageNode
  }, previewLf.value)
  register({
    type: 'assetSelector',
    component: AssetSelectorNode
  }, previewLf.value)
  register({
    type: 'textNode',
    component: TextNode,
    model: TextNodeModel
  }, previewLf.value)
  register({
    type: 'vectorNode',
    component: VectorNode,
    model: VectorNodeModel
  }, previewLf.value)

  // 渲染数据
  if (props.data) {
    previewLf.value.render(props.data)
  }
}

// Methods
const handleSave = () => {
  try {
    const data = getGraphData()
    if (data) {
      emit('save', data)
    }
  } catch (error) {
    emit('error', error as Error)
  }
}

const handleCancel = () => {
  emit('cancel')
}

// 公开方法（供父组件调用）
const getGraphData = (): GraphData | null => {
  if (props.mode === 'edit') {
    const lfInstance = getLogicFlowInstance()
    if (lfInstance) {
      return lfInstance.getGraphRawData() as GraphData
    }
  } else if (props.mode === 'preview' && previewLf.value) {
    return previewLf.value.getGraphRawData() as GraphData
  }
  return null
}

const setGraphData = (data: GraphData) => {
  if (props.mode === 'edit') {
    const lfInstance = getLogicFlowInstance()
    if (lfInstance) {
      lfInstance.render(data)
    }
  } else if (props.mode === 'preview' && previewLf.value) {
    previewLf.value.render(data)
  }
}

defineExpose({
  getGraphData,
  setGraphData
})

// 监听 data 变化
watch(() => props.data, (newData) => {
  if (newData) {
    setGraphData(newData)
  }
}, { deep: true })

// 监听模式变化
watch(() => props.mode, (newMode) => {
  if (newMode === 'preview') {
    // 切换到预览模式，初始化预览 LogicFlow
    setTimeout(() => {
      initPreviewMode()
    }, 100)
  }
})

// 初始化
onMounted(() => {
  if (props.mode === 'preview') {
    initPreviewMode()
  } else if (props.mode === 'edit') {
    // 编辑模式由 FlowEditor 组件初始化
    // 等待 FlowEditor 初始化完成后加载数据
    setTimeout(() => {
      if (props.data) {
        setGraphData(props.data)
      }
    }, 500)
  }
})

// 清理
onBeforeUnmount(() => {
  if (previewLf.value) {
    previewLf.value.destroy()
    previewLf.value = null
  }
  destroyLogicFlowInstance()
})
</script>

<style scoped>
.yys-editor-embed {
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
  position: relative;
}

.editor-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.preview-mode {
  background: transparent;
}

.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.preview-container .container {
  width: 100%;
  height: 100%;
}

/* 预览模式下隐藏所有控制元素 */
.preview-mode :deep(.lf-control),
.preview-mode :deep(.lf-mini-map),
.preview-mode :deep(.lf-menu) {
  display: none !important;
}

/* 预览模式下禁用鼠标交互 */
.preview-mode :deep(.lf-canvas-overlay) {
  pointer-events: none;
}
</style>
