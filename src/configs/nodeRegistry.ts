/**
 * 节点注册表
 * 定义所有节点类型的配置信息
 */

import { NodeType, NodeCategory, type NodeTypeConfig } from '@/types/nodeTypes'

export const NODE_REGISTRY: Record<NodeType, NodeTypeConfig> = {
  [NodeType.RECT]: {
    type: NodeType.RECT,
    category: NodeCategory.LAYOUT,
    label: '矩形',
    description: '矩形容器，可设置背景和边框'
  },

  [NodeType.ELLIPSE]: {
    type: NodeType.ELLIPSE,
    category: NodeCategory.LAYOUT,
    label: '椭圆',
    description: '椭圆容器，可设置背景和边框'
  },

  [NodeType.DYNAMIC_GROUP]: {
    type: NodeType.DYNAMIC_GROUP,
    category: NodeCategory.LAYOUT,
    label: '动态分组',
    description: '支持折叠/收起与节点归组的容器'
  },

  [NodeType.ASSET_SELECTOR]: {
    type: NodeType.ASSET_SELECTOR,
    category: NodeCategory.ASSET,
    label: '资产选择器',
    description: '从预设资产库选择图片（式神、御魂等）',
    defaultProps: {
      assetLibrary: 'shikigami' // 默认式神库
    }
  },

  [NodeType.IMAGE_UPLOAD]: {
    type: NodeType.IMAGE_UPLOAD,
    category: NodeCategory.ASSET,
    label: '自定义图片',
    description: '上传自定义图片或填写URL'
  },

  [NodeType.TEXT_NODE]: {
    type: NodeType.TEXT_NODE,
    category: NodeCategory.TEXT,
    label: '文本',
    description: '可编辑的文本节点'
  },

  [NodeType.PROPERTY_SELECT]: {
    type: NodeType.PROPERTY_SELECT,
    category: NodeCategory.TEXT,
    label: '属性选择器',
    description: '选择游戏属性并配置规则'
  }
}
