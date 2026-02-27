import { describe, it, expect } from 'vitest'
import { validateGraphGroupRules } from '@/utils/groupRules'
import { DEFAULT_GROUP_RULES_CONFIG } from '@/configs/groupRules'

const baseGraph = {
  nodes: [
    {
      id: 'team-1',
      type: 'dynamic-group',
      children: ['s1', 's2'],
      properties: {
        children: ['s1', 's2'],
        groupMeta: {
          groupKind: 'team',
          groupName: '一队',
          ruleEnabled: true
        }
      }
    },
    {
      id: 's1',
      type: 'assetSelector',
      properties: {
        assetLibrary: 'shikigami',
        selectedAsset: { assetId: 'a1', name: '辉夜姬', library: 'shikigami' }
      }
    },
    {
      id: 's2',
      type: 'assetSelector',
      properties: {
        assetLibrary: 'shikigami',
        selectedAsset: { assetId: 'a2', name: '千姬', library: 'shikigami' }
      }
    }
  ],
  edges: []
}

const graphWithoutFireShikigami = {
  ...baseGraph,
  nodes: baseGraph.nodes.map((node) => {
    if (node.id === 's1') {
      return {
        ...node,
        properties: {
          ...node.properties,
          selectedAsset: { assetId: 'a1', name: '阿修罗', library: 'shikigami' }
        }
      }
    }
    if (node.id === 's2') {
      return {
        ...node,
        properties: {
          ...node.properties,
          selectedAsset: { assetId: 'a2', name: '不知火', library: 'shikigami' }
        }
      }
    }
    return node
  })
}

const graphWithKaguyaPoshi = {
  ...baseGraph,
  nodes: [
    ...baseGraph.nodes,
    {
      id: 'y1',
      type: 'assetSelector',
      properties: {
        assetLibrary: 'yuhun',
        selectedAsset: { assetId: 'y1', name: '破势', library: 'yuhun' }
      }
    },
    {
      id: 'y2',
      type: 'assetSelector',
      properties: {
        assetLibrary: 'yuhun',
        selectedAsset: { assetId: 'y2', name: '招财猫', library: 'yuhun' }
      }
    }
  ].map((node) => {
    if (node.id !== 'team-1') return node
    return {
      ...node,
      children: ['s1', 's2', 'y1', 'y2'],
      properties: {
        ...node.properties,
        children: ['s1', 's2', 'y1', 'y2']
      }
    }
  })
}

describe('groupRules expression integration', () => {
  it('支持自定义 expressionRules 产出告警', () => {
    const warnings = validateGraphGroupRules(baseGraph, {
      ...DEFAULT_GROUP_RULES_CONFIG,
      shikigamiYuhunBlacklist: [],
      shikigamiConflictPairs: [],
      fireShikigamiWhitelist: ['座敷童子'],
      ruleVariables: [
        {
          key: '供火式神',
          value: '辉夜姬,座敷童子'
        }
      ],
      expressionRules: [
        {
          id: 'team-has-kaguya',
          condition: 'count(intersect(map(ctx.team.shikigamis, "name"), getVar("供火式神"))) > 0',
          message: '命中：包含辉夜姬',
          severity: 'info',
          code: 'CUSTOM_HAS_KAGUYA'
        }
      ]
    })

    const custom = warnings.find((item) => item.ruleId === 'team-has-kaguya')
    expect(custom).toBeTruthy()
    expect(custom?.severity).toBe('info')
    expect(custom?.code).toBe('CUSTOM_HAS_KAGUYA')
    expect(custom?.nodeIds).toEqual(['s1', 's2'])
  })

  it('当 expressionRules 为空时不再产出 legacy 告警', () => {
    const warnings = validateGraphGroupRules(baseGraph, {
      ...DEFAULT_GROUP_RULES_CONFIG,
      shikigamiYuhunBlacklist: [],
      shikigamiConflictPairs: [],
      fireShikigamiWhitelist: ['座敷童子'],
      ruleVariables: [],
      expressionRules: []
    })

    expect(warnings).toHaveLength(0)
  })

  it('默认预制规则可命中“辉夜姬不能带破势”', () => {
    const warnings = validateGraphGroupRules(graphWithKaguyaPoshi, DEFAULT_GROUP_RULES_CONFIG)
    expect(warnings.some((item) => item.code === 'TEAM_KAGUYA_POSHI_CONFLICT')).toBe(true)
  })

  it('默认预制规则可命中“队伍需要供火式神”', () => {
    const warnings = validateGraphGroupRules(graphWithoutFireShikigami, DEFAULT_GROUP_RULES_CONFIG)
    expect(warnings.some((item) => item.code === 'TEAM_MISSING_FIRE_SHIKIGAMI')).toBe(true)
  })
})
