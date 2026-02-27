import type { GroupRulesConfig } from '@/configs/groupRules'
import { readSharedGroupRulesConfig } from '@/utils/groupRulesConfigSource'
import { getDynamicGroupChildIds, normalizeGraphRawDataSchema } from '@/utils/graphSchema'

type GraphData = {
  nodes: any[]
  edges: any[]
}

type TeamAsset = {
  nodeId: string
  assetId: string
  name: string
  library: string
}

type TeamAssetSnapshot = {
  groupId: string
  groupName: string
  nodeIds: string[]
  shikigamiAssets: TeamAsset[]
  yuhunAssets: TeamAsset[]
}

export type GroupRuleWarning = {
  id: string
  ruleId: string
  code: 'SHIKIGAMI_YUHUN_BLACKLIST' | 'SHIKIGAMI_CONFLICT' | 'MISSING_FIRE_SHIKIGAMI'
  severity: 'warning' | 'error' | 'info'
  groupId: string
  groupName?: string
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

const isDynamicGroupNode = (node: any): boolean => {
  return !!node && node.type === 'dynamic-group'
}

const inferLibrary = (node: any): string => {
  const assetLibrary = normalizeText(node?.properties?.assetLibrary).toLowerCase()
  if (assetLibrary) {
    return assetLibrary
  }

  const selectedLibrary = normalizeText(node?.properties?.selectedAsset?.library).toLowerCase()
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

const includesName = (list: string[], target: string): boolean => {
  return list.some((item) => item === target)
}

const dedupeNodeIds = (ids: string[]): string[] => Array.from(new Set(ids))

const collectTeamAssetSnapshots = (graphData: GraphData): TeamAssetSnapshot[] => {
  const nodes = Array.isArray(graphData?.nodes) ? graphData.nodes : []
  const nodeMap = new Map<string, any>()
  nodes.forEach((node) => {
    const nodeId = normalizeText(node?.id)
    if (!nodeId) return
    nodeMap.set(nodeId, node)
  })

  const teamGroups = nodes.filter((node) => {
    if (!isDynamicGroupNode(node)) return false
    const groupKind = normalizeText(node?.properties?.groupMeta?.groupKind)
    const ruleEnabled = node?.properties?.groupMeta?.ruleEnabled !== false
    return groupKind === 'team' && ruleEnabled
  })

  return teamGroups.map((teamNode) => {
    const teamId = normalizeText(teamNode?.id) || 'unknown-team'
    const teamName = normalizeText(teamNode?.properties?.groupMeta?.groupName)
    const queue = [...getDynamicGroupChildIds(teamNode)]
    const visited = new Set<string>()
    const shikigamiAssets: TeamAsset[] = []
    const yuhunAssets: TeamAsset[] = []

    while (queue.length > 0) {
      const currentId = queue.shift() as string
      if (!currentId || visited.has(currentId)) {
        continue
      }
      visited.add(currentId)

      const node = nodeMap.get(currentId)
      if (!node) {
        continue
      }

      if (isDynamicGroupNode(node)) {
        const childKind = normalizeText(node?.properties?.groupMeta?.groupKind)
        // 嵌套 team 视为独立边界，不纳入当前队伍聚合
        if (childKind === 'team') {
          continue
        }
        queue.push(...getDynamicGroupChildIds(node))
        continue
      }

      if (!isAssetSelectorNode(node)) {
        continue
      }

      const library = inferLibrary(node)
      const name = normalizeText(node?.properties?.selectedAsset?.name)
      const assetId = normalizeText(node?.properties?.selectedAsset?.assetId)
      if (!name) {
        continue
      }

      const asset: TeamAsset = {
        nodeId: normalizeText(node?.id),
        assetId,
        name,
        library
      }

      if (library === 'shikigami') {
        shikigamiAssets.push(asset)
      } else if (library === 'yuhun') {
        yuhunAssets.push(asset)
      }
    }

    return {
      groupId: teamId,
      groupName: teamName,
      nodeIds: dedupeNodeIds([
        ...shikigamiAssets.map((item) => item.nodeId),
        ...yuhunAssets.map((item) => item.nodeId)
      ]),
      shikigamiAssets,
      yuhunAssets
    }
  })
}

const createWarningId = (groupId: string, ruleId: string): string => `${groupId}::${ruleId}`

export const validateGraphGroupRules = (
  graphData: GraphData,
  config?: GroupRulesConfig
): GroupRuleWarning[] => {
  const effectiveConfig = config || readSharedGroupRulesConfig()
  const normalizedGraphData = normalizeGraphRawDataSchema(graphData)
  const teams = collectTeamAssetSnapshots(normalizedGraphData)
  const warnings: GroupRuleWarning[] = []

  teams.forEach((team) => {
    const shikigamiNames = team.shikigamiAssets.map((item) => item.name)
    const yuhunNames = team.yuhunAssets.map((item) => item.name)

    effectiveConfig.shikigamiYuhunBlacklist.forEach((rule) => {
      if (includesName(shikigamiNames, rule.shikigami) && includesName(yuhunNames, rule.yuhun)) {
        const ruleId = `blacklist:${rule.shikigami}:${rule.yuhun}`
        const nodeIds = dedupeNodeIds([
          ...team.shikigamiAssets.filter((item) => item.name === rule.shikigami).map((item) => item.nodeId),
          ...team.yuhunAssets.filter((item) => item.name === rule.yuhun).map((item) => item.nodeId)
        ])

        warnings.push({
          id: createWarningId(team.groupId, ruleId),
          ruleId,
          code: 'SHIKIGAMI_YUHUN_BLACKLIST',
          severity: 'warning',
          groupId: team.groupId,
          groupName: team.groupName || undefined,
          nodeIds,
          message: rule.message || `规则冲突：${rule.shikigami} 不建议携带 ${rule.yuhun}。`
        })
      }
    })

    effectiveConfig.shikigamiConflictPairs.forEach((rule) => {
      if (includesName(shikigamiNames, rule.left) && includesName(shikigamiNames, rule.right)) {
        const ruleId = `conflict:${rule.left}:${rule.right}`
        const nodeIds = dedupeNodeIds([
          ...team.shikigamiAssets.filter((item) => item.name === rule.left).map((item) => item.nodeId),
          ...team.shikigamiAssets.filter((item) => item.name === rule.right).map((item) => item.nodeId)
        ])
        warnings.push({
          id: createWarningId(team.groupId, ruleId),
          ruleId,
          code: 'SHIKIGAMI_CONFLICT',
          severity: 'warning',
          groupId: team.groupId,
          groupName: team.groupName || undefined,
          nodeIds,
          message: rule.message || `规则冲突：${rule.left} 与 ${rule.right} 不建议同队。`
        })
      }
    })

    const hasShikigami = shikigamiNames.length > 0
    if (hasShikigami) {
      const hasFireShikigami = shikigamiNames.some((name) => effectiveConfig.fireShikigamiWhitelist.includes(name))
      if (!hasFireShikigami) {
        const ruleId = 'missing-fire-shikigami'
        warnings.push({
          id: createWarningId(team.groupId, ruleId),
          ruleId,
          code: 'MISSING_FIRE_SHIKIGAMI',
          severity: 'warning',
          groupId: team.groupId,
          groupName: team.groupName || undefined,
          nodeIds: dedupeNodeIds(team.shikigamiAssets.map((item) => item.nodeId)),
          message: '规则提示：当前队伍未检测到鬼火式神，建议补充供火位。'
        })
      }
    }
  })

  return warnings
}
