/**
 * 选择器预设配置
 * 定义各种资产类型的选择器配置
 */

import type { SelectorConfig } from '@/types/selector'
import shikigamiData from '@/data/Shikigami.json'
import yuhunData from '@/data/Yuhun.json'

export const SELECTOR_PRESETS: Record<string, SelectorConfig> = {
  shikigami: {
    title: '请选择式神',
    dataSource: shikigamiData,
    groupField: 'rarity',
    groups: [
      { label: '全部', name: 'ALL' },
      { label: 'UR', name: 'UR' },
      { label: 'SP', name: 'SP' },
      { label: 'SSR', name: 'SSR' },
      { label: 'SR', name: 'SR' },
      { label: 'R', name: 'R' },
      { label: 'N', name: 'N' },
      { label: '联动', name: 'L' },
      { label: '呱太', name: 'G' }
    ],
    itemRender: {
      imageField: 'avatar',
      labelField: 'name'
    }
  },

  yuhun: {
    title: '请选择御魂',
    dataSource: yuhunData,
    groupField: 'type',
    groups: [
      { label: '全部', name: 'ALL' },
      { label: '攻击类', name: 'attack' },
      { label: '暴击类', name: 'Crit' },
      { label: '生命类', name: 'Health' },
      { label: '防御类', name: 'Defense' },
      { label: '效果命中', name: 'Effect' },
      { label: '效果抵抗', name: 'EffectResist' },
      { label: '特殊类', name: 'Special' }
    ],
    itemRender: {
      imageField: 'avatar',
      labelField: 'name'
    }
  }
}
