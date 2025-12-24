# 模块状态总览（重写）

总体完成度（粗略）：约 65%

## 1. 画布（LogicFlow） — 完成度：60%
- 已完成：
  - 初始化与销毁：LogicFlow 实例、网格/缩放/旋转、节点选中/空白取消（src/components/flow/FlowEditor.vue）
  - 自定义节点注册：`shikigamiSelect`、`yuhunSelect`、`propertySelect`
  - 与 Store 联动：读取/写入 `graphRawData` 与 `transform`（缩放/位移）（src/ts/useStore.ts, src/ts/useLogicFlow.ts）
  - DnD 接入：由组件库触发拖拽放置
- 未完成：
  - 右键菜单层级命令未实现：`bringToFront`/`sendToBack`/`bringForward`/`sendBackward`
  - 多选/框选、对齐线、对齐/平均分布、吸附到网格
  - 撤销重做、组合/锁定/隐藏、快捷键（Del/Ctrl+C/V、方向键微移、Ctrl+Z/Y）
  - MiniMap/控制条/Snapshot 等扩展能力

## 2. 左侧组件库（Palette） — 完成度：55%
- 已完成：
  - 分组展示：基础组件、阴阳师、其他（占位）（src/components/flow/ComponentsPanel.vue）
  - 拖拽创建节点：`lf.dnd.startDrag({ type, properties })`
- 未完成：
  - `imageNode`、`textNode` 在画布侧未注册，基础组件中的“图片/文本”目前不可用
  - 点击快速创建、组件预览缩略图、搜索与分组折叠
  - 外置配置（JSON）与动态加载，便于扩展

## 3. 右侧属性面板（Inspector） — 完成度：65%
- 已完成：
  - 按节点类型切换 UI，显示基本信息（ID/类型）（src/components/flow/PropertyPanel.vue）
  - 打开式神/御魂/属性弹窗，并通过 `lf.setProperties` 回写到节点
- 未完成：
  - `imageNode`/`textNode` 属性编辑未打通（图片上传后属性回写、富文本编辑器启用与同步）
  - 字段校验/联动、常用模板一键填充、更多样式项（填充/描边/圆角/阴影/透明度）

## 4. 工具栏（Toolbar） — 完成度：70%
- 已完成：
  - 导入/导出（走 store）、更新日志、问题反馈（src/components/Toolbar.vue）
  - 水印设置（文本/字号/颜色/角度/行列）并持久化到 localStorage
  - 截图预览弹窗框架
- 未完成：
  - 截图逻辑仍按旧的 VueFlow 容器选择器查找，未对接 LogicFlow 容器；`captureFlow` 未实现/被注释
  - 导出文件命名/版本号与 `schemaVersion`，导入时的校验与迁移提示

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

### A. 状态与持久化（Pinia + localStorage） — 完成度：80%
- 已完成：多标签（新增/删除/切换）、自动保存（防抖 + 30s 定时）、`graphRawData`/`transform` 同步、导入兼容旧格式，`schemaVersion` 与数据迁移（Root Document + 迁移器）（src/ts/useStore.ts, src/ts/schema.ts）
- 未完成：重命名/删除等文件管理与 UI 全链路校验、失败兜底与错误提示

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
  - 图层模型：优先使用 LogicFlow 提供的节点层级/前后置 API，必要时仅持久化引擎暴露的层级信息，而不额外定义独立的 `properties.z` 排序规则。
  - 操作服务化：通过 `useLogicFlow` 等轻量服务统一封装 LogicFlow 的常用 API 和插件能力（层级/对齐/组合/锁定/快捷键/历史），避免再设计一整套独立的 Canvas/History 引擎。
  - 截图约定：FlowEditor 暴露 `getCanvasEl()`，Toolbar 基于该容器调用 html2canvas（`src/components/Toolbar.vue`）。

- 推荐开发顺序（每步可独立验收）
  1) 节点最小化打通：注册并可用 imageNode/textNode；PropertyPanel 提供基础属性（图片 url/宽高；文本 content/颜色/字号）（`src/components/flow/FlowEditor.vue`, `src/components/flow/PropertyPanel.vue`）。
  2) 截图修复：改为基于 LogicFlow 容器导出 PNG，沿用水印配置（`src/components/Toolbar.vue`）。
  3) 图层命令 MVP：基于 LogicFlow 的层级/前后置 API 封装 bringToFront/sendToBack/bringForward/sendBackward + 右键菜单，如需持久化仅同步引擎提供的层级信息（`src/components/flow/FlowEditor.vue`）。
  4) 多选/对齐/吸附：框选、对齐线、吸附网格；左/右/上/下/水平/垂直居中与横/纵等距分布（FlowEditor/extension）。
  5) 快捷键与微调：Del 删除、方向键微移、Ctrl+C/V 复制粘贴、Ctrl+G/U 组/解组（简单组：父 meta id + 同步移动）、锁定/隐藏（`properties.locked`/`visible`）。
  6) 样式模型补齐：统一 `properties.style` 字段并在 PropertyPanel 全量编辑（填充/描边/圆角/阴影/透明度/文字对齐/行高/字重）。
  7) 扩展与控制：接入 MiniMap/Control/Snapshot；Toolbar 增加吸附/对齐开关与清空画布。
  8) 矢量节点 MVP：`vectorNode`（SVG path/rect/ellipse/polygon），属性面板支持 path/stroke/fill/strokeWidth；新增 SVG 导入弹窗。
  9) 资源与导出增强：图片资源选择/上传弹窗（base64 或预留 `assetId`），导出 SVG/PDF（PDF 可延后）。
  10) 历史与撤销重做：抽象 Action + HistoryService，记录增删改/移动/层级；Ctrl+Z/Y。

- 依赖关系
  - 图层命令（3）依赖 节点/截图（1/2），并为 对齐/组/快捷键（4/5）的前置。
  - 样式模型（6）是 矢量节点（8）的前置，避免三类节点样式分裂。
  - 历史/撤销（10）依赖 操作服务化与统一 Action（在 3~5 同步铺垫）。

- 易踩坑与规避
  - 晚引入 zIndex 会导致对齐/组排序不稳；在步骤 3 固化 z 策略。
  - 在各组件直接操作 LogicFlow 难以回放；集中到 CanvasService 并产出可序列化 Action。
  - 本地存储图片空间有限；在 schema 预留 `assetId`，便于后续切换后端存储。
  - 截图基于 DOM 选择器易漂移；由 FlowEditor 提供 `getCanvasEl()`，Toolbar 仅依赖该接口。

- 验收停靠点
  - 1/2 结束：冻结顶层导出结构 v1（Root Document + LogicFlow GraphData）与截图容器约定；filesStore 开始写入 `schemaVersion`。（当前已完成：Root Document + GraphData + schemaVersion 持久化；截图容器约定待完成）
  - 3/4 结束：冻结 CanvasService API；层级/对齐操作均能回放。
  - 6 结束：统一样式模型，三类节点在 UI 中可一致编辑。
  - 8 结束：确认 SVG 导入/导出链路稳定。
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

