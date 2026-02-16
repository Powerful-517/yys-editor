/**
 * 选择器预设配置
 * 定义各种资产类型的选择器配置
 */

import type { SelectorConfig } from '@/types/selector'
import shikigamiData from '@/data/Shikigami.json'
import yuhunData from '@/data/Yuhun.json'

// 阴阳师数据
const onmyojiData = [
  { id: '10', name: '晴明', avatar: '/assets/downloaded_images/hero_10_10.png' },
  { id: '11', name: '神乐', avatar: '/assets/downloaded_images/hero_11_11.png' },
  { id: '12', name: '八百比丘尼', avatar: '/assets/downloaded_images/hero_12_12.png' },
  { id: '13', name: '源博雅', avatar: '/assets/downloaded_images/hero_13_13.png' },
  { id: '15', name: '不知火', avatar: '/assets/downloaded_images/hero_15_15.png' },
  { id: '16', name: '鬼灯', avatar: '/assets/downloaded_images/hero_16_16.png' }
]

// 阴阳师技能数据
const onmyojiSkillData = [
  // 晴明的技能
  { onmyojiId: '10', onmyojiName: '晴明', skillId: '1003', name: '言灵·守', avatar: '/assets/downloaded_images/hero_10_skill_1003.png' },
  { onmyojiId: '10', onmyojiName: '晴明', skillId: '1004', name: '言灵·盾', avatar: '/assets/downloaded_images/hero_10_skill_1004.png' },
  { onmyojiId: '10', onmyojiName: '晴明', skillId: '1005', name: '言灵·星', avatar: '/assets/downloaded_images/hero_10_skill_1005.png' },
  { onmyojiId: '10', onmyojiName: '晴明', skillId: '1007', name: '言灵·缚', avatar: '/assets/downloaded_images/hero_10_skill_1007.png' },
  { onmyojiId: '10', onmyojiName: '晴明', skillId: '1008', name: '言灵·风', avatar: '/assets/downloaded_images/hero_10_skill_1008.png' },
  { onmyojiId: '10', onmyojiName: '晴明', skillId: '1009', name: '言灵·火', avatar: '/assets/downloaded_images/hero_10_skill_1009.png' },
  { onmyojiId: '10', onmyojiName: '晴明', skillId: '1011', name: '言灵·水', avatar: '/assets/downloaded_images/hero_10_skill_1011.png' },
  { onmyojiId: '10', onmyojiName: '晴明', skillId: '9001', name: '通用技能', avatar: '/assets/downloaded_images/hero_10_skill_9001.png' },

  // 神乐的技能
  { onmyojiId: '11', onmyojiName: '神乐', skillId: '1101', name: '神乐铃·治愈', avatar: '/assets/downloaded_images/hero_11_skill_1101.png' },
  { onmyojiId: '11', onmyojiName: '神乐', skillId: '1102', name: '神乐铃·盾御', avatar: '/assets/downloaded_images/hero_11_skill_1102.png' },
  { onmyojiId: '11', onmyojiName: '神乐', skillId: '1103', name: '神乐铃·反弹', avatar: '/assets/downloaded_images/hero_11_skill_1103.png' },
  { onmyojiId: '11', onmyojiName: '神乐', skillId: '1104', name: '神乐铃·净化', avatar: '/assets/downloaded_images/hero_11_skill_1104.png' },
  { onmyojiId: '11', onmyojiName: '神乐', skillId: '1105', name: '神乐铃·复苏', avatar: '/assets/downloaded_images/hero_11_skill_1105.png' },
  { onmyojiId: '11', onmyojiName: '神乐', skillId: '1107', name: '神乐铃·庇护', avatar: '/assets/downloaded_images/hero_11_skill_1107.png' },
  { onmyojiId: '11', onmyojiName: '神乐', skillId: '1111', name: '神乐铃·祈愿', avatar: '/assets/downloaded_images/hero_11_skill_1111.png' },
  { onmyojiId: '11', onmyojiName: '神乐', skillId: '9011', name: '通用技能', avatar: '/assets/downloaded_images/hero_11_skill_9011.png' },

  // 八百比丘尼的技能
  { onmyojiId: '12', onmyojiName: '八百比丘尼', skillId: '1201', name: '技能1', avatar: '/assets/downloaded_images/hero_12_skill_1201.png' },
  { onmyojiId: '12', onmyojiName: '八百比丘尼', skillId: '1202', name: '技能2', avatar: '/assets/downloaded_images/hero_12_skill_1202.png' },
  { onmyojiId: '12', onmyojiName: '八百比丘尼', skillId: '1203', name: '技能3', avatar: '/assets/downloaded_images/hero_12_skill_1203.png' },
  { onmyojiId: '12', onmyojiName: '八百比丘尼', skillId: '1204', name: '技能4', avatar: '/assets/downloaded_images/hero_12_skill_1204.png' },
  { onmyojiId: '12', onmyojiName: '八百比丘尼', skillId: '1205', name: '技能5', avatar: '/assets/downloaded_images/hero_12_skill_1205.png' },
  { onmyojiId: '12', onmyojiName: '八百比丘尼', skillId: '1206', name: '技能6', avatar: '/assets/downloaded_images/hero_12_skill_1206.png' },
  { onmyojiId: '12', onmyojiName: '八百比丘尼', skillId: '1207', name: '技能7', avatar: '/assets/downloaded_images/hero_12_skill_1207.png' },
  { onmyojiId: '12', onmyojiName: '八百比丘尼', skillId: '9021', name: '通用技能', avatar: '/assets/downloaded_images/hero_12_skill_9021.png' },

  // 源博雅的技能
  { onmyojiId: '13', onmyojiName: '源博雅', skillId: '1301', name: '技能1', avatar: '/assets/downloaded_images/hero_13_skill_1301.png' },
  { onmyojiId: '13', onmyojiName: '源博雅', skillId: '1302', name: '技能2', avatar: '/assets/downloaded_images/hero_13_skill_1302.png' },
  { onmyojiId: '13', onmyojiName: '源博雅', skillId: '1303', name: '技能3', avatar: '/assets/downloaded_images/hero_13_skill_1303.png' },
  { onmyojiId: '13', onmyojiName: '源博雅', skillId: '1304', name: '技能4', avatar: '/assets/downloaded_images/hero_13_skill_1304.png' },
  { onmyojiId: '13', onmyojiName: '源博雅', skillId: '1305', name: '技能5', avatar: '/assets/downloaded_images/hero_13_skill_1305.png' },
  { onmyojiId: '13', onmyojiName: '源博雅', skillId: '9031', name: '通用技能1', avatar: '/assets/downloaded_images/hero_13_skill_9031.png' },
  { onmyojiId: '13', onmyojiName: '源博雅', skillId: '9032', name: '通用技能2', avatar: '/assets/downloaded_images/hero_13_skill_9032.png' },
  { onmyojiId: '13', onmyojiName: '源博雅', skillId: '9033', name: '通用技能3', avatar: '/assets/downloaded_images/hero_13_skill_9033.png' },

  // 不知火的技能
  { onmyojiId: '15', onmyojiName: '不知火', skillId: '1501', name: '技能1', avatar: '/assets/downloaded_images/hero_15_skill_1501.png' },
  { onmyojiId: '15', onmyojiName: '不知火', skillId: '1502', name: '技能2', avatar: '/assets/downloaded_images/hero_15_skill_1502.png' },
  { onmyojiId: '15', onmyojiName: '不知火', skillId: '1503', name: '技能3', avatar: '/assets/downloaded_images/hero_15_skill_1503.png' },
  { onmyojiId: '15', onmyojiName: '不知火', skillId: '1504', name: '技能4', avatar: '/assets/downloaded_images/hero_15_skill_1504.png' },
  { onmyojiId: '15', onmyojiName: '不知火', skillId: '1505', name: '技能5', avatar: '/assets/downloaded_images/hero_15_skill_1505.png' },
  { onmyojiId: '15', onmyojiName: '不知火', skillId: '1506', name: '技能6', avatar: '/assets/downloaded_images/hero_15_skill_1506.png' },
  { onmyojiId: '15', onmyojiName: '不知火', skillId: '1507', name: '技能7', avatar: '/assets/downloaded_images/hero_15_skill_1507.png' },
  { onmyojiId: '15', onmyojiName: '不知火', skillId: '1508', name: '技能8', avatar: '/assets/downloaded_images/hero_15_skill_1508.png' },

  // 鬼灯的技能
  { onmyojiId: '16', onmyojiName: '鬼灯', skillId: '1601', name: '技能1', avatar: '/assets/downloaded_images/hero_16_skill_1601.png' },
  { onmyojiId: '16', onmyojiName: '鬼灯', skillId: '1602', name: '技能2', avatar: '/assets/downloaded_images/hero_16_skill_1602.png' },
  { onmyojiId: '16', onmyojiName: '鬼灯', skillId: '1603', name: '技能3', avatar: '/assets/downloaded_images/hero_16_skill_1603.png' },
  { onmyojiId: '16', onmyojiName: '鬼灯', skillId: '1604', name: '技能4', avatar: '/assets/downloaded_images/hero_16_skill_1604.png' },
  { onmyojiId: '16', onmyojiName: '鬼灯', skillId: '1605', name: '技能5', avatar: '/assets/downloaded_images/hero_16_skill_1605.png' },
  { onmyojiId: '16', onmyojiName: '鬼灯', skillId: '1606', name: '技能6', avatar: '/assets/downloaded_images/hero_16_skill_1606.png' },
  { onmyojiId: '16', onmyojiName: '鬼灯', skillId: '1607', name: '技能7', avatar: '/assets/downloaded_images/hero_16_skill_1607.png' },
  { onmyojiId: '16', onmyojiName: '鬼灯', skillId: '1608', name: '技能8', avatar: '/assets/downloaded_images/hero_16_skill_1608.png' }
]

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
  },

  onmyoji: {
    title: '请选择阴阳师',
    dataSource: onmyojiData,
    groupField: null,
    groups: [
      { label: '全部', name: 'ALL' }
    ],
    itemRender: {
      imageField: 'avatar',
      labelField: 'name'
    }
  },

  onmyojiSkill: {
    title: '请选择阴阳师技能',
    dataSource: onmyojiSkillData,
    groupField: 'onmyojiName',
    groups: [
      { label: '全部', name: 'ALL' },
      { label: '晴明', name: '晴明' },
      { label: '神乐', name: '神乐' },
      { label: '八百比丘尼', name: '八百比丘尼' },
      { label: '源博雅', name: '源博雅' },
      { label: '不知火', name: '不知火' },
      { label: '鬼灯', name: '鬼灯' }
    ],
    itemRender: {
      imageField: 'avatar',
      labelField: 'name'
    }
  }
}
