import type { GroupRulesConfig } from '@/configs/groupRules'
import { readSharedGroupRulesConfig } from '@/utils/groupRulesConfigSource'
import { getDynamicGroupChildIds, normalizeGraphRawDataSchema } from '@/utils/graphSchema'
import { evaluateRuleExpressionAsBoolean } from '@/utils/ruleExpression'

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
  code: string
  severity: 'warning' | 'error' | 'info'
  groupId: string
  groupName?: string
  message: string
  nodeIds: string[]
}

type TeamExpressionScope = {
  ctx: {
    group: {
      id: string
      name: string
    }
    team: {
      shikigamis: TeamAsset[]
      yuhuns: TeamAsset[]
      shikigamiNames: string[]
      yuhunNames: string[]
    }
    members: {
      shikigami: TeamAsset[]
      yuhun: TeamAsset[]
      shikigamiNames: string[]
      yuhunNames: string[]
    }
    nodeIds: string[]
  }
  shared: {
    fireShikigamiWhitelist: string[]
    vars: Record<string, string[]>
  }
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

const dedupeNodeIds = (ids: string[]): string[] => Array.from(new Set(ids))

const parseVariableValue = (value: string): string[] => {
  return value
    .split(/[\n,，]/g)
    .map((item) => item.trim())
    .filter((item) => !!item)
}

const createSharedVariableMap = (config: GroupRulesConfig): Record<string, string[]> => {
  const map: Record<string, string[]> = {}
  config.ruleVariables.forEach((item) => {
    const key = normalizeText(item.key)
    if (!key) return
    map[key] = dedupeNodeIds(parseVariableValue(item.value))
  })
  map.fireShikigamiWhitelist = [...config.fireShikigamiWhitelist]
  return map
}

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

const createTeamScope = (team: TeamAssetSnapshot, config: GroupRulesConfig): TeamExpressionScope => {
  const shikigamiNames = team.shikigamiAssets.map((item) => item.name)
  const yuhunNames = team.yuhunAssets.map((item) => item.name)
  return {
    ctx: {
      group: {
        id: team.groupId,
        name: team.groupName
      },
      team: {
        shikigamis: team.shikigamiAssets.map((item) => ({ ...item })),
        yuhuns: team.yuhunAssets.map((item) => ({ ...item })),
        shikigamiNames: [...shikigamiNames],
        yuhunNames: [...yuhunNames]
      },
      members: {
        shikigami: team.shikigamiAssets.map((item) => ({ ...item })),
        yuhun: team.yuhunAssets.map((item) => ({ ...item })),
        shikigamiNames,
        yuhunNames
      },
      nodeIds: [...team.nodeIds]
    },
    shared: {
      fireShikigamiWhitelist: [...config.fireShikigamiWhitelist],
      vars: createSharedVariableMap(config)
    }
  }
}

const evaluateCondition = (expression: string, scope: TeamExpressionScope): boolean => {
  try {
    return evaluateRuleExpressionAsBoolean(expression, scope)
  } catch (error) {
    console.warn('[groupRules] 表达式执行失败:', expression, error)
    return false
  }
}

export const validateGraphGroupRules = (
  graphData: GraphData,
  config?: GroupRulesConfig
): GroupRuleWarning[] => {
  const effectiveConfig = config || readSharedGroupRulesConfig()
  const normalizedGraphData = normalizeGraphRawDataSchema(graphData)
  const teams = collectTeamAssetSnapshots(normalizedGraphData)
  const warnings: GroupRuleWarning[] = []

  teams.forEach((team) => {
    const scope = createTeamScope(team, effectiveConfig)

    effectiveConfig.expressionRules.forEach((rule) => {
      if (rule.enabled === false) {
        return
      }
      if (!evaluateCondition(rule.condition, scope)) {
        return
      }
      warnings.push({
        id: createWarningId(team.groupId, `expr:${rule.id}`),
        ruleId: rule.id,
        code: rule.code || 'CUSTOM_EXPRESSION',
        severity: rule.severity || 'warning',
        groupId: team.groupId,
        groupName: team.groupName || undefined,
        nodeIds: [...team.nodeIds],
        message: rule.message
      })
    })
  })

  return warnings
}
