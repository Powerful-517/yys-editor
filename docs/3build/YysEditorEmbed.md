# YysEditorEmbed 使用文档

## 简介

YysEditorEmbed 是 yys-editor 的可嵌入式组件版本，可以作为 Vue 组件集成到其他项目中。

## 安装

### 方式 1：本地引用（开发阶段）

在 `package.json` 中添加：

```json
{
  "dependencies": {
    "yys-editor": "file:../yys-editor"
  }
}
```

然后运行：

```bash
npm install
```

### 方式 2：npm 包（发布后）

```bash
npm install yys-editor
```

## 基础使用

### 1. 引入组件

```vue
<script setup>
import { ref } from 'vue'
import { YysEditorEmbed } from 'yys-editor'
import 'yys-editor/style.css'

const flowData = ref({
  nodes: [],
  edges: []
})
</script>

<template>
  <YysEditorEmbed
    :data="flowData"
    mode="edit"
    :height="600"
  />
</template>
```

### 2. 预览模式

```vue
<template>
  <YysEditorEmbed
    :data="flowData"
    mode="preview"
    :height="400"
  />
</template>
```

### 3. 编辑模式

```vue
<template>
  <YysEditorEmbed
    :data="flowData"
    mode="edit"
    :height="600"
    @save="handleSave"
    @cancel="handleCancel"
  />
</template>

<script setup>
const handleSave = (data) => {
  console.log('保存数据:', data)
  // 保存到后端或本地
}

const handleCancel = () => {
  console.log('取消编辑')
}
</script>
```

## API 文档

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `GraphData` | `undefined` | 初始数据（LogicFlow GraphData 格式） |
| `mode` | `'preview' \| 'edit'` | `'edit'` | 模式：预览或编辑 |
| `width` | `string \| number` | `'100%'` | 宽度 |
| `height` | `string \| number` | `'600px'` | 高度 |
| `showToolbar` | `boolean` | `true` | 是否显示工具栏（仅编辑模式） |
| `showPropertyPanel` | `boolean` | `true` | 是否显示属性面板（仅编辑模式） |
| `showComponentPanel` | `boolean` | `true` | 是否显示组件库（仅编辑模式） |
| `config` | `EditorConfig` | `{}` | 编辑器配置 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:data` | `(data: GraphData)` | 数据变更（实时） |
| `save` | `(data: GraphData)` | 保存（用户点击保存按钮） |
| `cancel` | `()` | 取消（用户点击取消按钮） |
| `error` | `(error: Error)` | 错误 |

### 方法（通过 ref 调用）

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getGraphData()` | - | `GraphData \| null` | 获取当前画布数据 |
| `setGraphData(data)` | `GraphData` | `void` | 设置画布数据 |

### 类型定义

```typescript
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

interface EditorConfig {
  grid?: boolean
  snapline?: boolean
  keyboard?: boolean
  theme?: 'light' | 'dark'
  locale?: 'zh' | 'ja' | 'en'
}
```

## 使用场景

### 场景 1：在 Wiki 中作为块插件

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

const saveToDocument = async (data) => {
  // 调用 API 保存到后端
  await fetch('/api/documents/update', {
    method: 'POST',
    body: JSON.stringify({ flowData: data })
  })
}
</script>

<style scoped>
.yys-editor-block {
  margin: 20px 0;
}

.edit-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

### 场景 2：在管理后台中使用

```vue
<template>
  <div class="admin-editor">
    <YysEditorEmbed
      ref="editorRef"
      mode="edit"
      :data="flowData"
      :height="'calc(100vh - 100px)'"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { YysEditorEmbed } from 'yys-editor'
import 'yys-editor/style.css'

const editorRef = ref()
const flowData = ref(null)

// 从后端加载数据
onMounted(async () => {
  const response = await fetch('/api/flow/123')
  flowData.value = await response.json()
})

const handleSave = async (data) => {
  // 保存到后端
  await fetch('/api/flow/123', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
  alert('保存成功')
}

// 手动获取数据
const getData = () => {
  const data = editorRef.value?.getGraphData()
  console.log('当前数据:', data)
}
</script>
```

### 场景 3：只读展示

```vue
<template>
  <div class="flow-display">
    <h2>流程图展示</h2>
    <YysEditorEmbed
      mode="preview"
      :data="flowData"
      :height="500"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { YysEditorEmbed } from 'yys-editor'
import 'yys-editor/style.css'

const flowData = ref({
  nodes: [
    {
      id: 'node1',
      type: 'rect',
      x: 100,
      y: 100,
      text: { value: '开始' }
    }
  ],
  edges: []
})
</script>
```

## 高级用法

### 自定义配置

```vue
<template>
  <YysEditorEmbed
    :data="flowData"
    mode="edit"
    :config="{
      grid: true,
      snapline: true,
      keyboard: true,
      theme: 'light',
      locale: 'zh'
    }"
  />
</template>
```

### 监听数据变化

```vue
<template>
  <YysEditorEmbed
    :data="flowData"
    mode="edit"
    @update:data="handleDataChange"
  />
</template>

<script setup>
const handleDataChange = (data) => {
  console.log('数据变化:', data)
  // 实时保存到本地存储
  localStorage.setItem('flowData', JSON.stringify(data))
}
</script>
```

### 错误处理

```vue
<template>
  <YysEditorEmbed
    :data="flowData"
    mode="edit"
    @error="handleError"
  />
</template>

<script setup>
const handleError = (error) => {
  console.error('编辑器错误:', error)
  alert(`发生错误: ${error.message}`)
}
</script>
```

## 样式定制

### 覆盖默认样式

```vue
<style>
/* 修改编辑器背景色 */
.yys-editor-embed {
  background: #ffffff !important;
}

/* 修改画布背景 */
.yys-editor-embed .lf-canvas {
  background: #f9f9f9 !important;
}
</style>
```

### 响应式布局

```vue
<template>
  <div class="responsive-editor">
    <YysEditorEmbed
      :data="flowData"
      mode="edit"
      width="100%"
      :height="editorHeight"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const editorHeight = ref(600)

const updateHeight = () => {
  editorHeight.value = window.innerHeight - 200
}

onMounted(() => {
  updateHeight()
  window.addEventListener('resize', updateHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateHeight)
})
</script>
```

## 常见问题

### Q: 如何在 Nuxt 3 中使用？

A: 在 Nuxt 3 中，需要将组件设置为客户端渲染：

```vue
<template>
  <ClientOnly>
    <YysEditorEmbed
      :data="flowData"
      mode="edit"
    />
  </ClientOnly>
</template>
```

### Q: 如何保存和加载数据？

A: 使用 `getGraphData()` 和 `setGraphData()` 方法：

```vue
<script setup>
const editorRef = ref()

// 保存
const save = () => {
  const data = editorRef.value?.getGraphData()
  localStorage.setItem('flowData', JSON.stringify(data))
}

// 加载
const load = () => {
  const data = JSON.parse(localStorage.getItem('flowData'))
  editorRef.value?.setGraphData(data)
}
</script>
```

### Q: 如何禁用某些 UI 元素？

A: 使用 Props 控制：

```vue
<template>
  <YysEditorEmbed
    mode="edit"
    :show-toolbar="false"
    :show-component-panel="false"
  />
</template>
```

### Q: 如何集成到现有项目？

A: 参考上面的"场景 1：在 Wiki 中作为块插件"示例。

## 浏览器兼容性

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 许可证

MIT

## 支持

如有问题，请提交 Issue 或联系开发团队。
