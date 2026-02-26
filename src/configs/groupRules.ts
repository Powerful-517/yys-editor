export type ShikigamiYuhunBlacklistRule = {
  shikigami: string
  yuhun: string
  message?: string
}

export type ShikigamiConflictRule = {
  left: string
  right: string
  message?: string
}

export type GroupRulesConfig = {
  version: number
  fireShikigamiWhitelist: string[]
  shikigamiYuhunBlacklist: ShikigamiYuhunBlacklistRule[]
  shikigamiConflictPairs: ShikigamiConflictRule[]
}

export const DEFAULT_GROUP_RULES_CONFIG: GroupRulesConfig = {
  version: 1,
  fireShikigamiWhitelist: [
    '辉夜姬',
    '因幡辉夜姬',
    '追月神',
    '座敷童子',
    '千姬',
    '帝释天',
    '不见岳',
    '食灵'
  ],
  shikigamiYuhunBlacklist: [
    {
      shikigami: '辉夜姬',
      yuhun: '破势',
      message: '规则冲突：辉夜姬通常不建议携带破势。'
    }
  ],
  shikigamiConflictPairs: [
    {
      left: '千姬',
      right: '腹肌清姬',
      message: '规则冲突：千姬与腹肌清姬不建议同队。'
    },
    {
      left: '千姬',
      right: '蝮骨清姬',
      message: '规则冲突：千姬与蝮骨清姬不建议同队。'
    }
  ]
}

