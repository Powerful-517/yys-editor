/**
 * 节点类型系统
 * 将节点分为三大类：布局容器、图形资产、结构化文本
 */

export enum NodeCategory {
  LAYOUT = 'layout',      // 布局容器
  ASSET = 'asset',        // 图形资产
  TEXT = 'text'           // 结构化文本
}

export enum NodeType {
  // 布局容器类
  RECT = 'rect',
  ELLIPSE = 'ellipse',
  DYNAMIC_GROUP = 'dynamic-group',

  // 图形资产类（统一入口，内部切换资产库）
  ASSET_SELECTOR = 'assetSelector',
  IMAGE_UPLOAD = 'imageUpload',

  // 结构化文本类
  TEXT_NODE = 'textNode',

  // 特殊节点（保持独立）
  PROPERTY_SELECT = 'propertySelect'
}

export interface AssetLibrary {
  id: string
  label: string
  selectorPreset: string
}

export const ASSET_LIBRARIES: AssetLibrary[] = [
  { id: 'shikigami', label: '式神', selectorPreset: 'shikigami' },
  { id: 'yuhun', label: '御魂', selectorPreset: 'yuhun' },
  { id: 'onmyoji', label: '阴阳师', selectorPreset: 'onmyoji' },
  { id: 'onmyojiSkill', label: '阴阳师技能', selectorPreset: 'onmyojiSkill' }
  // 未来可扩展：技能图标、装备等
]

export interface NodeTypeConfig {
  type: NodeType
  category: NodeCategory
  label: string
  description: string
  icon?: string
  defaultProps?: Record<string, any>
}
