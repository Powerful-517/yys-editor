export const CURRENT_SCHEMA_VERSION = '1.0.0';

export interface Transform {
  SCALE_X: number;
  SCALE_Y: number;
  TRANSLATE_X: number;
  TRANSLATE_Y: number;
}

export interface NodeStyle {
  // Size and transform
  width: number;
  height: number;
  rotate?: number; // deg

  // Shape/appearance
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number | [number, number, number, number];
  opacity?: number; // 0..1

  // Shadow
  shadow?: {
    color?: string;
    blur?: number;
    offsetX?: number;
    offsetY?: number;
  };

  // Text style for text node or nodes with text
  textStyle?: {
    color?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number | string;
    lineHeight?: number;
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    letterSpacing?: number;
    padding?: [number, number, number, number];
    background?: string;
  };
}

export interface NodeMeta {
  z?: number;
  locked?: boolean;
  visible?: boolean;
  groupId?: string;
  name?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface NodeProperties {
  style: NodeStyle;
  meta?: NodeMeta;
  image?: { url: string; fit?: 'fill'|'contain'|'cover' };
  text?: { content: string; rich?: boolean };
  vector?: { kind: 'path'|'rect'|'ellipse'|'polygon'; path?: string; points?: Array<[number, number]> };
  shikigami?: { name: string; avatar: string; rarity: string };
  yuhun?: { name: string; type: string; avatar: string; shortName?: string };
  property?: Record<string, any>;
}

export interface GraphNode {
  id: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  properties: NodeProperties;
}

export interface GraphEdge {
  id: string;
  type?: string;
  sourceNodeId: string;
  targetNodeId: string;
  properties?: Record<string, any>;
}

export interface GraphDocument { nodes: GraphNode[]; edges: GraphEdge[]; }

export interface FlowFile {
  label: string;
  name: string;
  visible: boolean;
  type: string; // 'FLOW'
  graphRawData: GraphDocument;
  transform: Transform;
  createdAt?: number;
  updatedAt?: number;
  id?: string;
}

export interface RootDocument {
  schemaVersion: string;
  fileList: FlowFile[];
  activeFile: string;
}

export const DefaultNodeStyle: NodeStyle = {
  width: 180,
  height: 120,
  rotate: 0,
  fill: '#ffffff',
  stroke: '#dcdfe6',
  strokeWidth: 1,
  radius: 4,
  opacity: 1,
  shadow: { color: 'rgba(0,0,0,0.1)', blur: 4, offsetX: 0, offsetY: 2 },
  textStyle: {
    color: '#303133',
    fontFamily: 'system-ui',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.4,
    align: 'left',
    verticalAlign: 'top',
    letterSpacing: 0,
    padding: [8, 8, 8, 8],
  },
};

function ensureTransform(t?: Partial<Transform>): Transform {
  return {
    SCALE_X: t?.SCALE_X ?? 1,
    SCALE_Y: t?.SCALE_Y ?? 1,
    TRANSLATE_X: t?.TRANSLATE_X ?? 0,
    TRANSLATE_Y: t?.TRANSLATE_Y ?? 0,
  };
}

// Migration to v1 root document
export function migrateToV1(input: any): RootDocument {
  const now = Date.now();

  // Normalize a single node into the v1 shape (properties.style + meta, width/height mirrored)
  const migrateNode = (node: any): GraphNode => {
    const n: any = { ...node };
    const props: any = n.properties ?? {};
    const style: any = props.style ?? {};
    const meta: any = props.meta ?? {};

    // Prefer explicit style width/height; otherwise fall back to scattered fields
    const propWidth = props.width ?? props.w;
    const propHeight = props.height ?? props.h;

    if (style.width == null) {
      if (propWidth != null) {
        style.width = propWidth;
      } else if (n.width != null) {
        style.width = n.width;
      }
    }
    if (style.height == null) {
      if (propHeight != null) {
        style.height = propHeight;
      } else if (n.height != null) {
        style.height = n.height;
      }
    }

    // Ensure meta defaults
    if (meta.visible == null) meta.visible = true;
    if (meta.locked == null) meta.locked = false;

    props.style = style;
    props.meta = meta;
    n.properties = props;

    // Mirror back to node width/height for render engines that still read from the node itself
    if (style.width != null) n.width = style.width;
    if (style.height != null) n.height = style.height;

    return n as GraphNode;
  };

  const ensureGraphDocument = (f: any): GraphDocument => {
    const raw = (f?.graphRawData && typeof f.graphRawData === 'object')
      ? f.graphRawData
      : { nodes: [], edges: [] };
    const nodes = Array.isArray(raw.nodes) ? raw.nodes.map(migrateNode) : [];
    const edges = Array.isArray(raw.edges) ? raw.edges : [];
    return { nodes, edges };
  };

  const wrap = (files: any[], active?: string): RootDocument => ({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    fileList: files.map((f, i) => ({
      label: f?.label ?? `File ${i + 1}`,
      name: f?.name ?? `File ${i + 1}`,
      visible: f?.visible ?? true,
      type: f?.type ?? 'FLOW',
      graphRawData: ensureGraphDocument(f),
      transform: ensureTransform(f?.transform),
      createdAt: f?.createdAt ?? now,
      updatedAt: f?.updatedAt ?? now,
      id: f?.id,
    })),
    activeFile: active ?? (files[0]?.name ?? 'File 1'),
  });

  if (!input) {
    return wrap([{ label: 'File 1', name: 'File 1', visible: true, type: 'FLOW' }]);
  }

  if (Array.isArray(input)) {
    return wrap(input);
  }

  if (typeof input === 'object' && 'fileList' in input) {
    const active = (input as any).activeFile;
    const files = (input as any).fileList ?? [];
    const root = wrap(files, active);
    // Preserve version if present
    root.schemaVersion = (input as any).schemaVersion || CURRENT_SCHEMA_VERSION;
    return root;
  }

  // Oldest shape: treat input as groups array and wrap
  return wrap([{ label: 'File 1', name: 'File 1', visible: true, type: 'FLOW', groups: input }]);
}
