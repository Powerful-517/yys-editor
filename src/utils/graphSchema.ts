export const GROUP_META_VERSION = 1
export const DEFAULT_GROUP_RULE_SCOPE = ['shikigami-yuhun', 'shikigami-shikigami']

export type GroupKind = 'team' | 'shikigami'

export type DynamicGroupMeta = {
  version: number
  groupKind: GroupKind
  groupName: string
  ruleEnabled: boolean
  ruleScope: string[]
}

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')
const normalizeLibrary = (value: unknown): string => normalizeText(value).toLowerCase()

const inferLibraryFromAvatar = (avatar: string): string => {
  if (!avatar) return ''
  if (avatar.includes('/Yuhun/')) return 'yuhun'
  if (avatar.includes('/Shikigami/')) return 'shikigami'
  if (avatar.includes('/hero_')) return 'onmyoji'
  return ''
}

const createStableHash = (seed: string): string => {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

const normalizeStringList = (value: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(value)) {
    return [...fallback]
  }
  const normalized = value
    .map((item) => normalizeText(item))
    .filter((item) => !!item)
  return normalized.length ? Array.from(new Set(normalized)) : [...fallback]
}

export const normalizeDynamicGroupMeta = (input: unknown, fallbackKind: GroupKind = 'team'): DynamicGroupMeta => {
  const raw = input && typeof input === 'object' ? input as Record<string, unknown> : {}
  const versionCandidate = Number(raw.version)
  const version = Number.isFinite(versionCandidate) && versionCandidate > 0
    ? Math.trunc(versionCandidate)
    : GROUP_META_VERSION
  const groupKind: GroupKind = raw.groupKind === 'shikigami' ? 'shikigami' : fallbackKind
  const groupName = normalizeText(raw.groupName)
  const ruleEnabled = raw.ruleEnabled !== false
  const ruleScope = normalizeStringList(raw.ruleScope, DEFAULT_GROUP_RULE_SCOPE)

  return {
    version,
    groupKind,
    groupName,
    ruleEnabled,
    ruleScope
  }
}

const normalizeChildren = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return Array.from(
    new Set(
      value
        .map((item) => normalizeText(item))
        .filter((item) => !!item)
    )
  )
}

export const getDynamicGroupChildIds = (node: any): string[] => {
  const nodeChildren = normalizeChildren(node?.children)
  const propertyChildren = normalizeChildren(node?.properties?.children)
  return nodeChildren.length ? nodeChildren : propertyChildren
}

export const normalizeSelectedAssetRecord = (input: unknown, preferredLibrary = ''): Record<string, unknown> | null => {
  if (!input || typeof input !== 'object') {
    return null
  }

  const raw = input as Record<string, unknown>
  const name = normalizeText(raw.name)
  const avatar = normalizeText(raw.avatar)
  const library = normalizeLibrary(raw.library) || normalizeLibrary(preferredLibrary) || inferLibraryFromAvatar(avatar)
  const sourceId = normalizeText(raw.assetId)
    || normalizeText(raw.id)
    || normalizeText(raw.skillId)
    || normalizeText(raw.onmyojiId)
  const identitySeed = sourceId || `${name}|${avatar}|${library}`
  const assetId = sourceId
    ? `${library || 'asset'}:${sourceId}`
    : `asset_${createStableHash(identitySeed || String(Date.now()))}`

  return {
    ...raw,
    ...(name ? { name } : {}),
    ...(avatar ? { avatar } : {}),
    library: library || 'shikigami',
    assetId
  }
}

export const normalizeGraphRawDataSchema = (graphData: any): { nodes: any[]; edges: any[] } => {
  const rawNodes = Array.isArray(graphData?.nodes) ? graphData.nodes : []
  const rawEdges = Array.isArray(graphData?.edges) ? graphData.edges : []

  const nodes = rawNodes.map((node: any) => {
    const properties = node?.properties && typeof node.properties === 'object'
      ? { ...node.properties }
      : {}

    if (node?.type === 'dynamic-group') {
      const children = getDynamicGroupChildIds(node)
      return {
        ...node,
        children,
        properties: {
          ...properties,
          children,
          groupMeta: normalizeDynamicGroupMeta(properties.groupMeta)
        }
      }
    }

    if (node?.type === 'assetSelector') {
      const currentLibrary = normalizeLibrary(properties.assetLibrary) || 'shikigami'
      const selectedAsset = normalizeSelectedAssetRecord(properties.selectedAsset, currentLibrary)
      return {
        ...node,
        properties: {
          ...properties,
          assetLibrary: selectedAsset?.library || currentLibrary,
          selectedAsset
        }
      }
    }

    return {
      ...node,
      properties
    }
  })

  return {
    nodes,
    edges: rawEdges
  }
}
