export interface GroupConfig<T = any> {
  label: string
  name: string
  filter?: (item: T) => boolean
}

export interface SelectorItemRender {
  imageField: string
  labelField: string
  imageSize?: number
}

export interface SelectorConfig<T = any> {
  title: string
  dataSource: T[]
  // Some selector data sources only use ALL tab, so this can be null/undefined.
  groupField?: string | null
  groups: GroupConfig<T>[]
  itemRender: SelectorItemRender
  searchable?: boolean
  searchFields?: string[]
  currentItem?: T | null
  assetLibrary?: string
  allowUserAssetUpload?: boolean
  onDeleteUserAsset?: (item: T) => void
  onUserAssetUploaded?: (item: T) => void
}
