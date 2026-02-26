# yys-editor 验收测试点（手工）

目标：覆盖“用户素材上传/管理、资产引用、Dynamic Group 规则提示、性能优化”等需求。

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
- 打开素材选择面板（AssetSelector）。
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

预期：
- 分组操作成功。
- 分组信息能写入节点 meta（用于规则检查）。

## 6. 规则静态检查（分组内）

步骤：
- 在同一分组中放入：
  - “辉夜姬” 与 “破势”
  - “千姬” 与 “腹肌清姬/蝮骨清姬”
  - 只有式神但没有供火式神
- 观察右侧/控制区的规则提示列表。

预期：
- 出现对应警告提示。
- 取消分组、移除节点后提示实时更新/消失。

排查点：
- `src/utils/groupRules.ts`、`src/configs/groupRules.ts`。
- `src/components/flow/FlowEditor.vue` 的 `scheduleGroupRuleValidation(...)` 调度时机。

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

