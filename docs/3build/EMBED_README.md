# YysEditorEmbed 组件化改造

## 📋 概述

yys-editor 现在支持两种使用方式：

1. **独立应用模式**：完整的流程图编辑应用（原有功能）
2. **嵌入组件模式**：可嵌入到其他项目中的 Vue 组件（新增功能）

## 🎯 完成的工作

### ✅ 已完成

1. **设计文档**
   - 创建了 `docs/2design/ComponentArchitecture.md`
   - 详细说明了组件化改造的架构设计

2. **核心组件**
   - 创建了 `src/YysEditorEmbed.vue` 嵌入式组件
   - 支持 `preview` 和 `edit` 两种模式
   - 实现了完整的 Props 和 Emits 接口
   - 实现了状态隔离（使用局部 Pinia 实例）

3. **构建配置**
   - 创建了 `vite.config.lib.js` 库模式构建配置
   - 更新了 `package.json` 导出配置
   - 支持 ES Module 和 UMD 两种格式

4. **文档和示例**
   - 创建了 `docs/3usage/YysEditorEmbed.md` 使用文档
   - 创建了 `examples/embed-demo.html` 示例页面
   - 创建了 `src/TestEmbed.vue` 测试组件

## 🚀 快速开始

### 1. 测试嵌入式组件

在开发模式下测试组件：

```bash
# 启动开发服务器
npm run dev

# 访问测试页面（需要修改 main.js 引入 TestEmbed.vue）
```

### 2. 构建库文件

```bash
# 构建嵌入式组件库
npm run build:lib

# 输出文件：
# - dist/yys-editor.es.js (ES Module)
# - dist/yys-editor.umd.js (UMD)
# - dist/yys-editor.css (样式)
```

### 3. 在其他项目中使用

#### 方式 1：本地引用（开发阶段）

在 `onmyoji-wiki` 项目的 `package.json` 中：

```json
{
  "dependencies": {
    "yys-editor": "file:../yys-editor"
  }
}
```

然后：

```bash
cd ../onmyoji-wiki
npm install
```

#### 方式 2：使用组件

```vue
<script setup>
import { ref } from 'vue'
import { YysEditorEmbed } from 'yys-editor'
import 'yys-editor/style.css'

const flowData = ref({
  nodes: [],
  edges: []
})

const handleSave = (data) => {
  console.log('保存数据:', data)
}
</script>

<template>
  <YysEditorEmbed
    mode="edit"
    :data="flowData"
    :height="600"
    @save="handleSave"
  />
</template>
```

## 📖 API 文档

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `data` | `GraphData` | `undefined` | 初始数据 |
| `mode` | `'preview' \| 'edit'` | `'edit'` | 模式 |
| `width` | `string \| number` | `'100%'` | 宽度 |
| `height` | `string \| number` | `'600px'` | 高度 |
| `showToolbar` | `boolean` | `true` | 显示工具栏 |
| `showPropertyPanel` | `boolean` | `true` | 显示属性面板 |
| `showComponentPanel` | `boolean` | `true` | 显示组件库 |
| `config` | `EditorConfig` | `{}` | 编辑器配置 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:data` | `(data: GraphData)` | 数据变更 |
| `save` | `(data: GraphData)` | 保存 |
| `cancel` | `()` | 取消 |
| `error` | `(error: Error)` | 错误 |

### 方法

| 方法 | 说明 |
|------|------|
| `getGraphData()` | 获取当前画布数据 |
| `setGraphData(data)` | 设置画布数据 |

详细文档请查看：`docs/3usage/YysEditorEmbed.md`

## 🧪 测试

### 手动测试清单

- [ ] **预览模式**
  - [ ] 正确渲染流程图
  - [ ] 只读，无法编辑
  - [ ] 不显示工具栏、组件库、属性面板

- [ ] **编辑模式**
  - [ ] 完整编辑功能
  - [ ] 工具栏正常工作
  - [ ] 组件库可拖拽
  - [ ] 属性面板可编辑
  - [ ] 保存/取消按钮触发正确事件

- [ ] **数据接口**
  - [ ] Props 传入数据正确渲染
  - [ ] 数据变更触发 update:data 事件
  - [ ] 保存触发 save 事件
  - [ ] 取消触发 cancel 事件

- [ ] **状态隔离**
  - [ ] 多个实例互不影响
  - [ ] 不污染全局状态

## 📁 文件结构

```
yys-editor/
├── src/
│   ├── YysEditorEmbed.vue          # 嵌入式组件 ⭐
│   ├── TestEmbed.vue               # 测试组件
│   ├── App.vue                     # 独立应用（保持不变）
│   └── components/                 # 共享组件
├── docs/
│   ├── 2design/
│   │   └── ComponentArchitecture.md  # 设计文档
│   └── 3usage/
│       └── YysEditorEmbed.md         # 使用文档
├── examples/
│   └── embed-demo.html             # 示例页面
├── vite.config.js                  # 应用构建配置
├── vite.config.lib.js              # 库构建配置 ⭐
└── package.json                    # 更新了导出配置 ⭐
```

## 🔄 下一步

### 在 onmyoji-wiki 中集成

1. **安装依赖**
   ```bash
   cd ../onmyoji-wiki
   npm install file:../yys-editor
   ```

2. **创建 MDC 组件**
   ```vue
   <!-- components/content/YysEditor.vue -->
   <template>
     <div class="yys-editor-block" @click="openEditor">
       <YysEditorEmbed
         mode="preview"
         :data="flowData"
       />
       <button>✏️ 编辑流程图</button>
     </div>
   </template>
   ```

3. **在 Markdown 中使用**
   ```markdown
   ::yys-editor{id="flow-1"}
   ::
   ```

## 📝 注意事项

### 状态隔离

嵌入式组件使用局部 Pinia 实例，不会影响宿主应用的状态管理。

### 样式隔离

所有样式都使用 scoped，并添加了 `.yys-editor-embed` 命名空间。

### 依赖管理

以下依赖被标记为 `peerDependencies`，需要宿主项目提供：
- vue
- element-plus
- pinia
- @logicflow/core
- @logicflow/extension
- @logicflow/vue-node-registry

## 🐛 已知问题

1. **预览模式初始化延迟**
   - 预览模式需要等待 DOM 渲染完成后初始化 LogicFlow
   - 已使用 `setTimeout` 解决

2. **编辑模式数据加载**
   - 编辑模式需要等待 FlowEditor 组件初始化完成
   - 已使用 `setTimeout` 延迟加载数据

## 📚 相关文档

- [设计文档](./docs/2design/ComponentArchitecture.md)
- [使用文档](./docs/3usage/YysEditorEmbed.md)
- [项目计划](./docs/1management/plan.md)

## 🤝 贡献

如有问题或建议，请提交 Issue 或 Pull Request。

## 📄 许可证

MIT
