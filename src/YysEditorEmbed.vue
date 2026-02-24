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
        :pinia-instance="localPinia"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <!-- 主内容区 -->
      <div class="editor-content">
        <!-- 左侧组件库 -->
        <ComponentsPanel v-if="showComponentPanel" />

        <!-- 中间画布 + 右侧属性面板 -->
        <FlowEditor
          ref="flowEditorRef"
          height="100%"
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

const triggerEditorResize = () => {
  nextTick(() => {
    (flowEditorRef.value as any)?.resizeCanvas?.()
  })
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
    triggerEditorResize()
  }
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
      triggerEditorResize()
    }
  }
)

// 初始化
onMounted(() => {
  if (props.mode === 'preview') {
    initPreviewMode()
  } else if (props.mode === 'edit') {
    triggerEditorResize()
    // 编辑模式由 FlowEditor 组件初始化
    // 等待 FlowEditor 初始化完成后加载数据
    setTimeout(() => {
      if (props.data) {
        setGraphData(props.data)
      }
      triggerEditorResize()
    }, 500)
  }
})

// 清理
onBeforeUnmount(() => {
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
}

.editor-content {
  display: flex;
  flex: 1;
  min-height: 0;
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
