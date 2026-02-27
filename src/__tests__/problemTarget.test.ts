import { describe, it, expect } from 'vitest'
import type { GroupRuleWarning } from '@/utils/groupRules'
import { getProblemTargetCandidateIds } from '@/utils/problemTarget'

const createWarning = (overrides: Partial<GroupRuleWarning>): GroupRuleWarning => ({
  id: 'w1',
  ruleId: 'rule-1',
  code: 'SHIKIGAMI_CONFLICT',
  severity: 'warning',
  groupId: 'team-1',
  message: 'test',
  nodeIds: ['node-a', 'node-b'],
  ...overrides
})

describe('getProblemTargetCandidateIds', () => {
  it('所有告警优先跳转到触发规则的 dynamic group', () => {
    const warning = createWarning({
      code: 'SHIKIGAMI_YUHUN_BLACKLIST',
      nodeIds: ['shiki-1', 'yuhun-1'],
      groupId: 'team-1'
    })

    expect(getProblemTargetCandidateIds(warning)).toEqual(['team-1', 'shiki-1', 'yuhun-1'])
  })

  it('队伍类告警优先跳转到队伍节点', () => {
    const warning = createWarning({
      code: 'MISSING_FIRE_SHIKIGAMI',
      nodeIds: ['shiki-1', 'shiki-2'],
      groupId: 'team-1'
    })

    expect(getProblemTargetCandidateIds(warning)).toEqual(['team-1', 'shiki-1', 'shiki-2'])
  })
})
