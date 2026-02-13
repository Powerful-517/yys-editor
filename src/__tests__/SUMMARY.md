# 测试文件整理完成 ✅

## 📁 新的文件结构

```
src/__tests__/
├── README.md                          # 📖 测试文件总览（从这里开始）
├── TEST-RULES.md                      # 📋 测试规范文档（必读）
├── README-测试报告.md                  # 📊 测试报告和问题分析
├── setup.ts                           # ⚙️ 测试环境配置
├── layer-management/                  # 📂 图层管理测试
│   ├── README.md                      # 图层管理测试说明
│   ├── real-scenario.spec.ts          # ✅ 真实场景测试（活跃）
│   ├── mock-test.spec.ts.bak          # 🗄️ Mock 测试（已废弃）
│   ├── integration-test.spec.ts.bak   # 🗄️ 集成测试（已废弃）
│   └── unit-test.spec.ts.bak          # 🗄️ 单元测试（已废弃）
├── schema.test.ts                     # Schema 验证测试
└── useStore.test.ts                   # Store 测试
```

---

## ✨ 主要改进

### 1. 文件组织

- ✅ 创建了 `layer-management/` 目录，集中管理图层相关测试
- ✅ 将 Mock 测试重命名为 `.bak`，标记为已废弃
- ✅ 保留了真实场景测试作为推荐方案

### 2. 文档完善

- ✅ **README.md** - 测试文件总览和快速开始
- ✅ **TEST-RULES.md** - 详细的测试规范和最佳实践
- ✅ **README-测试报告.md** - 当前测试结果和问题分析
- ✅ **layer-management/README.md** - 图层管理测试说明

### 3. 测试规范

明确了测试原则：

#### ✅ 推荐：真实场景测试
```typescript
// 使用真实的 LogicFlow 实例
const lf = new LogicFlow({ ... })
const node = lf.addNode({ ... })
lf.setElementZIndex(node.id, 'top')

// 能发现真实问题！
const graphData = lf.getGraphRawData()
expect(graphData.nodes[0].zIndex).toBeDefined() // ❌ 失败！
```

#### ❌ 不推荐：Mock 测试
```typescript
// 使用模拟类
class MockLogicFlow { ... }

// 只能验证理想逻辑，无法发现真实问题
```

---

## 🚀 快速开始

### 运行测试

```bash
# 运行所有测试
npm test

# 运行图层管理测试
npm test -- layer-management

# 运行真实场景测试
npm test -- real-scenario

# 监听模式
npm run test:watch

# 查看详细输出
npm test -- --reporter=verbose
```

### 查看文档

1. 先看 **README.md** - 了解整体结构
2. 再看 **TEST-RULES.md** - 学习测试规范
3. 参考 **layer-management/real-scenario.spec.ts** - 学习如何编写测试

---

## 📊 当前测试状态

### 图层管理测试（9 个测试）

- ✅ **通过**: 5/9
- ❌ **失败**: 4/9

### 发现的真实问题

1. **zIndex 不会保存到数据中**
   - `getGraphRawData()` 返回的数据中没有 zIndex
   - 导致导出/导入会丢失图层信息

2. **置底操作逻辑错误**
   - 置底后 zIndex 变成 998/996
   - 应该是比所有节点都小的值

这些问题是通过**真实场景测试**发现的，Mock 测试无法发现！

---

## 🎯 测试原则总结

### 为什么要用真实场景测试？

| 对比项 | Mock 测试 | 真实场景测试 |
|--------|-----------|--------------|
| 能否发现真实问题 | ❌ 不能 | ✅ 能 |
| 测试可靠性 | ⚠️ 低 | ✅ 高 |
| 接近用户体验 | ❌ 不接近 | ✅ 接近 |
| 维护成本 | ⚠️ 高（需要同步更新 Mock） | ✅ 低 |

### 何时使用 Mock？

只在以下情况使用：
- 外部 API 调用（HTTP 请求）
- 时间相关的测试（定时器）
- 文件系统操作
- 难以复现的场景（网络错误）

**核心业务逻辑必须使用真实场景测试！**

---

## 📚 文档导航

### 必读文档

1. **[README.md](./README.md)** - 从这里开始
2. **[TEST-RULES.md](./TEST-RULES.md)** - 测试规范（必读）
3. **[README-测试报告.md](./README-测试报告.md)** - 当前问题分析

### 模块文档

- **[layer-management/README.md](./layer-management/README.md)** - 图层管理测试

### 示例代码

- **[layer-management/real-scenario.spec.ts](./layer-management/real-scenario.spec.ts)** - 真实场景测试示例

---

## 🔧 下一步

### 1. 修复发现的问题

参考 **README-测试报告.md** 中的解决方案：

- 修复 zIndex 持久化问题
- 修复置底操作逻辑

### 2. 添加更多真实场景测试

参考 **layer-management/real-scenario.spec.ts**，为其他功能添加测试：

- 节点拖拽
- 节点复制粘贴
- 节点分组
- 数据导入导出

### 3. 提高测试覆盖率

目标：
- 核心功能：80%+ 覆盖率
- 用户关键路径：100% 覆盖率

---

## ✅ 完成清单

- [x] 创建 `layer-management/` 目录
- [x] 移动并重命名测试文件
- [x] 废弃 Mock 测试（重命名为 .bak）
- [x] 创建 README.md（总览）
- [x] 创建 TEST-RULES.md（规范）
- [x] 创建 layer-management/README.md（模块说明）
- [x] 验证测试可以正常运行
- [x] 更新测试报告

---

## 🎉 总结

现在你有了：

1. **清晰的文件结构** - 测试文件按模块组织
2. **完善的文档** - 从入门到进阶的完整指南
3. **真实场景测试** - 能够发现真实代码问题
4. **测试规范** - 明确的最佳实践

**最重要的是**：真实场景测试已经发现了 2 个真实的 bug，这是 Mock 测试无法做到的！
