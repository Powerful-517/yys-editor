# 组件化改造设计文档

## 背景与目标

### 为什么需要组件化改造

**当前状态**：
- yys-editor 是一个独立的单页应用（SPA）
- 只能作为独立应用运行
- 无法嵌入到其他项目中

**目标**：
- 将 yys-editor 改造为可嵌入的 Vue 组件
- 支持在 onmyoji-wiki 中作为块插件使用
- 保持独立应用功能不变（双重角色）

### 预期效果

**角色 1：独立编辑器**（保持不变）
- 完整的流程图编辑应用
- 支持本地运行和使用
- 完整的 UI（工具栏、组件库、属性面板）

**角色 2：可嵌入组件**（新增）
- 作为 onmyoji-wiki 的块插件
- 支持预览/编辑模式
- 轻量级，只包含核心编辑功能
- 数据接口清晰

---

## 技术方案

### 核心思路

**不修改现有代码，创建独立的嵌入式组件**

```
yys-editor/
├── src/
│   ├── App.vue                    # 独立应用（保持不变）
│   ├── YysEditorEmbed.vue         # 嵌入式组件（新增）⭐
│   ├── components/                # 共享组件
│   │   ├── flow/
│   │   │   ├── FlowEditor.vue     # 画布核心（共享）
│   │   │   ├── PropertyPanel.vue  # 属性面板（共享）
│   │   │   └── ComponentsPanel.vue # 组件库（共享）
│   │   └── Toolbar.vue            # 工具栏（共享）
│   └── ts/
│       ├── useStore.ts            # 状态管理（共享）
│       └── useLogicFlow.ts        # LogicFlow 封装（共享）
└── dist/                          # 构建输出
    ├── yys-editor.es.js           # ES Module（库模式）
    └── yys-editor.umd.js          # UMD（库模式）
```

### 架构设计

#### 1. 双模式架构

```
┌─────────────────────────────────────────────────────────┐
│                    yys-editor 项目                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │   独立应用模式    │         │   嵌入组件模式    │     │
│  │   (App.vue)      │         │ (YysEditorEmbed) │     │
│  └──────────────────┘         └──────────────────┘     │
│          │                            │                 │
│          └────────────┬───────────────┘                 │
│                       ↓                                 │
│              ┌─────────────────┐                        │
│              │   共享核心组件   │                        │
│              ├─────────────────┤                        │
│              │ FlowEditor.vue  │                        │
│              │ PropertyPanel   │                        │
│              │ ComponentsPanel │                        │
│              │ Toolbar         │                        │
│              └─────────────────┘                        │
│                       ↓                                 │
│              ┌─────────────────┐                        │
│              │   状态管理层     │                        │
│              ├─────────────────┤                        │
│              │ useStore        │                        │
│              │ useLogicFlow    │                        │
│              │ useCanvasSettings│                       │
│              └─────────────────┘                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

#### 2. 嵌入式组件模式切换

```
┌─────────────────────────────────────────────────────────┐
│              YysEditorEmbed 组件                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Props: { mode: 'preview' | 'edit', data: GraphData }   │
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │   预览模式        │         │   编辑模式        │     │
│  │   (preview)      │         │   (edit)         │     │
│  ├──────────────────┤         ├──────────────────┤     │
│  │ ✅ 画布（只读）   │         │ ✅ 画布（可编辑） │     │
│  │ ❌ 工具栏        │         │ ✅ 工具栏         │     │
│  │ ❌ 组件库        │         │ ✅ 组件库         │     │
│  │ ❌ 属性面板      │         │ ✅ 属性面板       │     │
│  │ ❌ 交互          │         │ ✅ 完整交互       │     │
│  └──────────────────┘         └──────────────────┘     │
│                                                          │
│  Emits: { 'update:data', 'save', 'cancel', 'error' }    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 数据模型

### Props 接口

```typescript
interface YysEditorEmbedProps {
  // 初始数据（LogicFlow GraphData 格式）
  data?: GraphData

  // 模式：preview（预览）/ edit（编辑）
  mode?: 'preview' | 'edit'

  // 尺寸
  width?: string | number
  height?: string | number

  // UI 控制（仅在 edit 模式有效）
  showToolbar?: boolean
  showPropertyPanel?: boolean
  showComponentPanel?: boolean

  // 配置选项
  config?: EditorConfig
}

// LogicFlow 标准数据格式
interface GraphData {
  nodes: NodeData[]
  edges: EdgeData[]
}

interface NodeData {
  id: string
  type: string
  x: number
  y: number
  properties?: Record<string, any>
  text?: { value: string }
}

interface EdgeData {
  id: string
  type: string
  sourceNodeId: string
  targetNodeId: string
  properties?: Record<string, any>
}

// 编辑器配置
interface EditorConfig {
  // 画布配置
  grid?: boolean
  snapline?: boolean
  keyboard?: boolean

  // 主题
  theme?: 'light' | 'dark'

  // 语言
  locale?: 'zh' | 'ja' | 'en'
}
```

### Emits 接口

```typescript
interface YysEditorEmbedEmits {
  // 数据变更（实时）
  'update:data': (data: GraphData) => void

  // 保存（用户点击保存按钮）
  'save': (data: GraphData) => void

  // 取消（用户点击取消按钮）
  'cancel': () => void

  // 错误
  'error': (error: Error) => void
}
```

### 默认值

```typescript
const defaultProps = {
  mode: 'edit',
  width: '100%',
  height: '600px',
  showToolbar: true,
  showPropertyPanel: true,
  showComponentPanel: true,
  config: {
    grid: true,
    snapline: true,
    keyboard: true,
    theme: 'light',
    locale: 'zh'
  }
}
```

---

## 实现细节

### 1. YysEditorEmbed.vue 组件结构

```vue
<template>
  <div
    class="yys-editor-embed"
    :class="{ 'preview-mode': mode === 'preview' }"
    :style="containerStyle"
  >
    <!-- 编辑模式：完整 UI -->
    <template v-if="mode === 'edit'">
      <!-- 工具栏 -->
      <Toolbar
        v-if="showToolbar"
        @save="handleSave"
        @cancel="handleCancel"
      />

      <!-- 主内容区 -->
      <div class="editor-content">
        <!-- 左侧组件库 -->
        <ComponentsPanel v-if="showComponentPanel" />

        <!-- 中间画布 -->
        <FlowEditor
          ref="flowEditorRef"
          :initial-data="data"
          @data-change="handleDataChange"
        />

        <!-- 右侧属性面板 -->
        <PropertyPanel v-if="showPropertyPanel" />
      </div>
    </template>

    <!-- 预览模式：只有画布 -->
    <template v-else>
      <FlowEditor
        ref="flowEditorRef"
        :initial-data="data"
        :readonly="true"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import FlowEditor from './components/flow/FlowEditor.vue'
import Toolbar from './components/Toolbar.vue'
import ComponentsPanel from './components/flow/ComponentsPanel.vue'
import PropertyPanel from './components/flow/PropertyPanel.vue'
import type { GraphData, EditorConfig } from './ts/schema'

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
  showComponentPanel: true
})

// Emits
const emit = defineEmits<{
  'update:data': [data: GraphData]
  'save': [data: GraphData]
  'cancel': []
  'error': [error: Error]
}>()

// Refs
const flowEditorRef = ref<InstanceType<typeof FlowEditor>>()

// Computed
const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

// Methods
const handleDataChange = (data: GraphData) => {
  emit('update:data', data)
}

const handleSave = () => {
  try {
    const data = flowEditorRef.value?.getGraphData()
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
const getGraphData = () => {
  return flowEditorRef.value?.getGraphData()
}

const setGraphData = (data: GraphData) => {
  flowEditorRef.value?.setGraphData(data)
}

defineExpose({
  getGraphData,
  setGraphData
})

// 监听 data 变化
watch(() => props.data, (newData) => {
  if (newData && flowEditorRef.value) {
    flowEditorRef.value.setGraphData(newData)
  }
}, { deep: true })

// 初始化
onMounted(() => {
  if (props.data && flowEditorRef.value) {
    flowEditorRef.value.setGraphData(props.data)
  }
})
</script>

<style scoped>
.yys-editor-embed {
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
}

.editor-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.preview-mode {
  background: transparent;
}
</style>
```

### 2. 状态隔离策略

**问题**：独立应用使用全局 Pinia store，嵌入式组件需要隔离状态

**方案**：使用 provide/inject 创建局部状态

```typescript
// YysEditorEmbed.vue
import { provide } from 'vue'
import { createPinia } from 'pinia'

// 创建局部 Pinia 实例
const localPinia = createPinia()
provide('pinia', localPinia)

// 子组件使用局部 store
const store = useFilesStore(localPinia)
```

### 3. 样式隔离策略

**问题**：避免样式冲突

**方案**：
1. 使用 scoped styles
2. 添加命名空间前缀 `.yys-editor-embed`
3. 使用 CSS Modules（可选）

```vue
<style scoped>
.yys-editor-embed {
  /* 所有样式都在这个命名空间下 */
}
</style>
```

### 4. 构建配置

#### vite.config.ts（库模式）

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  build: {
    lib: {
      // 入口文件
      entry: resolve(__dirname, 'src/YysEditorEmbed.vue'),
      name: 'YysEditor',
      // 输出文件名
      fileName: (format) => `yys-editor.${format}.js`
    },
    rollupOptions: {
      // 外部化依赖（不打包进库）
      external: ['vue', 'element-plus'],
      output: {
        // 全局变量名
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus'
        }
      }
    }
  }
})
```

#### package.json

```json
{
  "name": "yys-editor",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/yys-editor.umd.js",
  "module": "./dist/yys-editor.es.js",
  "types": "./dist/YysEditorEmbed.d.ts",
  "exports": {
    ".": {
      "import": "./dist/yys-editor.es.js",
      "require": "./dist/yys-editor.umd.js",
      "types": "./dist/YysEditorEmbed.d.ts"
    },
    "./style.css": "./dist/style.css"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:lib": "vite build --config vite.config.lib.ts"
  },
  "peerDependencies": {
    "vue": "^3.3.0",
    "element-plus": "^2.9.0"
  }
}
```

---

## 使用示例

### 在 onmyoji-wiki 中使用

```vue
<template>
  <div class="yys-editor-block">
    <!-- 预览模式 -->
    <div v-if="!isEditing" @click="startEdit">
      <YysEditorEmbed
        mode="preview"
        :data="flowData"
        :height="400"
      />
      <button class="edit-btn">✏️ 编辑流程图</button>
    </div>

    <!-- 编辑模式（弹窗） -->
    <el-dialog v-model="isEditing" fullscreen>
      <YysEditorEmbed
        mode="edit"
        :data="flowData"
        :height="'100%'"
        @save="handleSave"
        @cancel="handleCancel"
        @error="handleError"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { YysEditorEmbed } from 'yys-editor'
import 'yys-editor/style.css'

const isEditing = ref(false)
const flowData = ref({
  nodes: [],
  edges: []
})

const startEdit = () => {
  isEditing.value = true
}

const handleSave = (data) => {
  flowData.value = data
  isEditing.value = false
  // 保存到文档
  saveToDocument(data)
}

const handleCancel = () => {
  isEditing.value = false
}

const handleError = (error) => {
  console.error('编辑器错误:', error)
}
</script>
```

### 作为 npm 包安装

```bash
# 在 onmyoji-wiki 项目中
npm install file:../yys-editor

# 或发布到 npm 后
npm install yys-editor
```

---

## 测试计划

### 功能测试

#### 预览模式
- [ ] 正确渲染流程图
- [ ] 只读，无法编辑
- [ ] 不显示工具栏、组件库、属性面板
- [ ] 响应式尺寸

#### 编辑模式
- [ ] 完整编辑功能
- [ ] 工具栏正常工作
- [ ] 组件库可拖拽
- [ ] 属性面板可编辑
- [ ] 保存/取消按钮触发正确事件

#### 数据接口
- [ ] Props 传入数据正确渲染
- [ ] 数据变更触发 update:data 事件
- [ ] 保存触发 save 事件
- [ ] 取消触发 cancel 事件
- [ ] 错误触发 error 事件

#### 状态隔离
- [ ] 多个实例互不影响
- [ ] 不污染全局状态
- [ ] 样式不冲突

### 集成测试

#### 在 wiki 中集成
- [ ] 可以正常引入
- [ ] 预览模式正常显示
- [ ] 编辑模式正常工作
- [ ] 数据保存正确
- [ ] 样式不冲突

### 性能测试

- [ ] 打包体积合理（< 500KB gzipped）
- [ ] 加载速度快
- [ ] 运行流畅，无卡顿

---

## 验收标准

### 功能完整性
- ✅ 支持预览和编辑模式
- ✅ 数据接口清晰（Props + Emits）
- ✅ 可以作为 npm 包引用
- ✅ 状态和样式隔离

### 兼容性
- ✅ 不影响独立应用功能
- ✅ 支持 Vue 3.3+
- ✅ 支持现代浏览器

### 文档完善
- ✅ API 文档
- ✅ 使用示例
- ✅ 集成指南

---

## 实现记录

### 2026-02-20
- 📝 创建组件化改造设计文档
- 📝 定义 Props 和 Emits 接口
- 📝 设计双模式架构
- 📝 规划状态隔离策略

---

**最后更新：** 2026-02-20
**文档版本：** v1.0.0
