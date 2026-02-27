import type { GroupRulesConfig } from '@/configs/groupRules'
import { readSharedGroupRulesConfig } from '@/utils/groupRulesConfigSource'

type GraphData = {
  nodes: any[]
  edges: any[]
}

type GroupAssetSnapshot = {
  groupId: string
  nodeIds: string[]
  shikigamiNames: string[]
  yuhunNames: string[]
}

export type GroupRuleWarning = {
  code: 'SHIKIGAMI_YUHUN_BLACKLIST' | 'SHIKIGAMI_CONFLICT' | 'MISSING_FIRE_SHIKIGAMI'
  groupId: string
  message: string
  nodeIds: string[]
}

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim()
}

const isAssetSelectorNode = (node: any): boolean => {
  return !!node && node.type === 'assetSelector'
}

const inferLibrary = (node: any): string => {
  const assetLibrary = normalizeText(node?.properties?.assetLibrary)
  if (assetLibrary) {
    return assetLibrary
  }

  const selectedLibrary = normalizeText(node?.properties?.selectedAsset?.library)
  if (selectedLibrary) {
    return selectedLibrary
  }

  const avatar = normalizeText(node?.properties?.selectedAsset?.avatar)
  if (avatar.includes('/Yuhun/')) {
    return 'yuhun'
  }
  if (avatar.includes('/Shikigami/')) {
    return 'shikigami'
  }
  return ''
}

const collectGroupAssets = (graphData: GraphData): GroupAssetSnapshot[] => {
  const groupMap = new Map<string, GroupAssetSnapshot>()

  const nodes = Array.isArray(graphData?.nodes) ? graphData.nodes : []
  nodes.forEach((node) => {
    if (!isAssetSelectorNode(node)) {
      return
    }

    const groupId = normalizeText(node?.properties?.meta?.groupId)
    if (!groupId) {
      return
    }

    const assetName = normalizeText(node?.properties?.selectedAsset?.name)
    if (!assetName) {
      return
    }

    if (!groupMap.has(groupId)) {
      groupMap.set(groupId, {
        groupId,
        nodeIds: [],
        shikigamiNames: [],
        yuhunNames: []
      })
    }

    const group = groupMap.get(groupId)!
    group.nodeIds.push(node.id)

    const library = inferLibrary(node)
    if (library === 'shikigami') {
      group.shikigamiNames.push(assetName)
      return
    }
    if (library === 'yuhun') {
      group.yuhunNames.push(assetName)
    }
  })

  return Array.from(groupMap.values())
}

const includesName = (list: string[], target: string): boolean => {
  return list.some((item) => item === target)
}

export const validateGraphGroupRules = (
  graphData: GraphData,
  config?: GroupRulesConfig
): GroupRuleWarning[] => {
  const effectiveConfig = config || readSharedGroupRulesConfig()
  const groups = collectGroupAssets(graphData)
  const warnings: GroupRuleWarning[] = []

  groups.forEach((group) => {
    effectiveConfig.shikigamiYuhunBlacklist.forEach((rule) => {
      if (includesName(group.shikigamiNames, rule.shikigami) && includesName(group.yuhunNames, rule.yuhun)) {
        warnings.push({
          code: 'SHIKIGAMI_YUHUN_BLACKLIST',
          groupId: group.groupId,
          nodeIds: group.nodeIds,
          message: rule.message || `规则冲突：${rule.shikigami} 不建议携带 ${rule.yuhun}。`
        })
      }
    })

    effectiveConfig.shikigamiConflictPairs.forEach((rule) => {
      if (includesName(group.shikigamiNames, rule.left) && includesName(group.shikigamiNames, rule.right)) {
        warnings.push({
          code: 'SHIKIGAMI_CONFLICT',
          groupId: group.groupId,
          nodeIds: group.nodeIds,
          message: rule.message || `规则冲突：${rule.left} 与 ${rule.right} 不建议同队。`
        })
      }
    })

    const hasShikigami = group.shikigamiNames.length > 0
    if (hasShikigami) {
      const hasFireShikigami = group.shikigamiNames.some((name) => effectiveConfig.fireShikigamiWhitelist.includes(name))
      if (!hasFireShikigami) {
        warnings.push({
          code: 'MISSING_FIRE_SHIKIGAMI',
          groupId: group.groupId,
          nodeIds: group.nodeIds,
          message: '规则提示：当前分组未检测到鬼火式神，建议补充供火位。'
        })
      }
    }
  })

  return warnings
}
