# 样式与节点结构说明（v1）

## 背景
- 目标：统一节点的样式字段与渲染消费路径，避免各节点分散管理填充/描边/阴影/文字等样式。
- 数据载体：沿用 LogicFlow 的 `GraphData`，仅约定 `node.properties` 内的业务字段与样式字段。

## 样式模型：`properties.style`
位于每个节点 `properties.style`，是尺寸与外观的单一事实来源；渲染时会同步 `style.width/height` 到节点的 `width/height`。

```ts
interface NodeStyle {
  // 尺寸与变换
  width: number;        // px，必填
  height: number;       // px，必填
  rotate?: number;      // deg，逆时针，围绕节点中心

  // 形状
  fill?: string;        // 背景填充色
  stroke?: string;      // 描边色
  strokeWidth?: number; // ≥0，px
  radius?: number | [number, number, number, number]; // 圆角（rect 生效）
  opacity?: number;     // 0..1

  // 阴影
  shadow?: { color?: string; blur?: number; offsetX?: number; offsetY?: number };

  // 文本样式（text 节点或带文本的节点）
  textStyle?: {
    color?: string;
    fontFamily?: string;
    fontSize?: number;          // px
    fontWeight?: number | string;
    lineHeight?: number;        // 推荐 1..3
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    letterSpacing?: number;     // px
    padding?: [number, number, number, number];
    background?: string;
  };
}
```

默认值参考 `src/ts/schema.ts:DefaultNodeStyle`：
- `width=180, height=120, rotate=0`
- `fill='#ffffff', stroke='#dcdfe6', strokeWidth=1, radius=4, opacity=1`
- `shadow={ color:'rgba(0,0,0,0.1)', blur:4, offsetX:0, offsetY:2 }`
- `textStyle={ color:'#303133', fontFamily:'system-ui', fontSize:14, fontWeight:400, lineHeight:1.4, align:'left', verticalAlign:'top', letterSpacing:0, padding:[8,8,8,8] }`

## 归一化与工具（`src/ts/nodeStyle.ts`）
- `normalizeNodeStyle(style, sizeFallback)`：补全缺省，数值钳制（opacity ∈[0,1]），将散落的 width/height 收敛到 style。
- `normalizePropertiesWithStyle(props)`：返回带规范化 style 的 props，并镜像 `width/height`。
- `toContainerStyle` / `toTextStyle`：将 `NodeStyle` 转为 Vue 行内样式（背景、描边、圆角、阴影、透明度 / 文字）。
- `styleEquals`：归一化后比较，避免重复 setProperties。

## 节点元信息：`properties.meta`
```ts
interface NodeMeta {
  z?: number;         // 层级
  locked?: boolean;   // 锁定
  visible?: boolean;  // 可见
  groupId?: string;   // 分组
  name?: string;
  createdAt?: number;
  updatedAt?: number;
}
```
FlowEditor 在渲染/normalize 时会补齐 `meta.visible=true`、`meta.locked=false` 并应用到节点模型（可见性、可拖拽等）。

## 监听与渲染路径
1) **归一化入口**：`FlowEditor.normalizeNodeModel` 在节点创建/属性变更/渲染后执行：
   - 归一化 `properties.style` 和 `meta`，必要时回写 `lf.setProperties`。
   - 同步 `style.width/height` 到节点模型，保证渲染尺寸一致。
2) **事件监听**：节点组件通过 composable 监听 `NODE_PROPERTIES_CHANGE`，实时更新样式与自定义数据。

## 复用方案：`useNodeAppearance`（`src/ts/useNodeAppearance.ts`）
作用：在节点组件中统一获取样式和属性变更。
```ts
const { containerStyle, textStyle } = useNodeAppearance({
  onPropsChange(props, node) {
    // 可在这里同步业务字段，例如 image url、shikigami 数据等
  }
});
```
内部行为：
- 注入 `getNode`/`getGraph`，挂载时读取当前节点 props。
- 监听 `NODE_PROPERTIES_CHANGE`，调用 `normalizeNodeStyle`，输出 `containerStyle`/`textStyle`。
- 自动解绑监听，减少重复代码。

已接入的节点组件：
- 图片节点 `src/components/flow/nodes/common/ImageNode.vue`
- 式神节点 `.../yys/ShikigamiSelectNode.vue`
- 御魂节点 `.../yys/YuhunSelectNode.vue`
- 属性节点 `.../yys/PropertySelectNode.vue`

## 编辑入口：PropertyPanel
- 样式面板 `src/components/flow/panels/StylePanel.vue` 写入 `properties.style`：
  - 填充色、描边色/线宽、圆角、阴影（色/模糊/偏移）、透明度
  - 文本对齐、行高、字重
- 图片面板 `ImagePanel.vue` 写入宽高/fit/url，并保持与 `style.width/height` 同步。
- 其他面板（式神/御魂/属性）仅写业务字段，样式统一由 `useNodeAppearance` 消费。

## 持久化与 schema
- 顶层导出结构：`RootDocument`（见 `docs/2design/DataModel.md`），包含 `schemaVersion`。
- 保存/导入路径：`useFilesStore` 写出/读入 `schemaVersion`；缺省数据走 `migrateToV1` 将散落的宽高/可见/锁定补齐到 `properties.style/meta`。

## 校验建议
- width/height > 0；strokeWidth ≥ 0；radius ≥ 0 或四元组合法；opacity ∈ [0,1]。
- 文本：fontSize > 0，lineHeight 合理（1~3），padding 四元组 ≥ 0。
- 圆角仅对 rect 类节点生效；其他 kind 忽略 radius。

## 后续扩展建议
- 文本节点接入富文本：在 `textStyle` 扩展行高倍数、字间距、背景/描边。
- 叠加高级效果：blendMode/filter；保持向后兼容，新增字段时通过 `schemaVersion` 控制迁移。
- 矢量节点：在 `vector` 节点中消费同一套 `style`，并在编辑面板复用 `StylePanel`。 
