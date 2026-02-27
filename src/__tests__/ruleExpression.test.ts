import { describe, it, expect } from 'vitest'
import { evaluateRuleExpressionAsBoolean } from '@/utils/ruleExpression'

describe('ruleExpression', () => {
  it('支持集合交集计数表达式', () => {
    const scope = {
      ctx: {
        members: {
          shikigamiNames: ['辉夜姬', '千姬']
        }
      },
      shared: {
        fireShikigamiWhitelist: ['辉夜姬', '座敷童子']
      }
    }

    const result = evaluateRuleExpressionAsBoolean(
      'count(intersect(ctx.members.shikigamiNames, shared.fireShikigamiWhitelist)) > 0',
      scope
    )
    expect(result).toBe(true)
  })

  it('支持 map + contains 表达式', () => {
    const scope = {
      ctx: {
        members: {
          shikigami: [
            { name: '辉夜姬', role: 'fire' },
            { name: '千姬', role: 'support' }
          ]
        }
      }
    }

    const result = evaluateRuleExpressionAsBoolean(
      'contains(map(ctx.members.shikigami, "name"), "辉夜姬")',
      scope
    )
    expect(result).toBe(true)
  })

  it('遇到非法函数名时抛错', () => {
    expect(() => evaluateRuleExpressionAsBoolean('unknownFn(1, 2)', {})).toThrowError('不支持的函数调用')
  })

  it('支持 getVar 从共享变量映射读取集合', () => {
    const scope = {
      shared: {
        vars: {
          火系式神: ['辉夜姬', '座敷童子']
        }
      }
    }
    const result = evaluateRuleExpressionAsBoolean(
      'contains(getVar("火系式神"), "辉夜姬")',
      scope
    )
    expect(result).toBe(true)
  })

  it('getVar 仅允许传入变量 key', () => {
    const scope = {
      shared: {
        vars: {
          火系式神: ['辉夜姬']
        }
      }
    }
    expect(() => evaluateRuleExpressionAsBoolean('contains(getVar(shared.vars, "火系式神"), "辉夜姬")', scope))
      .toThrowError('getVar 仅支持一个参数')
  })
})
