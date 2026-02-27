import {
  DEFAULT_GROUP_RULES_CONFIG,
  type GroupRulesConfig,
  type ShikigamiConflictRule,
  type ShikigamiYuhunBlacklistRule
} from '@/configs/groupRules'

export const GROUP_RULES_STORAGE_KEY = 'yys-editor.group-rules.v1'
const GROUP_RULES_UPDATED_EVENT = 'yys-editor.group-rules.updated'

const isClient = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'
const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')
const notifyGroupRulesUpdated = () => {
  if (!isClient()) {
    return
  }
  window.dispatchEvent(new CustomEvent(GROUP_RULES_UPDATED_EVENT))
}

const cloneDefaultGroupRulesConfig = (): GroupRulesConfig => ({
  version: DEFAULT_GROUP_RULES_CONFIG.version,
  fireShikigamiWhitelist: [...DEFAULT_GROUP_RULES_CONFIG.fireShikigamiWhitelist],
  shikigamiYuhunBlacklist: DEFAULT_GROUP_RULES_CONFIG.shikigamiYuhunBlacklist.map((rule) => ({ ...rule })),
  shikigamiConflictPairs: DEFAULT_GROUP_RULES_CONFIG.shikigamiConflictPairs.map((rule) => ({ ...rule }))
})

const normalizeStringList = (value: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(value)) {
    return [...fallback]
  }
  return value
    .map((item) => normalizeText(item))
    .filter((item) => !!item)
}

const normalizeBlacklistRules = (
  value: unknown,
  fallback: ShikigamiYuhunBlacklistRule[]
): ShikigamiYuhunBlacklistRule[] => {
  if (!Array.isArray(value)) {
    return fallback.map((rule) => ({ ...rule }))
  }
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const raw = item as Record<string, unknown>
      const shikigami = normalizeText(raw.shikigami)
      const yuhun = normalizeText(raw.yuhun)
      if (!shikigami || !yuhun) {
        return null
      }
      const message = normalizeText(raw.message)
      return {
        shikigami,
        yuhun,
        ...(message ? { message } : {})
      }
    })
    .filter((item): item is ShikigamiYuhunBlacklistRule => !!item)
}

const normalizeConflictRules = (
  value: unknown,
  fallback: ShikigamiConflictRule[]
): ShikigamiConflictRule[] => {
  if (!Array.isArray(value)) {
    return fallback.map((rule) => ({ ...rule }))
  }
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const raw = item as Record<string, unknown>
      const left = normalizeText(raw.left)
      const right = normalizeText(raw.right)
      if (!left || !right) {
        return null
      }
      const message = normalizeText(raw.message)
      return {
        left,
        right,
        ...(message ? { message } : {})
      }
    })
    .filter((item): item is ShikigamiConflictRule => !!item)
}

const normalizeGroupRulesConfig = (input: unknown): GroupRulesConfig | null => {
  if (!input || typeof input !== 'object') {
    return null
  }

  const raw = input as Record<string, unknown>
  const fallback = cloneDefaultGroupRulesConfig()
  const versionCandidate = Number(raw.version)
  const version = Number.isFinite(versionCandidate) && versionCandidate > 0
    ? Math.trunc(versionCandidate)
    : fallback.version

  return {
    version,
    fireShikigamiWhitelist: normalizeStringList(raw.fireShikigamiWhitelist, fallback.fireShikigamiWhitelist),
    shikigamiYuhunBlacklist: normalizeBlacklistRules(raw.shikigamiYuhunBlacklist, fallback.shikigamiYuhunBlacklist),
    shikigamiConflictPairs: normalizeConflictRules(raw.shikigamiConflictPairs, fallback.shikigamiConflictPairs)
  }
}

export const readSharedGroupRulesConfig = (): GroupRulesConfig => {
  const fallback = cloneDefaultGroupRulesConfig()
  if (!isClient()) {
    return fallback
  }

  const raw = localStorage.getItem(GROUP_RULES_STORAGE_KEY)
  if (!raw) {
    return fallback
  }

  try {
    const parsed = JSON.parse(raw)
    return normalizeGroupRulesConfig(parsed) || fallback
  } catch {
    return fallback
  }
}

export const writeSharedGroupRulesConfig = (config: unknown): GroupRulesConfig => {
  const normalized = normalizeGroupRulesConfig(config) || cloneDefaultGroupRulesConfig()
  if (isClient()) {
    localStorage.setItem(GROUP_RULES_STORAGE_KEY, JSON.stringify(normalized))
    notifyGroupRulesUpdated()
  }
  return normalized
}

export const clearSharedGroupRulesConfig = () => {
  if (!isClient()) {
    return
  }
  localStorage.removeItem(GROUP_RULES_STORAGE_KEY)
  notifyGroupRulesUpdated()
}

export const subscribeSharedGroupRulesConfig = (listener: () => void): (() => void) => {
  if (!isClient()) {
    return () => {}
  }
  const handleStorage = (event: StorageEvent) => {
    if (event.key === GROUP_RULES_STORAGE_KEY) {
      listener()
    }
  }
  const handleLocalUpdate = () => {
    listener()
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(GROUP_RULES_UPDATED_EVENT, handleLocalUpdate)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(GROUP_RULES_UPDATED_EVENT, handleLocalUpdate)
  }
}
