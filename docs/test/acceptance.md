# yys-editor 验收测试点（手工）

目标：覆盖“用户素材上传/管理、资产引用、Dynamic Group 规则提示、规则管理（DSL/变量导入导出）、性能优化”等需求。

## 0. 基础启动与构建

步骤：
- `npm install`
- `npm run dev`
- `npm run build`

预期：
- dev 正常启动，页面可操作。
- build 成功输出 `dist/`。

## 1. 资产基路径与引用一致性

步骤：
- 在编辑器中插入素材节点（式神/御魂等），保存。
- 刷新页面或重新打开。

预期：
- 素材仍能正确显示。
- 对于以 `/assets/...` 开头的资源，能够在宿主子路径部署时被正确改写（由宿主配置/注入决定）。

排查点：
- `src/utils/assetUrl.ts` 的 `setAssetBaseUrl/getAssetBaseUrl/resolveAssetUrl`。

## 2. 用户素材上传与使用（我的素材）

步骤：
- 点击顶部工具栏“素材管理”，切到对应分类上传素材。
- 在画布添加一个 `assetSelector` 节点并选中，打开素材选择面板（AssetSelector）。
- 点击“上传我的素材”，选择一张图片。
- 在列表中找到该素材，点击选中。

预期：
- 新素材出现在“我的素材”分组。
- 选择后节点的 selectedAsset 生效并可渲染。

## 3. 用户素材删除与持久化

步骤：
- 上传 1 张素材。
- 删除该素材（按钮“删除”）。
- 刷新页面。

预期：
- 删除后不再出现在列表中。
- 刷新后不会复活（localStorage 已同步）。

排查点：
- `src/utils/customAssets.ts` 的 `list/save/delete/createCustomAssetFromFile`。
- `src/components/common/GenericImageSelector.vue` 的上传与删除逻辑。

## 4. 缺失资产的降级策略（本地自玩导出图）

目的：验证“场景 1：仅 yys-editor 使用并导出图片时，缺失资产不应崩溃”。

步骤：
- 将某个节点的 avatar 修改为不存在路径或不可访问路径（用于测试）。
- 尝试导出/渲染。

预期：
- 不出现阻断性异常（可降级为占位或提示）。

备注：
- 若目前仅实现 wiki 侧降级：记录为“待补 yys-editor 侧降级策略”。

## 5. Dynamic Group 分组（基础行为）

步骤：
- 在画布上创建多个节点。
- 创建动态分组（Dynamic Group），将节点加入/移出分组。
- 仅选中 Dynamic Group 执行 `Ctrl+C` / `Ctrl+V`，观察粘贴结果。

预期：
- 分组操作成功。
- 分组信息能写入节点 meta（用于规则检查）。
- 复制分组时会自动携带组内节点（官方行为），新旧分组互不串联拖拽。

排查点：
- `src/components/flow/FlowEditor.vue` 使用 LogicFlow 默认快捷键复制粘贴（`shortcut.js -> lf.addElements`）。

## 11. 导出图片时隐藏 Dynamic Group（视觉优化）

步骤：
- 在画布创建 Dynamic Group，并放入若干子节点。
- 点击“准备截图”并下载图片。

预期：
- 导出的图片中不显示 Dynamic Group 容器边框。
- 组内节点与其他节点正常显示。
- 导出完成后，编辑器画布中的 Dynamic Group 仍可见（只在导出瞬间隐藏）。

排查点：
- `src/components/Toolbar.vue` 的 `captureLogicFlowSnapshot` 及临时隐藏/恢复逻辑。

## 6. 规则静态检查（分组内）

步骤：
- 在同一分组中放入：
  - “辉夜姬” 与 “破势”
  - 只有式神但没有供火式神（不含供火名单）
- 观察右侧/控制区的规则提示列表。

预期：
- 出现对应警告提示（当前默认预制规则）：
  - `TEAM_KAGUYA_POSHI_CONFLICT`
  - `TEAM_MISSING_FIRE_SHIKIGAMI`
- 取消分组、移除节点后提示实时更新/消失。

排查点：
- `src/configs/groupRules.ts`（预制规则与变量）
- `src/utils/groupRules.ts`（按 expressionRules 解析）
- `src/components/flow/FlowEditor.vue` 的 `scheduleGroupRuleValidation(...)` 调度时机。

## 6.1 规则管理（表格化 + 导入导出）

步骤：
- 点击顶部工具栏“规则管理”。
- 在“规则”tab 验证单行表格展示（启用勾选、级别、规则ID、条件、提示）。
- 点击“编辑”打开单独弹窗修改规则并保存。
- 在“变量”tab 修改变量后点击“应用并生效”。
- 点击“导出规则变量”导出 JSON，再点击“导入规则变量”导入。

预期：
- 规则列表为单行表格，不再是大块卡片编辑。
- 规则编辑在弹窗中完成，保存后回填列表。
- 导入后提示“请点击应用并生效”，应用后 Problems 立即刷新。
- 导出文件包含：`version`、`expressionRules`、`ruleVariables`。

排查点：
- `src/components/Toolbar.vue`（规则管理 UI 与导入导出）
- `src/utils/groupRulesConfigSource.ts`（配置写入与广播）

## 7. 性能回归（矢量节点快速缩放）

步骤：
- 放置矢量节点（VectorNode）。
- 快速缩放、连续拖动缩放柄。

预期：
- 明显卡顿减少，不出现“缩放一下就卡死”的体验。

排查点：
- `src/components/flow/nodes/common/VectorNode.vue` 的 RAF 合并更新逻辑。

## 8. 导出给 wiki 的兼容性（数据结构）

步骤：
- 生成一份包含分组、素材、文本等内容的 graphData。
- 将 JSON 用于 wiki 的 FlowPreview/editor。

预期：
- wiki 侧能正常 normalize 并预览（节点 off-canvas 会自动平移回可视区）。

## 9. 跨项目互通验收（yys-editor <-> onmyoji-wiki/editor）

目标：确认素材与规则在两个项目间的复用边界。

### 9.1 素材互通（同 origin）

步骤：
- 在 yys-editor 上传“我的素材”。
- 在同一浏览器、同一 origin 打开 `onmyoji-wiki/editor` 并检查素材选择。

预期（当前实现）：
- 可直接复用“我的素材”，无需重复导入。

说明：
- 素材走 localStorage（`yys-editor.custom-assets.v1`）。
- 仅同 origin 互通；跨 origin 默认不互通。

### 9.2 规则互通（同 origin）

步骤：
- 在 yys-editor 写入共享规则配置（localStorage 键：`yys-editor.group-rules.v1`）。
- 进入 `onmyoji-wiki/editor` 检查提示是否同步。

预期（当前实现）：
- yys-editor：优先读取 `yys-editor.group-rules.v1`，解析失败/缺失时回退内置默认规则。
- onmyoji-wiki：未对接共享规则配置源前，仍使用本仓默认规则。

结论：
- 共享规则配置源已在 yys-editor 落地；wiki 侧仍需按同键读取以完成双向一致。

## 10. 回归清单（状态跟踪）

- [x] 基础启动与构建通过（`npm install` / `npm run dev` / `npm run build`）。
- [ ] 资产基路径与引用一致性通过（`/assets/...` 在宿主子路径下可正确解析）。
- [x] 用户素材上传与使用通过（我的素材可新增并可用于节点）。
- [x] 用户素材删除与持久化通过（删除后刷新不复活）。
- [ ] 缺失资产降级策略通过（不阻断导出/渲染）。
- [x] Dynamic Group 分组基础行为通过（分组信息写入 `meta.groupId`，复制分组会携带组内节点）。
- [x] 分组规则静态检查通过（冲突与供火提示正确且可实时更新）。
- [x] 规则管理通过（规则列表表格化、弹窗编辑、导入导出可用）。
- [x] 矢量节点快速缩放性能回归通过（无明显卡顿/卡死）。
- [ ] 导出到 wiki 数据兼容通过（wiki 侧可 normalize 与预览）。
- [ ] 跨项目素材互通通过（同 origin 可复用素材，跨 origin 不互通）。
- [ ] 跨项目规则互通方案确认（共享配置源定义、两侧读取一致）。
- [x] 导出图片时隐藏 Dynamic Group 通过（导出前隐藏，导出后恢复）。

当前状态（2026-02-27）：
- 已通过：8 项（基础启动与构建、用户素材上传与使用、用户素材删除与持久化、Dynamic Group 分组基础行为、分组规则静态检查、规则管理、矢量节点快速缩放性能回归、导出图片时隐藏 Dynamic Group）。
- 部分通过：1 项（跨项目规则互通方案确认）。
- 未通过/待验证：4 项（其余项待完整手测或跨仓联调）。

逐项状态：
- 基础启动与构建：已通过
- 资产基路径与引用一致性：未通过（待手测）
- 用户素材上传与使用：已通过
- 用户素材删除与持久化：已通过
- 缺失资产降级策略：未通过（待手测）
- Dynamic Group 分组基础行为：已通过
- 分组规则静态检查：已通过
- 规则管理（表格化/导入导出）：已通过
- 矢量节点快速缩放性能回归：已通过
- 导出到 wiki 数据兼容：未通过（待跨仓联测）
- 跨项目素材互通：未通过（待同 origin 联测）
- 跨项目规则互通方案确认：部分通过（yys-editor 已落地，wiki 待读取同源配置）
- 导出图片时隐藏 Dynamic Group：已通过
