<template>
  <div
    ref="embedRootRef"
    class="yys-editor-embed"
    :class="{ 'preview-mode': mode === 'preview', 'edit-mode': mode === 'edit' }"
    :style="containerStyle"
  >
    <!-- 编辑模式：完整 UI -->
    <template v-if="mode === 'edit'">
      <!-- 工具栏 -->
      <div v-if="showToolbar" ref="toolbarHostRef" class="toolbar-host">
        <Toolbar
          :is-embed="true"
          :pinia-instance="localPinia"
          @save="handleSave"
          @cancel="handleCancel"
        />
      </div>

      <!-- 主内容区 -->
      <div class="editor-content" :style="editorContentStyle">
        <!-- 左侧组件库 -->
        <ComponentsPanel v-if="showComponentPanel" />

        <!-- 中间画布 + 右侧属性面板 -->
        <FlowEditor
          class="flow-editor-pane"
          ref="flowEditorRef"
          :height="editorContentHeight"
          :enable-label="false"
        />
      </div>

      <DialogManager />
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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, getCurrentInstance } from 'vue'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import LogicFlow from '@logicflow/core'
import '@logicflow/core/lib/style/index.css'
import '@logicflow/extension/lib/style/index.css'

import FlowEditor from './components/flow/FlowEditor.vue'
import Toolbar from './components/Toolbar.vue'
import ComponentsPanel from './components/flow/ComponentsPanel.vue'
import DialogManager from './components/DialogManager.vue'
import { useFilesStore } from '@/ts/useStore'
import { setLogicFlowInstance, destroyLogicFlowInstance, getLogicFlowInstance } from '@/ts/useLogicFlow'
import {
  registerFlowNodes,
  resolveFlowPlugins,
  type FlowCapabilityLevel,
  type FlowNodeRegistration,
  type FlowPlugin
} from './flowRuntime'

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

const isPlainObject = (input: unknown): input is Record<string, any> => (
  !!input && typeof input === 'object' && !Array.isArray(input)
)

const sanitizeLabelProperty = (properties: unknown): Record<string, any> | undefined => {
  if (!isPlainObject(properties)) {
    return undefined
  }
  const nextProperties: Record<string, any> = { ...properties }
  if (Array.isArray(nextProperties._label)) {
    const normalizedLabels = nextProperties._label.filter((label: any) => (
      isPlainObject(label) && (label.id != null || label.text != null || label.value != null || label.content != null)
    ))
    if (normalizedLabels.length === 0) {
      delete nextProperties._label
    } else {
      nextProperties._label = normalizedLabels
    }
  }
  return nextProperties
}

const sanitizeGraphData = (input?: GraphData | null): GraphData => {
  if (!input || !Array.isArray(input.nodes) || !Array.isArray(input.edges)) {
    return { nodes: [], edges: [] }
  }

  const nodes = input.nodes
    .filter((node): node is NodeData => isPlainObject(node))
    .map((node) => {
      const nextNode: NodeData = { ...node }
      const nextProperties = sanitizeLabelProperty(nextNode.properties)
      if (nextProperties) {
        nextNode.properties = nextProperties
      }
      return nextNode
    })

  const edges = input.edges
    .filter((edge): edge is EdgeData => isPlainObject(edge))
    .map((edge) => {
      const nextEdge: EdgeData = { ...edge }
      const nextProperties = sanitizeLabelProperty(nextEdge.properties)
      if (nextProperties) {
        nextEdge.properties = nextProperties
      }
      return nextEdge
    })

  return { nodes, edges }
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
  capability?: FlowCapabilityLevel
  width?: string | number
  height?: string | number
  showToolbar?: boolean
  showPropertyPanel?: boolean
  showComponentPanel?: boolean
  config?: EditorConfig
  plugins?: FlowPlugin[]
  nodeRegistrations?: FlowNodeRegistration[]
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
setActivePinia(localPinia)

const ensureElementPlusInstalled = () => {
  const instance = getCurrentInstance()
  const app = instance?.appContext?.app as any
  if (!app) return

  const installedPlugins = app._context?.plugins
  if (installedPlugins?.has?.(ElementPlus)) {
    return
  }

  try {
    app.use(ElementPlus)
  } catch {
    // 忽略重复安装或宿主限制导致的异常
  }
}
ensureElementPlusInstalled()

// Refs
const flowEditorRef = ref<InstanceType<typeof FlowEditor>>()
const previewContainerRef = ref<HTMLElement | null>(null)
const previewLf = ref<LogicFlow | null>(null)
const embedRootRef = ref<HTMLElement | null>(null)
const toolbarHostRef = ref<HTMLElement | null>(null)
let embedResizeObserver: ResizeObserver | null = null
const editorContentHeight = ref('100%')

// Computed
const effectiveCapability = computed<FlowCapabilityLevel>(() => {
  if (props.capability) {
    return props.capability
  }
  return props.mode === 'preview' ? 'render-only' : 'interactive'
})

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

const containerHeight = computed(() => {
  return typeof props.height === 'number' ? `${props.height}px` : props.height
})

const editorContentStyle = computed(() => ({
  height: editorContentHeight.value
}))

const recalcEditContentHeight = () => {
  if (props.mode !== 'edit') {
    return
  }
  const root = embedRootRef.value
  if (!root) {
    return
  }
  const rootHeight = root.clientHeight
  const toolbarHeight = props.showToolbar ? (toolbarHostRef.value?.offsetHeight ?? 0) : 0
  const contentHeight = Math.max(0, rootHeight - toolbarHeight)
  if (contentHeight > 0) {
    editorContentHeight.value = `${contentHeight}px`
  } else {
    editorContentHeight.value = '100%'
  }
}

const triggerEditorResize = () => {
  nextTick(() => {
    recalcEditContentHeight()
    const editor = flowEditorRef.value as any
    editor?.resizeCanvas?.()
  })
}

const handleEmbedResize = () => {
  if (props.mode === 'edit') {
    recalcEditContentHeight()
    triggerEditorResize()
    return
  }

  if (props.mode === 'preview' && previewLf.value && previewContainerRef.value) {
    const width = previewContainerRef.value.offsetWidth
    const height = previewContainerRef.value.offsetHeight
    previewLf.value.resize(width, height)
  }
}

const setupEmbedResizeObserver = () => {
  if (typeof ResizeObserver === 'undefined' || !embedRootRef.value) {
    return
  }

  embedResizeObserver?.disconnect()
  embedResizeObserver = new ResizeObserver(() => {
    handleEmbedResize()
  })
  embedResizeObserver.observe(embedRootRef.value)
}

const destroyPreviewMode = () => {
  if (previewLf.value) {
    previewLf.value.destroy()
    previewLf.value = null
  }
}

// 初始化预览模式的 LogicFlow
const initPreviewMode = () => {
  if (!previewContainerRef.value) return

  destroyPreviewMode()
  const isRenderOnly = effectiveCapability.value === 'render-only'

  // 创建 LogicFlow 实例（只读模式）
  previewLf.value = new LogicFlow({
    container: previewContainerRef.value,
    width: previewContainerRef.value.offsetWidth,
    height: previewContainerRef.value.offsetHeight,
    grid: false,
    keyboard: {
      enabled: !isRenderOnly
    },
    // render-only 模式禁用所有交互能力
    isSilentMode: isRenderOnly,
    stopScrollGraph: isRenderOnly,
    stopZoomGraph: isRenderOnly,
    stopMoveGraph: isRenderOnly,
    adjustNodePosition: !isRenderOnly,
    plugins: resolveFlowPlugins(effectiveCapability.value, props.plugins)
  })

  // 注册节点（支持外部注入）
  registerFlowNodes(previewLf.value, props.nodeRegistrations)

  // 渲染数据
  if (props.data) {
    previewLf.value.render(sanitizeGraphData(props.data))
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
  const safeData = sanitizeGraphData(data)
  if (props.mode === 'edit') {
    const lfInstance = getLogicFlowInstance()
    if (lfInstance) {
      lfInstance.render(safeData)
    }
  } else if (props.mode === 'preview' && previewLf.value) {
    previewLf.value.render(safeData)
  }
}

defineExpose({
  getGraphData,
  setGraphData,
  resizeCanvas: triggerEditorResize
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
  } else {
    destroyPreviewMode()
    recalcEditContentHeight()
    triggerEditorResize()
  }
  setupEmbedResizeObserver()
})

watch(
  [() => props.capability, () => props.plugins, () => props.nodeRegistrations],
  () => {
    if (props.mode === 'preview') {
      setTimeout(() => {
        initPreviewMode()
      }, 0)
    }
  },
  { deep: true }
)

watch(
  [() => props.width, () => props.height, () => props.showToolbar, () => props.showComponentPanel],
  () => {
    if (props.mode === 'edit') {
      recalcEditContentHeight()
      triggerEditorResize()
    }
  }
)

// 初始化
onMounted(() => {
  setupEmbedResizeObserver()
  if (props.mode === 'preview') {
    initPreviewMode()
  } else if (props.mode === 'edit') {
    recalcEditContentHeight()
    triggerEditorResize()
    // 编辑模式由 FlowEditor 组件初始化
    // 等待 FlowEditor 初始化完成后加载数据
    setTimeout(() => {
      if (props.data) {
        setGraphData(props.data)
      }
      recalcEditContentHeight()
      triggerEditorResize()
    }, 500)
  }
})

// 清理
onBeforeUnmount(() => {
  embedResizeObserver?.disconnect()
  embedResizeObserver = null
  destroyPreviewMode()
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
  min-height: 0;
}

.editor-content {
  display: flex;
  flex: 1;
  min-height: 0;
  height: 0;
  overflow: hidden;
}

.flow-editor-pane {
  display: flex;
  flex: 1;
  min-width: 0;
  min-height: 0;
  align-self: stretch;
}

.toolbar-host {
  flex: 0 0 auto;
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
