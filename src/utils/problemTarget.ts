import type { GroupRuleWarning } from '@/utils/groupRules'

const normalizeIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .filter((item): item is string => typeof item === 'string' && !!item.trim())
    .map((item) => item.trim())
}

const dedupeIds = (ids: string[]): string[] => Array.from(new Set(ids))

export const getProblemTargetCandidateIds = (warning: GroupRuleWarning): string[] => {
  const nodeIds = normalizeIds(warning.nodeIds)
  const groupId = typeof warning.groupId === 'string' ? warning.groupId.trim() : ''
  const groupIds = groupId ? [groupId] : []
  return dedupeIds([...groupIds, ...nodeIds])
}
