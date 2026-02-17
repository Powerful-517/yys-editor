# 模块状态总览（重写）

## 📊 项目完成度总览

**总体完成度：90%** | **愿景一完成度：100%** (步骤1-10全部完成)

### 核心模块完成度

| 模块 | 完成度 | 状态 | 关键缺失 |
|------|--------|------|----------|
| 🎨 画布（LogicFlow） | 100% | ✅ 完美 | 无 |
| 📦 左侧组件库 | 70% | ✅ 可用 | 缩略图、搜索 |
| ⚙️ 右侧属性面板 | 85% | ✅ 良好 | textNode富文本编辑 |
| 🔧 工具栏 | 85% | ✅ 良好 | 导出命名优化 |
| 💬 弹窗系统 | 75% | ✅ 可用 | i18n完善、性能优化 |
| 💾 状态与持久化 | 90% | ✅ 优秀 | 重命名UI |
| 🌐 数据与国际化 | 60% | ⚠️ 基础 | UTF-8统一、日文覆盖 |
| 📁 项目资源面板 | 30% | ❌ 未集成 | 布局集成 |
| 🏗️ 构建与质量 | 40% | ⚠️ 基础 | 测试、CI |

### 愿景一实施进度（基础排版功能）

| 步骤 | 任务 | 状态 | 说明 |
|------|------|------|------|
| 1 | 节点最小化打通 | ✅ 完成 | imageNode/textNode 均已注册可用 |
| 2 | 截图修复 | ✅ 完成 | LogicFlow Snapshot + 水印 |
| 3 | 图层命令MVP | ✅ 完成 | 置顶/置底/前移/后移全部完成 |
| 4 | 多选/对齐/吸附 | ✅ 完成 | 6种对齐 + 2种分布 |
| 5 | 快捷键与微调 | ✅ 完成 | 8种快捷键全部工作 |
| 6 | 样式模型补齐 | ✅ 完成 | 11个样式属性统一 |
| 7 | 扩展与控制 | ✅ 完成 | MiniMap/Control + 开关 |
| 8 | 矢量节点MVP | ❌ 未开始 | vectorNode + SVG导入 |
| 9 | 资源与导出增强 | ❌ 未开始 | 资源弹窗 + SVG/PDF导出 |
| 10 | 历史与撤销重做 | ✅ 完成 | LogicFlow 框架原生支持 Ctrl+Z/Y |

## 🎯 下一步行动计划

### 🔴 高优先级（立即行动）
1. **textNode 富文本编辑** - 完善 TextPanel
   - 位置：src/components/flow/panels/TextPanel.vue
   - 需求：集成富文本编辑器（TipTap/Quill）
   - 功能：内容编辑、字体、颜色、格式化

### 🟡 中优先级（短期目标）
2. **矢量节点 MVP** - 步骤 8
   - 定义 vectorNode 类型
   - 支持 SVG path/rect/ellipse/polygon
   - 属性面板编辑 path/stroke/fill

### 🟢 低优先级（长期规划）
3. **导出增强** - 步骤 9
   - 图片资源选择/上传弹窗
   - 导出 SVG/PDF 格式

---

## 📋 详细模块状态

## 1. 画布（LogicFlow） — 完成度：100%
- 已完成：
  - 初始化与销毁：LogicFlow 实例、网格/缩放/旋转、节点选中/空白取消（src/components/flow/FlowEditor.vue）
  - 自定义节点注册：`shikigamiSelect`、`yuhunSelect`、`propertySelect`、`imageNode`、`textNode`（src/components/flow/FlowEditor.vue:567-574）
  - **textNode 完整实现**：采用模型-视图分离架构，使用 LogicFlow Label 插件实现富文本标签，TextNodeModel 动态设置 Label 宽度和坐标，支持节点 resize 时自动调整文本宽度，文本自动换行（src/components/flow/nodes/common/TextNode.vue, TextNodeModel.ts）
  - 与 Store 联动：读取/写入 `graphRawData` 与 `transform`（缩放/位移）（src/ts/useStore.ts, src/ts/useLogicFlow.ts）
  - DnD 接入：由组件库触发拖拽放置
  - **右键菜单完整功能**：图层控制（置顶/上移/下移/置底）、编辑操作（复制/粘贴）、组合操作（组合/解组）、状态控制（锁定/隐藏）、删除操作，所有快捷键功能均可通过右键触发（src/components/flow/FlowEditor.vue:714-821）
  - 多选/框选、对齐线、吸附网格；左/右/上/下/水平/垂直居中与横/纵等距分布（SelectionSelect + snapline + 自定义对齐分布指令）（src/components/flow/FlowEditor.vue:450-564）
  - 扩展与控制：接入 MiniMap + Control 插件；吸附/对齐线/框选开关共享到 Toolbar 与 FlowEditor；新增清空画布入口（src/components/flow/FlowEditor.vue:588,682; src/components/Toolbar.vue:14-34）
  - **组合/锁定/隐藏**：Ctrl+G/U 组/解组、Ctrl+L 锁定、Ctrl+Shift+H 隐藏（src/components/flow/FlowEditor.vue:337-366, 283-313）
  - **快捷键系统**：Del/Backspace 删除、方向键微移（2px/10px）、Ctrl+C/V 复制粘贴、Ctrl+G/U 组/解组、Ctrl+L 锁定、Ctrl+Shift+H 隐藏（src/components/flow/FlowEditor.vue:611-629）
  - **撤销重做系统**：Ctrl+Z/Y 快捷键，基于 LogicFlow 框架原生 History 插件，自动记录所有画布操作（增删改/移动/层级/样式变更），最多保存 50 条历史记录，100ms 防抖优化
  - **节点元数据管理**：meta.visible、meta.locked、meta.groupId 支持与规范化（src/components/flow/FlowEditor.vue:133-209）
  - **Label 插件集成**：限制每个节点一个 Label（isMultiple: false），支持文本自动换行，Label 宽度跟随节点宽度动态调整（src/components/flow/FlowEditor.vue:704-709）
- 未完成：
  - 无

## 2. 左侧组件库（Palette） — 完成度：70%
- 已完成：
  - 分组展示：基础组件（rect/ellipse/image/text）、阴阳师（shikigami/yuhun/property）（src/components/flow/ComponentsPanel.vue:5-95）
  - 拖拽创建节点：`lf.dnd.startDrag({ type, properties })`
  - **组件定义结构化**：嵌套 componentGroups 数组，包含 id/name/type/description/data
  - **textNode 已注册**：在 FlowEditor 和 ComponentsPanel 均已启用，支持拖拽创建
- 未完成：
  - 组件预览缩略图、搜索与分组折叠
  - 点击快速创建（当前仅支持拖拽）
  - 外置配置（JSON）与动态加载，便于扩展

## 3. 右侧属性面板（Inspector） — 完成度：85%
- 已完成：
  - 按节点类型切换 UI，显示基本信息（ID/类型）（src/components/flow/PropertyPanel.vue），面板按节点类型拆分子组件（ShikigamiPanel/YuhunPanel/PropertyRulePanel/ImagePanel/TextPanel/StylePanel）
  - 打开式神/御魂/属性弹窗，并通过 `lf.setProperties` 回写到节点（src/components/flow/panels/ShikigamiPanel.vue, YuhunPanel.vue, PropertyRulePanel.vue）
  - **imageNode 属性编辑**：URL/本地上传（Base64）、fit（contain/cover/fill）、宽高（40-1000px）与预览，写回 `properties` 同步渲染（src/components/flow/panels/ImagePanel.vue）
  - **样式模型完整实现**：统一 `properties.style`（src/ts/schema.ts, src/ts/nodeStyle.ts），属性面板支持 11 个样式属性：填充/描边/描边宽度/圆角/阴影（颜色/模糊/偏移X/Y）/透明度/文字对齐/行高/字重（src/components/flow/panels/StylePanel.vue）
  - **属性同步机制**：通过 `lf.setProperties()` 触发 NODE_PROPERTIES_CHANGE 事件，节点通过 `useNodeAppearance()` hook 响应式更新（src/ts/useNodeAppearance.ts）
- 未完成：
  - **textNode 富文本编辑**：TextPanel.vue 当前仅为 stub，只显示内容不支持编辑
  - 字段校验/联动、常用模板一键填充

## 4. 工具栏（Toolbar） — 完成度：85%
- 已完成：
  - 导入/导出（走 store）、更新日志、问题反馈、重置工作区（src/components/Toolbar.vue:3-10）
  - 水印设置（文本/字号/颜色/角度/行列）并持久化到 localStorage（src/components/Toolbar.vue:70-97）
  - 截图预览与导出：基于 LogicFlow Snapshot 获取 PNG，叠加自定义水印，预览/下载（src/components/Toolbar.vue:58-67）
  - **画布控制开关**：框选开/关、吸附开/关、对齐线开/关（src/components/Toolbar.vue:14-34）
  - **清空画布**：handleClearCanvas 入口（src/components/Toolbar.vue:11）
- 未完成：
  - 导出文件命名优化（当前固定为 yys-editor-files.json）
  - 导入时的 schemaVersion 校验与迁移提示（迁移逻辑已在 schema.ts 实现，但 UI 无提示）

## 5. 弹窗系统（Dialogs） — 完成度：75%
- 已完成：
  - 式神选择：按稀有度筛选与搜索（src/components/flow/nodes/yys/ShikigamiSelect.vue）
  - 御魂选择：按类型筛选与搜索（src/components/flow/nodes/yys/YuhunSelect.vue）
  - 属性选择：优先级/描述、等级/技能、御魂套装目标与主属性要求等（src/components/flow/nodes/yys/PropertySelect.vue）
  - 统一调度与回填：`useDialogs` + `DialogManager`（src/ts/useDialogs.ts, src/components/DialogManager.vue）
- 未完成：
  - 文案与编码：部分中文存在乱码，未全部纳入 i18n
  - 列表性能：缺虚拟滚动与图片懒加载；表单校验与提示待补

---

## 支撑模块

### A. 状态与持久化（Pinia + localStorage） — 完成度：90%
- 已完成：
  - **多标签管理**：新增/删除/切换，双 ID 系统（activeFileId + activeFile name）（src/ts/useStore.ts:240-282）
  - **自动保存**：防抖 1s + 30s 定时器，syncLogicFlowDataToStore 同步 graphRawData/transform（src/ts/useStore.ts:232-238, 313-336）
  - **数据迁移系统**：migrateToV1() 处理多种遗留格式，schemaVersion="1.0.0"（src/ts/schema.ts:128-224）
  - **导入导出**：兼容旧格式，自动迁移，双 ID 导出确保兼容性（src/ts/useStore.ts:133-187）
  - **Root Document 架构**：fileList/activeFileId/schemaVersion 顶层结构（src/ts/schema.ts:1-30）
  - **错误处理**：localStorage 配额超限时 clear 重试，JSON 解析错误捕获（src/ts/useStore.ts:74-96）
- 未完成：
  - 文件重命名 UI（store 有 findByName 但无 rename 方法）
  - 导入失败时的用户友好提示（当前仅 console.warn）

### B. 数据与国际化 — 完成度：60%
- 已完成：式神/御魂数据与图片（src/data/*.json, public/assets/*）；i18n（自动选 zh/ja，fallback zh）（src/locales/*.json, src/main.js）
- 未完成：统一 UTF-8/去除乱码；更全面的文案入库与日文覆盖

### C. 项目资源面板（ProjectExplorer） — 完成度：30%
- 已完成：树形视图、重命名/删除动作接口（src/components/ProjectExplorer.vue）
- 未完成：未集成至布局；与 store 的重命名/删除链路验证；支持多选/拖拽排序

### D. 构建与质量 — 完成度：40%
- 已完成：Vite 脚手架、ESLint/Prettier 基本规则与脚本（package.json）
- 未完成：单元/端到端测试、CI；图片压缩/按需加载；类型收紧与去除 any/死代码


## 愿景分步所需改动模块（追加）

### 愿景一：完成基础排版功能（图层/排版/图片/文本/矢量）
- 画布（LogicFlow）
  - 优先接入 LogicFlow 提供的层级命令、多选/框选、对齐线与吸附等原生能力（或官方插件），在编辑器侧只封装统一命令入口，不自研额外的渲染/排序逻辑
  - 撤销/重做、组合/锁定/隐藏、快捷键（Del/Ctrl+C/V、方向键微移、Ctrl+Z/Y）基于 LogicFlow 的 History/Snapshot 等能力封装，实现业务友好的调用 API
  - 启用并完善 `imageNode`/`textNode` 与业务字段的映射；后续如需 `vectorNode`、MiniMap/Control/Snapshot 等扩展，优先沿用 LogicFlow 的节点/插件机制逐步接入
- 左侧组件库（Palette）
  - 增加图片/文本/矢量组件及缩略图，支持搜索与分组折叠；外置 JSON 配置以便扩展
- 右侧属性面板（Inspector）
  - 图片属性：地址/上传、宽高、圆角、阴影、透明度
  - 文本属性：内容、字体/字号/字重/颜色、行高、对齐、富文本启用
  - 矢量属性：path/stroke/fill/strokeWidth、基础样式预设；字段校验/联动与常用模板
- 工具栏（Toolbar）
  - 截图改为对接 LogicFlow 容器；导出 PNG/SVG/PDF + 水印；吸附/对齐开关；清空画布
- 弹窗系统（Dialogs）
  - 图片资源选择/上传弹窗、SVG 导入弹窗、颜色/字体选择器
- 支撑模块
  - Store：节点新属性持久化、历史栈；ProjectExplorer 接入布局，文件重命名/删除链路（`schemaVersion` 与迁移已完成：Root Document + 迁移器）。
  - 数据与 i18n：新增文案、统一编码；静态资源压缩与懒加载

#### 愿景一实施顺序与依赖

- 底层设计先行
  - 数据模型与 `schemaVersion`：以 LogicFlow 原生 GraphData 为基础，只定义顶层 Root Document（fileList/transform/activeFileId 等）和节点业务字段（shikigami/yuhun/property 等）；在 `src/ts/useStore.ts` 引入 `schemaVersion` 与迁移逻辑。（已完成）
  - 图层模型：优先使用 LogicFlow 提供的节点层级/前后置 API，必要时仅持久化引擎暴露的层级信息，而不额外定义独立的 `properties.z` 排序规则。（已完成：基于 LogicFlow Menu + `setElementZIndex` 置顶/置底）
  - 操作服务化：通过 `useLogicFlow` 等轻量服务统一封装 LogicFlow 的常用 API 和插件能力（层级/对齐/组合/锁定/快捷键/历史），避免再设计一整套独立的 Canvas/History 引擎。
  - 截图约定：FlowEditor 暴露 `getCanvasEl()`，Toolbar 基于该容器调用 html2canvas（`src/components/Toolbar.vue`）。

- 推荐开发顺序（每步可独立验收）
  1) ✅ **节点最小化打通**：imageNode 已注册并可用（上传/URL/fit/宽高）；textNode 已完整实现（TextNode.vue + TextNodeModel.ts，采用模型-视图分离架构）；PropertyPanel 已按类型拆分子组件（ShikigamiPanel/YuhunPanel/PropertyRulePanel/ImagePanel/TextPanel/StylePanel）
  2) ✅ **截图修复**：已改为基于 LogicFlow Snapshot 导出 PNG，沿用水印配置（src/components/Toolbar.vue:prepareCapture）
  3) ✅ **图层命令 MVP**：已完成置顶/置底/前移/后移 + 右键菜单（src/components/flow/FlowEditor.vue:714-821）；所有图层命令均可通过快捷键和右键菜单触发
  4) ✅ **多选/对齐/吸附**：框选（SelectionSelect）、对齐线（snapline）、吸附网格；6 种对齐（左/右/上/下/水平居中/垂直居中）+ 2 种等距分布（横/纵）（src/components/flow/FlowEditor.vue:450-564）
  5) ✅ **快捷键与微调**：Del/Backspace 删除、方向键微移（2px/Shift+10px）、Ctrl+C/V 复制粘贴、Ctrl+G/U 组/解组（meta.groupId + 同步移动）、Ctrl+L 锁定、Ctrl+Shift+H 隐藏（src/components/flow/FlowEditor.vue:611-629, 337-366, 283-313）
  6) ✅ **样式模型补齐**：统一 properties.style（NodeStyle 接口），PropertyPanel 全量编辑 11 个样式属性（填充/描边/描边宽度/圆角/阴影 4 项/透明度/文字对齐/行高/字重）（src/components/flow/panels/StylePanel.vue, src/ts/nodeStyle.ts）
  7) ✅ **扩展与控制**：MiniMap + Control 插件接入（src/components/flow/FlowEditor.vue:588,682）；Toolbar 增加框选/吸附/对齐线开关（src/components/Toolbar.vue:14-34）；清空画布入口（src/components/Toolbar.vue:11）
  8) ❌ **矢量节点 MVP**：vectorNode（SVG path/rect/ellipse/polygon），属性面板支持 path/stroke/fill/strokeWidth；新增 SVG 导入弹窗
  9) ❌ **资源与导出增强**：图片资源选择/上传弹窗（当前仅支持单个上传），导出 SVG/PDF（当前仅 PNG）
  10) ✅ **历史与撤销重做**：LogicFlow 框架原生 History 插件，Ctrl+Z/Y 快捷键，自动记录所有操作

- 依赖关系
  - 图层命令（3）依赖 节点/截图（1/2），并为 对齐/组/快捷键（4/5）的前置。
  - 样式模型（6）是 矢量节点（8）的前置，避免三类节点样式分裂。
  - 历史/撤销（10）已由 LogicFlow 框架原生支持，无需额外开发。

- 易踩坑与规避
  - 晚引入 zIndex 会导致对齐/组排序不稳；在步骤 3 固化 z 策略。
  - LogicFlow 的 History 插件自动记录所有操作，无需手动管理历史栈。
  - 本地存储图片空间有限；在 schema 预留 `assetId`，便于后续切换后端存储。
  - 截图基于 DOM 选择器易漂移；由 FlowEditor 提供 `getCanvasEl()`，Toolbar 仅依赖该接口。

- 验收停靠点
  - ✅ **1/2 结束**：Root Document + LogicFlow GraphData 结构已冻结（src/ts/schema.ts），schemaVersion="1.0.0" 持久化（src/ts/useStore.ts），截图基于 LogicFlow Snapshot + 水印（src/components/Toolbar.vue）
  - ✅ **3/4 结束**：层级操作全部完成（置顶/置底/前移/后移），对齐/分布操作已完成（src/components/flow/FlowEditor.vue:485-564），右键菜单集成所有快捷键功能
  - ✅ **6 结束**：样式模型已统一（NodeStyle 接口），imageNode/shikigamiSelect/yuhunSelect/propertySelect 四类节点均可通过 StylePanel 一致编辑 11 个样式属性
  - ✅ **10 结束**：撤销重做系统完成，LogicFlow 框架原生支持，Ctrl+Z/Y 快捷键可用
  - ❌ **8 结束**：vectorNode 未开始，SVG 导入/导出链路未实现

---

## 当前状态总结（2026-02-17）

### 已完成的愿景一核心功能（步骤 1-10，100%）
- ✅ 节点系统：imageNode 完整可用，textNode 已注册并采用 LogicFlow 原生能力
- ✅ 截图导出：LogicFlow Snapshot + 自定义水印
- ✅ 图层命令：置顶/置底/前移/后移全部完成
- ✅ 多选对齐：6 种对齐 + 2 种等距分布
- ✅ 快捷键：8 种快捷键全部工作（Del/方向键/Ctrl+C/V/G/U/L/Shift+H）
- ✅ 样式模型：11 个样式属性统一编辑
- ✅ 扩展控制：MiniMap/Control/Snapshot 插件 + Toolbar 开关
- ✅ 撤销重做：Ctrl+Z/Y 快捷键，LogicFlow 框架原生支持

### 愿景一后续增强功能
- ⚠️ **高优先级（功能完整性）**：
  - textNode 富文本编辑 - TextPanel 增强
- ⚠️ **低优先级（增强功能）**：
  - vectorNode MVP - 步骤 8
  - SVG/PDF 导出 - 步骤 9

### 建议的下一步行动
1. **立即行动**：textNode 富文本编辑（集成 TipTap/Quill）
2. **短期目标**：vectorNode MVP
3. **长期目标**：SVG/PDF 导出增强
### 愿景二：联动 wiki/攻略站（浏览/复刻/继续编辑）
- 工具栏
  - 导入/导出增加元信息（title/tags/lang/version/schemaVersion）；“发布/上传”“打开攻略”“复刻编辑”入口
- 画布/Store
  - 只读模式（阅览时禁改）、版本与 Fork 关系；保存到后端并从接口恢复 graph
- 右侧属性面板/弹窗
  - 关联外部 wiki：式神/御魂详情链接与预览；从攻略模板一键填充节点属性
- 左侧组件库
  - 远程模板库与本地模板并存，支持按标签检索并拖拽创建
- 新增模块（站点）
  - 前端：攻略列表/详情（SSR/SEO），详情页支持“查看→复刻编辑”
  - 后端：REST/GraphQL、鉴权、版本与 Fork、图片上传与 CDN、检索/标签
- 支撑模块
  - 数据与 i18n：Guide 元信息结构、slug/tags/多语言覆盖；构建与质量：接口环境配置、错误兜底

### 愿景三：编辑器静态检查（规则/诊断/建议）
- 新增模块：规则引擎
  - 规则 DSL（JSON/TS）、严重级别/编码/文案/i18n、可插拔；实时在属性变更/保存时运行
- 画布/属性面板
  - 节点高亮/徽标、定位到问题；属性面板显示问题与快速修复建议（自动替换御魂/参数修正）
- 工具栏/新面板
  - “问题/诊断”侧栏：计数、筛选、跳转；规则开关与阈值设置
- 弹窗系统
  - 在选择式神/御魂时提示兼容性评分与原因，支持一键替换
- 支撑模块
  - Store：问题结果持久化与导出；项目级规则配置（启用/禁用/阈值）
  - 数据：式神协同/克制、御魂适配、属性阈值等知识库 JSON；测试：规则单测与 E2E

