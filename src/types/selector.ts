/**
 * 通用选择器配置接口
 * 用于配置驱动的图片选择器组件
 */

export interface GroupConfig {
  label: string                    // Tab显示标签
  name: string                     // Tab标识符
  filter?: (item: any) => boolean  // 自定义过滤函数（可选）
}

export interface SelectorConfig<T = any> {
  // 基础配置
  title: string                    // 对话框标题
  dataSource: T[]                  // 数据源
  groupField: string               // 分组字段名 (如 'rarity', 'type')

  // 分组配置
  groups: GroupConfig[]            // Tab分组配置

  // 展示配置
  itemRender: {
    imageField: string             // 图片字段名 (如 'avatar')
    labelField: string             // 标签字段名 (如 'name')
    imageSize?: number             // 图片尺寸，默认100px
  }

  // 搜索配置
  searchable?: boolean             // 是否启用搜索，默认true
  searchFields?: string[]          // 搜索字段，默认使用labelField

  // 当前选中项
  currentItem?: T
}
