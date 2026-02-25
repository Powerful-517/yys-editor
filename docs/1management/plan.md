# yys-editor 项目计划（重新规划）

## 📊 项目概述

**项目名称：** yys-editor - 阴阳师流程图编辑器
**技术栈：** Vue 3 + LogicFlow + Element Plus + Pinia
**目标：** 作为独立编辑器和可嵌入组件，支持在 onmyoji-wiki 中作为块插件使用

**当前状态：** ✅ 阶段 1 完成（独立编辑器）+ ✅ 阶段 2 完成（组件化改造）
**总体完成度：** 100%（核心功能）

---

## 🎯 项目定位

### 双重角色

**角色 1：独立编辑器（已完成 ✅）**
- 完整的流程图编辑应用
- 支持本地运行和使用
- 完整的 UI（工具栏、组件库、属性面板）
- 数据导入导出

**角色 2：可嵌入组件（已完成 ✅）**
- 作为 onmyoji-wiki 的块插件
- 支持预览/编辑模式
- 轻量级，只包含核心编辑功能
- 数据接口清晰
- 构建产物：ES Module + UMD + CSS

---

## 📋 当前完成度

### 核心模块完成度

| 模块 | 完成度 | 状态 | 关键缺失 |
|------|--------|------|----------|
| 🎨 画布（LogicFlow） | 100% | ✅ 完美 | 无 |
| 📦 左侧组件库 | 75% | ✅ 可用 | 缩略图、搜索 |
| ⚙️ 右侧属性面板 | 100% | ✅ 完美 | 无 |
| 🔧 工具栏 | 85% | ✅ 良好 | 导出命名优化 |
| 💬 弹窗系统 | 75% | ✅ 可用 | i18n完善、性能优化 |
| 💾 状态与持久化 | 90% | ✅ 优秀 | 重命名UI |
| 🌐 数据与国际化 | 60% | ⚠️ 基础 | UTF-8统一、日文覆盖 |
| 📁 项目资源面板 | 30% | ❌ 未集成 | 布局集成 |
| 🏗️ 构建与质量 | 40% | ⚠️ 基础 | 测试、CI |

### 愿景一实施进度（基础排版功能）✅ 100%

| 步骤 | 任务 | 状态 | 说明 |
|------|------|------|------|
| 1 | 节点最小化打通 | ✅ 完成 | imageNode/textNode 均已注册可用 |
| 2 | 截图修复 | ✅ 完成 | LogicFlow Snapshot + 水印 |
| 3 | 图层命令MVP | ✅ 完成 | 置顶/置底/前移/后移全部完成 |
| 4 | 多选/对齐/吸附 | ✅ 完成 | 6种对齐 + 2种分布 |
| 5 | 快捷键与微调 | ✅ 完成 | 8种快捷键全部工作 |
| 6 | 样式模型补齐 | ✅ 完成 | 11个样式属性统一 |
| 7 | 扩展与控制 | ✅ 完成 | MiniMap/Control + 开关 |
| 8 | 矢量节点MVP | ✅ 完成 | vectorNode + SVG Pattern 平铺 |
| 9 | 资源与导出增强 | ⚠️ 取消 | 实现必要性不大 |
| 10 | 历史与撤销重做 | ✅ 完成 | LogicFlow 框架原生支持 Ctrl+Z/Y |

---

## 🎯 新愿景：作为块插件集成

### 愿景二：可嵌入组件（1-2 周）

**目标：** 将 yys-editor 改造为可嵌入的组件，支持在 onmyoji-wiki 中作为块插件使用

#### 核心需求

**1. 组件化改造**
- 提供可嵌入的 Vue 组件
- 支持通过 Props 传入初始数据
- 支持数据导出（通过 Emit 或回调）
- 支持只读模式和编辑模式

**2. 模式切换**
- **预览模式**：只读展示流程图，不显示工具栏和面板
- **编辑模式**：完整编辑功能，显示所有 UI
- 支持模式切换（通过 Props 控制）

**3. 数据接口**
- 输入：接收 LogicFlow GraphData 格式
- 输出：导出 LogicFlow GraphData 格式
- 支持数据验证和错误处理

**4. 轻量化**
- 移除不必要的依赖
- 优化打包体积
- 支持按需加载

---

## 📋 实施计划

### ✅ 阶段 1：独立编辑器（已完成）

**完成度：** 98%

- [x] 画布功能完整
- [x] 节点系统完善
- [x] 属性面板完整
- [x] 工具栏功能
- [x] 状态管理
- [x] 数据持久化

---

### ✅ 阶段 2：组件化改造（已完成）

**完成度：** 100%
**完成时间：** 2026-02-20

#### 步骤 1：组件接口设计 ✅

- [x] 设计组件 Props 接口
  ```typescript
  interface YysEditorProps {
    // 初始数据
    data?: GraphData
    // 模式：preview（预览）/ edit（编辑）
    mode?: 'preview' | 'edit'
    // 宽度和高度
    width?: string | number
    height?: string | number
    // 是否显示工具栏
    showToolbar?: boolean
    // 是否显示属性面板
    showPropertyPanel?: boolean
    // 是否显示组件库
    showComponentPanel?: boolean
    // 配置选项
    config?: EditorConfig
  }
  ```

- [x] 设计组件 Emits 接口
  ```typescript
  interface YysEditorEmits {
    // 数据变更
    'update:data': (data: GraphData) => void
    // 保存
    'save': (data: GraphData) => void
    // 取消
    'cancel': () => void
    // 错误
    'error': (error: Error) => void
  }
  ```

#### 步骤 2：创建嵌入式组件 ✅

- [x] 创建 `YysEditorEmbed.vue` 组件
- [x] 实现预览模式（只读，无 UI）
- [x] 实现编辑模式（完整 UI）
- [x] 实现模式切换
- [x] 实现数据输入输出

#### 步骤 3：优化和测试 ✅

- [x] 优化组件性能
- [x] 减少打包体积（gzip 后 35KB）
- [x] 编写组件文档（`docs/3build/YysEditorEmbed.md`）
- [x] 创建使用示例（`examples/embed-demo.html`）

#### 步骤 4：构建配置 ✅

- [x] 配置库模式构建（`vite.config.lib.js`）
- [x] 配置导出入口（`src/index.js`）
- [x] 更新 package.json
  ```json
  {
    "name": "yys-editor",
    "version": "1.0.0",
    "main": "./dist/yys-editor.umd.js",
    "module": "./dist/yys-editor.es.js",
    "exports": {
      ".": {
        "import": "./dist/yys-editor.es.js",
        "require": "./dist/yys-editor.umd.js"
      },
      "./style.css": "./dist/yys-editor.css"
    }
  }
  ```

**验收标准：** ✅ 全部达成
- ✅ 可以作为 npm 包引用
- ✅ 支持预览和编辑模式
- ✅ 数据接口清晰
- ✅ 文档完善

**构建产物：**
- `dist/yys-editor.es.js` - 155 KB (gzip: 35 KB)
- `dist/yys-editor.umd.js` - 112 KB (gzip: 31 KB)
- `dist/yys-editor.css` - 69 KB (gzip: 33 KB)

**相关文档：**
- 设计文档：`docs/2design/ComponentArchitecture.md`
- 使用文档：`docs/3build/YysEditorEmbed.md`
- 快速开始：`docs/3build/EMBED_README.md`
- 测试报告：`docs/4test/BUILD_TEST_REPORT.md`

---

### 🎨 阶段 3：wiki 集成测试（待开发）

**目标：** 在 onmyoji-wiki 中测试集成效果

#### 步骤 5：本地引用测试（1-2 天）

- [ ] 在 wiki 中引用 yys-editor（file: 方式）
- [ ] 创建 YysEditorBlock 组件
- [ ] 测试预览模式
- [ ] 测试编辑模式
- [ ] 测试数据保存

#### 步骤 6：交互优化（2-3 天）

- [ ] 优化模式切换体验
- [ ] 优化数据同步
- [ ] 优化错误处理
- [ ] 优化加载性能

**验收标准：**
- 在 wiki 中可以正常使用
- 预览/编辑切换流畅
- 数据保存正确
- 体验类似 Notion 块

---

## 🔧 技术架构

### 组件架构

```
yys-editor/
├── 独立应用模式
│   ├── App.vue（完整 UI）
│   ├── 工具栏
│   ├── 组件库
│   ├── 属性面板
│   └── 画布
│
└── 嵌入组件模式
    ├── YysEditorEmbed.vue（可嵌入）
    ├── 预览模式（只有画布）
    └── 编辑模式（完整 UI）
```

### 数据流

```
wiki 块编辑器
    ↓ (传入 GraphData)
YysEditorBlock（包装组件）
    ↓ (Props)
YysEditorEmbed（yys-editor 组件）
    ↓ (初始化)
LogicFlow 画布
    ↓ (编辑)
数据变更
    ↓ (Emit)
YysEditorBlock
    ↓ (保存)
wiki 文档
```

### 模式对比

| 特性 | 预览模式 | 编辑模式 |
|------|---------|---------|
| 画布 | ✅ 只读 | ✅ 可编辑 |
| 工具栏 | ❌ 隐藏 | ✅ 显示 |
| 组件库 | ❌ 隐藏 | ✅ 显示 |
| 属性面板 | ❌ 隐藏 | ✅ 显示 |
| 交互 | 点击切换到编辑 | 保存/取消 |

---

## 🎯 里程碑

### Milestone 1：独立编辑器 ✅
- [x] 完整的编辑功能
- [x] 节点系统
- [x] 属性面板
- [x] 数据持久化

**完成时间：** 2026-02-17

### Milestone 2：组件化改造 ✅
- [x] 组件接口设计
- [x] 嵌入式组件开发
- [x] 预览/编辑模式
- [x] 构建配置
- [x] 文档和示例

**完成时间：** 2026-02-20

### Milestone 3：wiki 集成（待开发）
- [ ] 本地引用测试
- [ ] 交互优化
- [ ] 文档完善

**预计完成：** 与 wiki 同步

---

## 🤔 技术决策

### ADR-001: 组件化方案

**背景：** 需要将独立应用改造为可嵌入组件

**决策：** 创建独立的嵌入式组件

**方案：**
1. 保留原有的 App.vue（独立应用）
2. 创建新的 YysEditorEmbed.vue（嵌入组件）
3. 共享核心逻辑和组件

**优点：**
- 不影响现有功能
- 独立应用和嵌入组件分离
- 易于维护

### ADR-002: 模式切换方案

**背景：** 需要支持预览和编辑模式

**决策：** 通过 Props 控制模式

**实现：**
```vue
<YysEditorEmbed
  :mode="mode"
  :data="flowData"
  @save="handleSave"
/>
```

**优点：**
- 简单直观
- 易于控制
- 性能好

### ADR-003: 数据格式

**背景：** 需要定义数据输入输出格式

**决策：** 使用 LogicFlow 原生 GraphData 格式

**格式：**
```typescript
interface GraphData {
  nodes: NodeData[]
  edges: EdgeData[]
}
```

**优点：**
- 标准格式
- 易于序列化
- 兼容性好

---

## 📚 使用示例

### 在 wiki 中使用

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
    </div>

    <!-- 编辑模式 -->
    <div v-else class="editor-modal">
      <YysEditorEmbed
        mode="edit"
        :data="flowData"
        :height="600"
        @save="handleSave"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { YysEditorEmbed } from 'yys-editor'

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
}

const handleCancel = () => {
  isEditing.value = false
}
</script>
```

---

## 📝 更新日志

### 2026-02-25
- ✅ 修复嵌入编辑器在 onmyoji-wiki 弹层中的初始化尺寸异常
  - 编辑区域高度改为基于容器测量后计算
  - FlowEditor 以宿主容器尺寸触发 resize
- ✅ 修复资产选择器弹窗内图片比例异常
  - 统一使用固定尺寸容器 + `background-size: contain` 保持比例

### 2026-02-20
- ✅ 完成组件化改造
  - 创建 `YysEditorEmbed.vue` 嵌入式组件
  - 实现 Props/Emits 接口
  - 支持 preview/edit 双模式
  - 配置 Vite library mode 构建
  - 生成 ES Module + UMD + CSS 构建产物
- ✅ 完善文档
  - 设计文档：`docs/2design/ComponentArchitecture.md`
  - 使用文档：`docs/3build/YysEditorEmbed.md`
  - 快速开始：`docs/3build/EMBED_README.md`
  - 测试报告：`docs/4test/BUILD_TEST_REPORT.md`
- 📝 重新规划项目定位
- 📝 明确双重角色：独立编辑器 + 可嵌入组件
- 📝 规划 wiki 集成路径

---

**最后更新：** 2026-02-20
**文档版本：** v2.1.0（组件化改造完成）
**文档版本：** v2.0.0（重新规划）
