# 测试指南

## 运行测试

项目已集成 Vitest 测试框架，支持以下测试命令：

```bash
# 运行所有测试（单次执行）
npm test

# 监听模式（文件变化时自动重新运行）
npm run test:watch

# 可视化界面运行测试
npm run test:ui

# 生成测试覆盖率报告
npm run test:coverage
```

## 测试文件结构

### 目录规范

所有单元测试文件统一放在 `src/__tests__/` 目录下：

```
src/
├── __tests__/
│   ├── schema.test.ts              # 数据结构和类型验证测试
│   ├── useStore.test.ts            # Store 状态管理和数据操作测试
│   ├── layer-management.spec.ts   # 图层管理功能测试
│   └── ...                         # 其他功能模块测试
├── components/
├── ts/
└── ...
```

### 命名规则

- **单元测试**: `<功能模块名>.test.ts` 或 `<功能模块名>.spec.ts`
- **集成测试**: `<功能模块名>.integration.test.ts`

### 现有测试文件

- `schema.test.ts` - 数据结构和类型验证测试
- `useStore.test.ts` - Store 状态管理和数据操作测试
- `layer-management.spec.ts` - 图层管理功能测试（上移、下移、置顶、置底）

## 测试示例

### 1. Schema 数据结构测试

验证数据模型的正确性：
- 默认值检查
- 类型定义验证
- 式神/御魂数据结构

### 2. Store 状态管理测试

验证核心业务逻辑：
- 文件列表的增删改查
- 文件切换和重命名
- 数据导入导出
- localStorage 持久化

## 编写新测试

在 `src/__tests__/` 目录创建 `*.test.ts` 文件：

```typescript
import { describe, it, expect } from 'vitest'

describe('功能模块名称', () => {
  it('应该做某件事', () => {
    // 准备数据
    const input = { /* ... */ }

    // 执行操作
    const result = someFunction(input)

    // 验证结果
    expect(result).toBe(expectedValue)
  })
})
```

## 最佳实践

1. **数据验证优先** - 先测试数据层逻辑，确保核心功能正确
2. **独立测试** - 每个测试用例应该独立运行，不依赖其他测试
3. **清晰命名** - 测试描述应该清楚说明测试的内容和预期
4. **Mock 外部依赖** - 使用 `vi.mock()` 模拟外部模块，保持测试纯粹
