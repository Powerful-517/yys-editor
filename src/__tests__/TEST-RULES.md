# 测试规范文档

## 测试原则

### ✅ 推荐：真实场景测试

**优先使用真实的组件和实例进行测试**，而不是 Mock 对象。

#### 为什么？

1. **发现真实问题** - Mock 测试只能验证理想逻辑，无法发现实际代码的 bug
2. **更接近用户体验** - 模拟真实的用户操作流程
3. **更可靠** - 测试通过意味着功能真的能用，而不只是理论上能用

#### 示例对比

❌ **不推荐：Mock 测试**
```typescript
// 使用模拟类
class MockLogicFlow {
  nodes: MockNodeModel[] = []
  addNode(config) {
    const node = new MockNodeModel(...)
    this.nodes.push(node)
    return node
  }
}

// 这种测试只能验证 Mock 的逻辑，不能发现真实代码的问题
```

✅ **推荐：真实场景测试**
```typescript
import LogicFlow from '@logicflow/core'

// 使用真实的 LogicFlow 实例
const lf = new LogicFlow({
  container: document.createElement('div'),
  grid: { type: 'dot', size: 10 }
})

// 模拟真实用户操作
const node = lf.addNode({ type: 'rect', x: 100, y: 100 })
lf.setElementZIndex(node.id, 'top')

// 验证真实的数据
const graphData = lf.getGraphRawData()
expect(graphData.nodes[0].zIndex).toBeDefined() // 这会发现真实问题！
```

---

## 测试文件组织

### 目录结构

```
src/__tests__/
├── setup.ts                          # 测试环境配置
├── README-测试报告.md                 # 测试报告
├── layer-management/                 # 图层管理测试
│   ├── real-scenario.spec.ts        # ✅ 真实场景测试（推荐）
│   ├── mock-test.spec.ts.bak        # ❌ Mock 测试（已废弃）
│   ├── integration-test.spec.ts.bak # ❌ 组件集成测试（已废弃）
│   └── unit-test.spec.ts.bak        # ❌ 单元测试（已废弃）
├── schema.test.ts                    # Schema 验证测试
└── useStore.test.ts                  # Store 测试
```

### 文件命名规范

- `*.spec.ts` - 活跃的测试文件
- `*.spec.ts.bak` - 已废弃的测试文件（保留作为参考）
- `real-scenario.spec.ts` - 真实场景测试（推荐命名）

---

## 编写测试的最佳实践

### 1. 使用真实的依赖

```typescript
// ✅ 好的做法
import LogicFlow from '@logicflow/core'
import { createPinia } from 'pinia'

const lf = new LogicFlow({ ... })
const pinia = createPinia()

// ❌ 避免
class MockLogicFlow { ... }
const mockPinia = { ... }
```

### 2. 模拟真实的用户操作流程

```typescript
it('完整用户流程：创建节点 -> 图层操作 -> 验证数据', () => {
  // 步骤 1: 用户从 ComponentsPanel 拖拽创建节点
  const node1 = lf.addNode({ type: 'rect', x: 100, y: 100 })

  // 步骤 2: 用户右键点击，选择"置于顶层"
  lf.setElementZIndex(node1.id, 'top')

  // 步骤 3: 用户点击 Toolbar 的"数据预览"
  const graphData = lf.getGraphRawData()

  // 步骤 4: 验证数据
  expect(graphData.nodes[0].zIndex).toBeDefined()
})
```

### 3. 提供清晰的调试信息

```typescript
it('置顶操作', () => {
  console.log('初始 zIndex:', { node1: model1.zIndex, node2: model2.zIndex })

  lf.setElementZIndex(node1.id, 'top')

  console.log('置顶后 zIndex:', { node1: model1.zIndex, node2: model2.zIndex })

  expect(model1.zIndex).toBeGreaterThan(model2.zIndex)
})
```

### 4. 测试边界情况

```typescript
it('边界情况 - 最顶层节点继续置顶', () => {
  // 测试极端情况
})

it('边界情况 - 最底层节点继续置底', () => {
  // 测试极端情况
})
```

---

## 测试环境配置

### setup.ts

测试环境需要 polyfill 一些浏览器 API：

```typescript
// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
```

### vitest.config.js

```javascript
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/__tests__/setup.ts'],
    }
  })
)
```

---

## 运行测试

### 运行所有测试

```bash
npm test
```

### 运行特定测试

```bash
# 运行图层管理测试
npm test -- layer-management

# 运行特定文件
npm test -- real-scenario

# 监听模式
npm run test:watch -- layer-management
```

### 查看详细输出

```bash
npm test -- layer-management --reporter=verbose
```

---

## 何时使用 Mock？

虽然我们推荐真实场景测试，但在以下情况下可以使用 Mock：

### ✅ 适合使用 Mock 的场景

1. **外部 API 调用**
   ```typescript
   // Mock HTTP 请求
   vi.mock('axios')
   ```

2. **时间相关的测试**
   ```typescript
   // Mock 定时器
   vi.useFakeTimers()
   ```

3. **文件系统操作**
   ```typescript
   // Mock fs 模块
   vi.mock('fs')
   ```

4. **难以复现的场景**
   ```typescript
   // Mock 网络错误
   vi.mock('fetch', () => ({ default: vi.fn(() => Promise.reject()) }))
   ```

### ❌ 不适合使用 Mock 的场景

1. **核心业务逻辑** - 应该使用真实的类和方法
2. **UI 组件交互** - 应该使用真实的组件
3. **数据流转** - 应该使用真实的 Store 和状态管理

---

## 测试覆盖率目标

- **核心功能**: 80%+ 覆盖率
- **边界情况**: 必须测试
- **用户关键路径**: 100% 覆盖

---

## 示例：图层管理测试

参考 `src/__tests__/layer-management/real-scenario.spec.ts`

这个测试文件展示了如何：
- ✅ 使用真实的 LogicFlow 实例
- ✅ 模拟真实的用户操作流程
- ✅ 发现真实的代码问题（zIndex 不持久化、置底逻辑错误）
- ✅ 提供清晰的调试信息

---

## 常见问题

### Q: 为什么我的测试通过了，但功能还是有问题？

A: 可能是因为你使用了 Mock 测试。Mock 测试只能验证理想逻辑，无法发现真实代码的问题。建议改用真实场景测试。

### Q: 真实场景测试运行很慢怎么办？

A:
1. 只在关键路径使用真实场景测试
2. 使用 `it.only()` 运行单个测试
3. 考虑使用 E2E 测试工具（Playwright、Cypress）

### Q: 如何测试需要浏览器环境的功能？

A:
1. 使用 jsdom 环境（已配置）
2. 添加必要的 polyfill（见 setup.ts）
3. 如果 jsdom 不够，考虑使用 Playwright

---

## 更新日志

- **2024-01-XX**: 创建测试规范文档
- **2024-01-XX**: 添加真实场景测试示例
- **2024-01-XX**: 废弃 Mock 测试，推荐真实场景测试
