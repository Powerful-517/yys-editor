# 数据模型（v1）

目标：在保持 LogicFlow 原生 GraphData 结构不改造的前提下，只定义顶层导出结构（Root Document）和节点业务字段，并通过 `schemaVersion` 管理导入导出与迁移，让精力集中在阴阳师业务数据上。

## 顶层导出结构（Root Document）

- 约定导出/本地持久化数据统一为如下结构，并包含 `schemaVersion`。

```json
{
  "schemaVersion": "1.0.0",
  "fileList": [
    {
      "id": "file-1",
      "label": "File 1",
      "name": "File 1",
      "type": "FLOW",
      "visible": true,
      "graphRawData": { "nodes": [], "edges": [] },
      "transform": {
        "SCALE_X": 1,
        "SCALE_Y": 1,
        "TRANSLATE_X": 0,
        "TRANSLATE_Y": 0
      },
      "createdAt": 0,
      "updatedAt": 0
    }
  ],
  "activeFileId": "file-1",
  "activeFile": "File 1"
}
```

- 存量数据（无 `schemaVersion`）在加载时默认视为 `"0.x"`，并通过迁移器补齐。

## Graph/Node 基础模型

Graph/Node 结构整体沿用 LogicFlow 的 GraphData 定义（nodes/edges、id/type/x/y/width/height 等）；我们只约定节点 `properties` 中的业务字段，并在需要时适配 LogicFlow 的样式/图层信息，而不是重新定义一套独立的画布数据模型。

```ts
// Graph 文档（嵌入在每个 file.graphRawData 内）
interface GraphDocument {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphNode {
  id: string;
  type: string;          // imageNode | textNode | vectorNode | shikigamiSelect | yuhunSelect | propertySelect | ...
  x?: number;            // LogicFlow 原生定位
  y?: number;
  width?: number;        // 渲染冗余：由 properties.style.width 同步而来
  height?: number;       // 渲染冗余：由 properties.style.height 同步而来
  properties: NodeProperties;
}

interface GraphEdge {
  id: string;
  type?: string;
  sourceNodeId: string;
  targetNodeId: string;
  properties?: Record<string, any>;
}

interface NodeProperties {
  style: NodeStyle;      // 通用样式
  meta?: NodeMeta;       // 通用元信息（层级/锁定/可见/分组等）
  // 具体节点类型的扩展字段（如下）
  image?: ImageProps;
  text?: TextProps;
  vector?: VectorProps;
  shikigami?: ShikigamiProps;
  yuhun?: YuhunProps;
  property?: PropertyRuleProps;
}

interface NodeStyle {
  // 尺寸与变换（单一事实来源）
  width: number;      // px
  height: number;     // px
  rotate?: number;    // deg，逆时针为正；围绕节点中心旋转

  // 形状/外观
  fill?: string;          // 颜色：#RGB/#RRGGBB/#RRGGBBAA/rgba()/transparent 等
  stroke?: string;        // 描边色
  strokeWidth?: number;   // px，≥ 0
  radius?: number | [number, number, number, number]; // 圆角；rect 有效，path/polygon 无效
  opacity?: number;       // 0..1

  // 阴影
  shadow?: {
    color?: string;
    blur?: number;        // px
    offsetX?: number;     // px
    offsetY?: number;     // px
  };

  // 文本样式（当 text 节点或带文本的复合节点需要）
  textStyle?: {
    color?: string;
    fontFamily?: string;
    fontSize?: number;    // px，> 0
    fontWeight?: number | string; // 400/700 或 normal/bold
    lineHeight?: number;  // 1..3
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom'; // 多行：用容器高度+行高模拟
    letterSpacing?: number; // px
    padding?: [number, number, number, number]; // 上右下左，≥ 0
    background?: string;  // 可选
  };
}
interface NodeMeta {
  z?: number;            // 显式层级，缺省按插入顺序
  locked?: boolean;      // 锁定（不可选/不可拖动）
  visible?: boolean;     // 可见性
  groupId?: string;      // 组合/分组标识
  name?: string;         // 可选显示名
  createdAt?: number;
  updatedAt?: number;
}
```

> 说明：上述 `GraphDocument`、`GraphNode`、`GraphEdge`、`NodeStyle`、`NodeMeta` 主要用于说明结构，实际实现直接使用 LogicFlow 提供的 GraphData；样式/图层字段属于可选扩展，v1 只要求节点 `properties` 中的业务字段与阴阳师相关业务数据。

## 节点类型扩展字段

- Image（imageNode）
```ts
interface ImageProps {
  url: string;                         // 图片地址（本地 base64 或 assetId 由上层解析）
  fit?: 'fill' | 'contain' | 'cover';  // 渲染适配
}
```

- Text（textNode）
```ts
interface TextProps {
  content: string;                     // 文本内容（富文本后续扩展）
  rich?: boolean;                      // 是否富文本（v1 仅纯文本）
}
```

- Vector（vectorNode）
```ts
interface VectorProps {
  kind: 'path' | 'rect' | 'ellipse' | 'polygon';
  path?: string;                       // 当 kind=path 时的 SVG Path 数据（M/L/C...）
  points?: Array<[number, number]>;    // 当 polygon 时的顶点（可选）
}
```

- Shikigami/阴阳师节点（保留现有结构）
```ts
interface ShikigamiProps { name: string; avatar: string; rarity: string; }
interface YuhunProps { name: string; type: string; avatar: string; shortName?: string; }
// PropertyRuleProps（属性/御魂要求）延用现有字段，后续按规则引擎再细化
interface PropertyRuleProps { [k: string]: any }
```

## 同步与渲染约定
- 源数据以 `properties.style.width/height` 为准；渲染时将其同步到节点 `width/height`。
- 层级以 `properties.meta.z` 为准；渲染前对 nodes 进行稳定排序（先 z，再 createdAt）。
- 通用样式仅描述；具体生效由各节点视图组件（.vue）解释执行。

- `vector.kind='rect'` 时 `radius` 生效；`path/polygon` 忽略；`fill/stroke/strokeWidth/opacity` 对所有 kind 生效。
- 旋转以节点中心为基点；正值逆时针；不单独提供 `transformOrigin` 字段（如需将以兼容方式新增）。
## 默认值（v1）
```ts
const DefaultNodeStyle: NodeStyle = {
  width: 180, height: 120, rotate: 0,
  fill: '#ffffff', stroke: '#dcdfe6', strokeWidth: 1, radius: 4, opacity: 1,
  shadow: { color: 'rgba(0,0,0,0.1)', blur: 4, offsetX: 0, offsetY: 2 },
  textStyle: { color: '#303133', fontFamily: 'system-ui', fontSize: 14, fontWeight: 400, lineHeight: 1.4, align: 'left', verticalAlign: 'top', letterSpacing: 0, padding: [8,8,8,8] }
};
```

## useStore 接入点与 schemaVersion
- 保存/导出：在 `saveStateToLocalStorage` 与 `exportData` 输出中添加 `schemaVersion: "1.0.0"`。
- 读取/导入：`loadStateFromLocalStorage`/`importData` 检测 `schemaVersion`；无则走迁移器补齐：
  - 若 `node.width/height` 存在但 `properties.style` 缺失，创建 `style` 并拷贝宽高；
  - 给所有节点补 `meta.visible=true`，`meta.locked=false`；
  - 生成 `createdAt/updatedAt`（以当前时间或从已有字段推断）。
- 常量：`const CURRENT_SCHEMA_VERSION = '1.0.0'` 存放于 `src/ts/useStore.ts` 或 `src/ts/schema.ts`。

- 导出：同时写出 `activeFileId` 与 `activeFile`（名称），以兼容旧版。
- 导入：优先使用 `activeFileId` 匹配；若缺失则回退按 `activeFile`（名称）匹配；两者都缺则选首个文件。
## 迁移策略（v0 → v1）
1) 判定：无 `schemaVersion` 视为 v0。
2) 节点迁移：
   - 将节点的 `width/height` 写入 `properties.style`；
   - 若节点已有颜色/文本样式散落在 `properties`，合并到 `properties.style.*` 或 `textStyle`；
   - 未定义的字段保持原样存放于 `properties`，由节点视图兼容。
3) 文件级：给每个 file 增加 `id/createdAt/updatedAt`（可选）。
4) 顶层：补 `schemaVersion='1.0.0'`。

## 示例（含三类基础节点）
```json
{
  "schemaVersion": "1.0.0",
  "fileList": [
    {
      "id": "file-1",
      "label": "海报示例",
      "name": "海报示例",
      "type": "FLOW",
      "visible": true,
      "graphRawData": {
        "nodes": [
          {
            "id": "n-image-1",
            "type": "imageNode",
            "x": 200, "y": 160,
            "properties": {
              "style": { "width": 300, "height": 200, "radius": 8, "opacity": 1 },
              "meta": { "z": 1, "visible": true, "locked": false },
              "image": { "url": "/assets/banner.png", "fit": "cover" }
            }
          },
          {
            "id": "n-text-1",
            "type": "textNode",
            "x": 220, "y": 180,
            "properties": {
              "style": {
                "width": 260, "height": 80,
                "textStyle": { "color": "#111", "fontFamily": "Microsoft YaHei", "fontSize": 24, "fontWeight": 700, "align": "left" }
              },
              "meta": { "z": 2 },
              "text": { "content": "阴阳师阵容编辑器" }
            }
          },
          {
            "id": "n-vector-1",
            "type": "vectorNode",
            "x": 180, "y": 300,
            "properties": {
              "style": { "width": 360, "height": 6, "fill": "#409EFF" },
              "meta": { "z": 0 },
              "vector": { "kind": "rect" }
            }
          }
        ],
        "edges": []
      },
      "transform": { "SCALE_X": 1, "SCALE_Y": 1, "TRANSLATE_X": 0, "TRANSLATE_Y": 0 }
    }
  ],
  "activeFileId": "file-1",
  "activeFile": "海报示例"
}
```

## 校验要点（建议）
- width/height > 0；opacity ∈ [0,1]；strokeWidth ≥ 0；radius ≥ 0 或四元组均合法。
- 文本：fontSize > 0；lineHeight ∈ [1, 3]；padding 四元组 ≥ 0。
- z 可为空（使用插入顺序），若存在必须为整数。
- `radius` 仅在 `vector.kind='rect'` 生效，其他 `kind` 忽略。

## 实施清单（与代码关联）
1) `src/ts/useStore.ts`
   - 导出/保存时写入 `schemaVersion`；导入/读取时若缺失则调用 `migrateToV1(state)`。
   - 定义 `CURRENT_SCHEMA_VERSION = '1.0.0'`；新增 `migrateToV1`（按上文迁移策略）。
2) `src/components/flow/FlowEditor.vue`
   - 渲染前对 `nodes` 按 `meta.z` 与 `createdAt` 稳定排序；
   - `render` 前将 `properties.style.width/height` 同步到节点尺寸。
3) 节点视图（*.vue）
   - image/text/vector 节点按 `properties.style` 解析样式；
   - 旧字段兼容期内保留 fallback，逐步迁出。
4) 属性面板 `PropertyPanel.vue`
   - 统一读取/写入 `properties.style.*`；文本属性写入 `textStyle` 与 `text.content`。

---

附注：v1 仅定义统一样式容器与最小字段集合；后续可在不破坏兼容的前提下增量扩展（如 blendMode、滤镜等），并通过 `schemaVersion` 控制迁移。
