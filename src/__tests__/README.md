# 测试文件说明

## 📂 目录结构

```
src/__tests__/
├── setup.ts                    # 测试环境配置（ResizeObserver 等 polyfill）
├── TEST-RULES.md              # 测试规范文档（必读！）
├── README-测试报告.md          # 测试报告和问题分析
├── layer-management/          # 图层管理测试
│   ├── real-scenario.spec.ts  # ✅ 真实场景测试（推荐）
│   ├── README.md              # 图层管理测试说明
│   ├── mock-test.spec.ts.bak  # 已废弃的 Mock 测试
│   ├── integration-test.spec.ts.bak  # 已废弃的集成测试
│   └── unit-test.spec.ts.bak  # 已废弃的单元测试
├── schema.test.ts             # Schema 验证测试
└── useStore.test.ts           # Store 测试
```

---

## 🎯 测试原则

### ✅ 推荐：真实场景测试

**优先使用真实的组件和实例**，而不是 Mock 对象。

#### 为什么？

1. **发现真实问题** - Mock 测试只能验证理想逻辑
2. **更接近用户体验** - 模拟真实的用户操作流程
3. **更可靠** - 测试通过意味着功能真的能用

#### 示例

```typescript
// ✅ 推荐：使用真实的 LogicFlow 实例
import LogicFlow from '@logicflow/core'

const lf = new LogicFlow({
  container: document.createElement('div'),
  grid: { type: 'dot', size: 10 }
})

const node = lf.addNode({ type: 'rect', x: 100, y: 100 })
lf.setElementZIndex(node.id, 'top')

// 这会发现真实问题！
const graphData = lf.getGraphRawData()
expect(graphData.nodes[0].zIndex).toBeDefined() // ❌ 失败！发现 bug
```

```typescript
// ❌ 不推荐：使用 Mock 对象
class MockLogicFlow {
  addNode() { return { id: '1' } }
  setElementZIndex() { /* 理想逻辑 */ }
}

// 这只能验证 Mock 的逻辑，无法发现真实代码的问题
```

---

## 🚀 快速开始

### 运行所有测试

```bash
npm test
```

### 运行特定测试

```bash
# 运行图层管理测试
npm test -- layer-management

# 运行真实场景测试
npm test -- real-scenario

# 监听模式
npm run test:watch

# 查看详细输出
npm test -- --reporter=verbose
```

---

## 📚 文档导航

### 必读文档

1. **[TEST-RULES.md](./TEST-RULES.md)** - 测试规范和最佳实践
   - 为什么要用真实场景测试
   - 如何编写好的测试
   - 何时使用 Mock

2. **[README-测试报告.md](./README-测试报告.md)** - 当前测试结果和问题分析
   - 发现的问题
   - 解决方案
   - 测试覆盖率

### 模块文档

- **[layer-management/README.md](./layer-management/README.md)** - 图层管理测试说明

---

## 📊 当前测试状态

### 图层管理测试

- **通过**: 5/9 ✅
- **失败**: 4/9 ❌

### 发现的问题

1. **zIndex 不会保存到数据中** - 导出/导入会丢失图层信息
2. **置底操作逻辑错误** - zIndex 计算不正确

详见 [README-测试报告.md](./README-测试报告.md)

---

## 🔧 测试环境配置

### setup.ts

提供了必要的浏览器 API polyfill：

- `ResizeObserver`
- `IntersectionObserver`
- `window.matchMedia`

### vitest.config.js

```javascript
{
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts']
  }
}
```

---

## 📝 编写新测试

### 1. 创建测试文件

```bash
# 在对应的模块目录下创建
src/__tests__/your-module/real-scenario.spec.ts
```

### 2. 使用真实的依赖

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import LogicFlow from '@logicflow/core'

describe('你的功能测试', () => {
  let lf: LogicFlow | null = null

  beforeEach(() => {
    // 创建真实的实例
    const container = document.createElement('div')
    document.body.appendChild(container)
    lf = new LogicFlow({ container })
  })

  afterEach(() => {
    // 清理
    lf?.destroy()
  })

  it('应该能够...', () => {
    // 模拟真实的用户操作
    // 验证真实的结果
  })
})
```

### 3. 参考示例

参考 `layer-management/real-scenario.spec.ts` 了解如何：
- 使用真实的实例
- 模拟用户操作流程
- 提供清晰的调试信息

---

## ❓ 常见问题

### Q: 为什么废弃 Mock 测试？

A: Mock 测试只能验证理想逻辑，无法发现真实代码的问题。例如：
- Mock 测试通过 ✅
- 但真实场景测试失败 ❌
- 发现了 zIndex 不持久化的 bug

### Q: 什么时候可以使用 Mock？

A: 只在以下情况使用：
- 外部 API 调用（HTTP 请求）
- 时间相关的测试（定时器）
- 文件系统操作
- 难以复现的场景（网络错误）

详见 [TEST-RULES.md](./TEST-RULES.md)

### Q: 测试运行很慢怎么办？

A:
1. 使用 `it.only()` 运行单个测试
2. 使用 `npm run test:watch` 监听模式
3. 只在关键路径使用真实场景测试

---

## 🤝 贡献指南

### 添加新测试

1. 阅读 [TEST-RULES.md](./TEST-RULES.md)
2. 创建测试文件
3. 使用真实的依赖
4. 模拟真实的用户操作
5. 运行测试验证

### 修复失败的测试

1. 查看 [README-测试报告.md](./README-测试报告.md)
2. 理解问题原因
3. 修复代码
4. 重新运行测试

---

## 📞 需要帮助？

- 查看 [TEST-RULES.md](./TEST-RULES.md) 了解测试规范
- 查看 [README-测试报告.md](./README-测试报告.md) 了解当前问题
- 参考 `layer-management/real-scenario.spec.ts` 了解示例
