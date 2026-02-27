type TokenType = 'identifier' | 'number' | 'string' | 'boolean' | 'null' | 'operator' | 'punctuation' | 'eof'

type Token = {
  type: TokenType
  value: string
  position: number
}

type ExpressionNode =
  | { type: 'Literal'; value: unknown }
  | { type: 'ArrayExpression'; elements: ExpressionNode[] }
  | { type: 'IdentifierPath'; path: string[] }
  | { type: 'CallExpression'; callee: string; args: ExpressionNode[] }
  | { type: 'UnaryExpression'; operator: '!' | '-'; argument: ExpressionNode }
  | {
      type: 'BinaryExpression'
      operator: '||' | '&&' | '==' | '!=' | '>' | '>=' | '<' | '<=' | '+' | '-' | '*' | '/'
      left: ExpressionNode
      right: ExpressionNode
    }

export type RuleExpressionScope = Record<string, unknown>

const DEFAULT_MAX_STEPS = 20_000
const astCache = new Map<string, ExpressionNode>()

const isWhitespace = (char: string) => /\s/.test(char)
const isDigit = (char: string) => /[0-9]/.test(char)
const isIdentifierStart = (char: string) => /[A-Za-z_$\u4E00-\u9FFF]/.test(char)
const isIdentifierPart = (char: string) => /[A-Za-z0-9_$\u4E00-\u9FFF]/.test(char)

const tokenize = (source: string): Token[] => {
  const tokens: Token[] = []
  let index = 0

  const readString = (quote: string): Token => {
    const start = index
    index += 1
    let value = ''
    while (index < source.length) {
      const current = source[index]
      if (current === '\\') {
        const next = source[index + 1]
        if (!next) {
          throw new Error(`字符串转义不完整（位置 ${index}）`)
        }
        value += next
        index += 2
        continue
      }
      if (current === quote) {
        index += 1
        return { type: 'string', value, position: start }
      }
      value += current
      index += 1
    }
    throw new Error(`字符串缺少结束引号（位置 ${start}）`)
  }

  const readNumber = (): Token => {
    const start = index
    let value = ''
    let dotSeen = false
    while (index < source.length) {
      const current = source[index]
      if (current === '.') {
        if (dotSeen) break
        dotSeen = true
        value += current
        index += 1
        continue
      }
      if (!isDigit(current)) {
        break
      }
      value += current
      index += 1
    }
    return { type: 'number', value, position: start }
  }

  const readIdentifier = (): Token => {
    const start = index
    let value = ''
    while (index < source.length && isIdentifierPart(source[index])) {
      value += source[index]
      index += 1
    }
    if (value === 'true' || value === 'false') {
      return { type: 'boolean', value, position: start }
    }
    if (value === 'null') {
      return { type: 'null', value, position: start }
    }
    return { type: 'identifier', value, position: start }
  }

  const readOperatorOrPunctuation = (): Token => {
    const start = index
    const twoChars = source.slice(index, index + 2)
    const twoCharOperators = ['&&', '||', '==', '!=', '>=', '<=']
    if (twoCharOperators.includes(twoChars)) {
      index += 2
      return { type: 'operator', value: twoChars, position: start }
    }

    const oneChar = source[index]
    const oneCharOperators = ['>', '<', '!', '+', '-', '*', '/']
    if (oneCharOperators.includes(oneChar)) {
      index += 1
      return { type: 'operator', value: oneChar, position: start }
    }

    const punctuations = ['(', ')', '[', ']', ',', '.']
    if (punctuations.includes(oneChar)) {
      index += 1
      return { type: 'punctuation', value: oneChar, position: start }
    }

    throw new Error(`无法识别的字符 "${oneChar}"（位置 ${start}）`)
  }

  while (index < source.length) {
    const current = source[index]
    if (isWhitespace(current)) {
      index += 1
      continue
    }
    if (current === '"' || current === "'") {
      tokens.push(readString(current))
      continue
    }
    if (isDigit(current)) {
      tokens.push(readNumber())
      continue
    }
    if (isIdentifierStart(current)) {
      tokens.push(readIdentifier())
      continue
    }
    tokens.push(readOperatorOrPunctuation())
  }

  tokens.push({ type: 'eof', value: '', position: source.length })
  return tokens
}

class Parser {
  private readonly tokens: Token[]
  private cursor = 0

  constructor(source: string) {
    this.tokens = tokenize(source)
  }

  parse(): ExpressionNode {
    const expression = this.parseOrExpression()
    this.expect('eof')
    return expression
  }

  private current(): Token {
    return this.tokens[this.cursor]
  }

  private consume(): Token {
    const token = this.tokens[this.cursor]
    this.cursor += 1
    return token
  }

  private match(type: TokenType, value?: string): boolean {
    const token = this.current()
    if (token.type !== type) return false
    if (value != null && token.value !== value) return false
    return true
  }

  private expect(type: TokenType, value?: string): Token {
    const token = this.current()
    if (!this.match(type, value)) {
      const expected = value == null ? type : `${type}:${value}`
      throw new Error(`表达式解析失败，期望 ${expected}，实际 ${token.type}:${token.value}（位置 ${token.position}）`)
    }
    return this.consume()
  }

  private parseOrExpression(): ExpressionNode {
    let left = this.parseAndExpression()
    while (this.match('operator', '||')) {
      const operator = this.consume().value as '||'
      const right = this.parseAndExpression()
      left = { type: 'BinaryExpression', operator, left, right }
    }
    return left
  }

  private parseAndExpression(): ExpressionNode {
    let left = this.parseEqualityExpression()
    while (this.match('operator', '&&')) {
      const operator = this.consume().value as '&&'
      const right = this.parseEqualityExpression()
      left = { type: 'BinaryExpression', operator, left, right }
    }
    return left
  }

  private parseEqualityExpression(): ExpressionNode {
    let left = this.parseComparisonExpression()
    while (this.match('operator', '==') || this.match('operator', '!=')) {
      const operator = this.consume().value as '==' | '!='
      const right = this.parseComparisonExpression()
      left = { type: 'BinaryExpression', operator, left, right }
    }
    return left
  }

  private parseComparisonExpression(): ExpressionNode {
    let left = this.parseAdditiveExpression()
    while (
      this.match('operator', '>') ||
      this.match('operator', '>=') ||
      this.match('operator', '<') ||
      this.match('operator', '<=')
    ) {
      const operator = this.consume().value as '>' | '>=' | '<' | '<='
      const right = this.parseAdditiveExpression()
      left = { type: 'BinaryExpression', operator, left, right }
    }
    return left
  }

  private parseAdditiveExpression(): ExpressionNode {
    let left = this.parseMultiplicativeExpression()
    while (this.match('operator', '+') || this.match('operator', '-')) {
      const operator = this.consume().value as '+' | '-'
      const right = this.parseMultiplicativeExpression()
      left = { type: 'BinaryExpression', operator, left, right }
    }
    return left
  }

  private parseMultiplicativeExpression(): ExpressionNode {
    let left = this.parseUnaryExpression()
    while (this.match('operator', '*') || this.match('operator', '/')) {
      const operator = this.consume().value as '*' | '/'
      const right = this.parseUnaryExpression()
      left = { type: 'BinaryExpression', operator, left, right }
    }
    return left
  }

  private parseUnaryExpression(): ExpressionNode {
    if (this.match('operator', '!') || this.match('operator', '-')) {
      const operator = this.consume().value as '!' | '-'
      const argument = this.parseUnaryExpression()
      return { type: 'UnaryExpression', operator, argument }
    }
    return this.parsePrimaryExpression()
  }

  private parsePrimaryExpression(): ExpressionNode {
    const token = this.current()
    if (token.type === 'number') {
      this.consume()
      return { type: 'Literal', value: Number(token.value) }
    }
    if (token.type === 'string') {
      this.consume()
      return { type: 'Literal', value: token.value }
    }
    if (token.type === 'boolean') {
      this.consume()
      return { type: 'Literal', value: token.value === 'true' }
    }
    if (token.type === 'null') {
      this.consume()
      return { type: 'Literal', value: null }
    }
    if (this.match('punctuation', '[')) {
      return this.parseArrayExpression()
    }
    if (this.match('punctuation', '(')) {
      this.consume()
      const expression = this.parseOrExpression()
      this.expect('punctuation', ')')
      return expression
    }
    if (token.type === 'identifier') {
      return this.parseIdentifierPathOrCall()
    }
    throw new Error(`表达式解析失败，无法识别 token ${token.type}:${token.value}（位置 ${token.position}）`)
  }

  private parseArrayExpression(): ExpressionNode {
    this.expect('punctuation', '[')
    const elements: ExpressionNode[] = []
    if (!this.match('punctuation', ']')) {
      while (true) {
        elements.push(this.parseOrExpression())
        if (!this.match('punctuation', ',')) {
          break
        }
        this.consume()
      }
    }
    this.expect('punctuation', ']')
    return { type: 'ArrayExpression', elements }
  }

  private parseIdentifierPathOrCall(): ExpressionNode {
    const head = this.expect('identifier').value
    if (this.match('punctuation', '(')) {
      this.consume()
      const args: ExpressionNode[] = []
      if (!this.match('punctuation', ')')) {
        while (true) {
          args.push(this.parseOrExpression())
          if (!this.match('punctuation', ',')) {
            break
          }
          this.consume()
        }
      }
      this.expect('punctuation', ')')
      return { type: 'CallExpression', callee: head, args }
    }

    const path = [head]
    while (this.match('punctuation', '.')) {
      this.consume()
      path.push(this.expect('identifier').value)
    }
    return { type: 'IdentifierPath', path }
  }
}

type BuiltinFunction = (...args: unknown[]) => unknown

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const toString = (value: unknown): string => (typeof value === 'string' ? value : String(value ?? ''))

const builtins: Record<string, BuiltinFunction> = {
  count(value) {
    if (Array.isArray(value) || typeof value === 'string') return value.length
    if (value && typeof value === 'object') return Object.keys(value).length
    return 0
  },
  contains(collection, target) {
    if (Array.isArray(collection)) {
      return collection.includes(target)
    }
    if (typeof collection === 'string') {
      return collection.includes(toString(target))
    }
    return false
  },
  intersect(left, right) {
    const rightSet = new Set(toArray(right))
    const result: unknown[] = []
    toArray(left).forEach((item) => {
      if (rightSet.has(item) && !result.includes(item)) {
        result.push(item)
      }
    })
    return result
  },
  map(collection, key) {
    const keyName = typeof key === 'string' ? key : ''
    if (!keyName) return []
    return toArray(collection).map((item: any) => item?.[keyName])
  },
  unique(collection) {
    return Array.from(new Set(toArray(collection)))
  },
  exists(value) {
    if (Array.isArray(value)) return value.length > 0
    return value != null && value !== ''
  },
  lower(value) {
    return toString(value).toLowerCase()
  },
  upper(value) {
    return toString(value).toUpperCase()
  }
}

const isTruthy = (value: unknown): boolean => !!value

const resolveIdentifierPath = (scope: RuleExpressionScope, path: string[]): unknown => {
  let current: unknown = scope
  for (const segment of path) {
    if (current == null || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

const resolveVarFromScope = (scope: RuleExpressionScope, key: unknown): unknown[] => {
  const keyName = typeof key === 'string' ? key.trim() : ''
  if (!keyName) {
    return []
  }
  const vars = resolveIdentifierPath(scope, ['shared', 'vars'])
  if (!vars || typeof vars !== 'object') {
    return []
  }
  const value = (vars as Record<string, unknown>)[keyName]
  if (Array.isArray(value)) {
    return value
  }
  if (value == null || value === '') {
    return []
  }
  return [toString(value)]
}

type EvaluationState = {
  steps: number
  maxSteps: number
}

const evaluateNode = (node: ExpressionNode, scope: RuleExpressionScope, state: EvaluationState): unknown => {
  state.steps += 1
  if (state.steps > state.maxSteps) {
    throw new Error('表达式执行超出步骤限制')
  }

  switch (node.type) {
    case 'Literal':
      return node.value
    case 'ArrayExpression':
      return node.elements.map((item) => evaluateNode(item, scope, state))
    case 'IdentifierPath':
      return resolveIdentifierPath(scope, node.path)
    case 'CallExpression': {
      if (node.callee === 'getVar') {
        if (node.args.length !== 1) {
          throw new Error('getVar 仅支持一个参数：变量 key')
        }
        const key = evaluateNode(node.args[0], scope, state)
        return resolveVarFromScope(scope, key)
      }
      const fn = builtins[node.callee]
      if (!fn) {
        throw new Error(`不支持的函数调用: ${node.callee}`)
      }
      const args = node.args.map((arg) => evaluateNode(arg, scope, state))
      return fn(...args)
    }
    case 'UnaryExpression': {
      const value = evaluateNode(node.argument, scope, state)
      if (node.operator === '!') return !isTruthy(value)
      return -Number(value)
    }
    case 'BinaryExpression': {
      if (node.operator === '&&') {
        const left = evaluateNode(node.left, scope, state)
        if (!isTruthy(left)) return false
        return isTruthy(evaluateNode(node.right, scope, state))
      }
      if (node.operator === '||') {
        const left = evaluateNode(node.left, scope, state)
        if (isTruthy(left)) return true
        return isTruthy(evaluateNode(node.right, scope, state))
      }

      const left = evaluateNode(node.left, scope, state)
      const right = evaluateNode(node.right, scope, state)

      switch (node.operator) {
        case '==':
          return left === right
        case '!=':
          return left !== right
        case '>':
          return Number(left) > Number(right)
        case '>=':
          return Number(left) >= Number(right)
        case '<':
          return Number(left) < Number(right)
        case '<=':
          return Number(left) <= Number(right)
        case '+':
          return Number(left) + Number(right)
        case '-':
          return Number(left) - Number(right)
        case '*':
          return Number(left) * Number(right)
        case '/':
          return Number(left) / Number(right)
        default:
          return undefined
      }
    }
    default:
      return undefined
  }
}

export const parseRuleExpression = (source: string): ExpressionNode => {
  const key = source.trim()
  if (!key) {
    throw new Error('表达式不能为空')
  }
  const cached = astCache.get(key)
  if (cached) {
    return cached
  }
  const parser = new Parser(key)
  const ast = parser.parse()
  astCache.set(key, ast)
  return ast
}

export const evaluateRuleExpression = (
  source: string,
  scope: RuleExpressionScope,
  options?: { maxSteps?: number }
): unknown => {
  const ast = parseRuleExpression(source)
  const state: EvaluationState = {
    steps: 0,
    maxSteps: options?.maxSteps ?? DEFAULT_MAX_STEPS
  }
  return evaluateNode(ast, scope, state)
}

export const evaluateRuleExpressionAsBoolean = (
  source: string,
  scope: RuleExpressionScope,
  options?: { maxSteps?: number }
): boolean => {
  const result = evaluateRuleExpression(source, scope, options)
  return isTruthy(result)
}
