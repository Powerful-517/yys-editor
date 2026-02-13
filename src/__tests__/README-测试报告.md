# 图层管理测试报告

## 测试概述

这个测试文件模拟真实的用户操作流程，验证图层管理功能是否正常工作。

## 测试场景

### ✅ 通过的测试（5/9）

1. **场景1: 创建节点并验证 zIndex 分配** ✅
   - 从 ComponentsPanel 拖拽创建节点
   - 验证每个节点都有 zIndex 属性

2. **场景2: 置顶操作** ✅
   - 模拟右键菜单的"置于顶层"
   - 验证节点 zIndex 变为最大值

3. **场景4: 上移一层操作** ✅
   - 验证节点与上层节点交换 zIndex

4. **场景5: 下移一层操作** ✅
   - 验证节点与下层节点交换 zIndex

5. **场景8: 边界情况 - 最顶层节点继续置顶** ✅
   - 验证顶层节点置顶会增加 zIndex

### ❌ 失败的测试（4/9）

#### 问题1: 置底操作逻辑错误

**场景3: 置底操作**
```
初始 zIndex: { node1: 1, node2: 2, node3: 3 }
置底后 zIndex: { node1: 1, node2: 2, node3: 998 }
```

**问题**: node3 置底后 zIndex 变成 998，但应该是最小值（小于 1）

**原因**: LogicFlow 的 `setElementZIndex(id, 'bottom')` 实现可能有问题

---

#### 问题2: zIndex 不会保存到数据中

**场景6: 数据预览验证**
```javascript
const graphData = lf.getGraphRawData()
// graphData.nodes 中的 zIndex 都是 undefined
```

**问题**: 调用 `getGraphRawData()` 后，返回的数据中没有 zIndex 字段

**影响**:
- 用户点击 Toolbar 的"数据预览"按钮时，看不到 zIndex
- 导出数据时，zIndex 信息会丢失
- 重新导入数据后，图层顺序会错乱

**原因**: LogicFlow 的 `getGraphRawData()` 默认不包含 zIndex

---

#### 问题3: 完整流程测试失败

**场景7: 完整用户流程测试**

由于问题2（zIndex 不保存），导致完整流程测试失败。

---

#### 问题4: 底层节点置底逻辑错误

**场景9: 边界情况 - 最底层节点继续置底**
```
初始 zIndex: { node1: 1, node2: 2, node3: 3 }
置底后 zIndex: { node1: 996, node2: 2, node3: 3 }
```

**问题**: node1 置底后 zIndex 变成 996，应该小于 1

---

## 核心问题总结

### 🔴 严重问题

1. **zIndex 不会持久化**
   - `getGraphRawData()` 不包含 zIndex
   - 导出/导入数据会丢失图层信息

### 🟡 逻辑问题

2. **置底操作的实现有误**
   - 应该设置为 `Math.min(...allZIndexes) - 1`
   - 但实际上设置为固定值（998、996 等）

---

## 解决方案

### 方案1: 修改 FlowEditor.vue 保存 zIndex

在 `FlowEditor.vue` 中，需要确保 zIndex 被保存到 properties 中：

```typescript
// 在 NODE_ADD 事件中
lfInstance.on(EventType.NODE_ADD, ({ data }) => {
  const model = lfInstance.getNodeModelById(data.id)
  if (model) {
    const newZIndex = 1000
    model.setZIndex(newZIndex)

    // 保存 zIndex 到 properties
    lfInstance.setProperties(model.id, {
      ...model.getProperties(),
      zIndex: newZIndex
    })
  }
})
```

### 方案2: 修改数据导出逻辑

在 Toolbar.vue 的 `handlePreviewData` 中，手动添加 zIndex：

```typescript
const graphData = lf.getGraphRawData()
graphData.nodes.forEach((node: any) => {
  const model = lf.getNodeModelById(node.id)
  if (model) {
    node.zIndex = model.zIndex
  }
})
```

### 方案3: 修复置底逻辑

检查 LogicFlow 的 `setElementZIndex` 实现，或者自己实现置底逻辑。

---

## 如何运行测试

```bash
# 运行所有测试
npm test

# 只运行图层管理测试
npm test -- layer-management-real-scenario

# 监听模式
npm run test:watch -- layer-management-real-scenario
```

---

## 测试文件说明

### `layer-management-real-scenario.spec.ts`
- **真实场景测试**：直接使用 LogicFlow 实例
- **模拟用户操作**：创建节点、右键菜单、数据预览
- **可以发现真实问题**：不是 Mock，而是真实的代码逻辑

### `layer-management-real.spec.ts`（旧文件）
- **Mock 测试**：使用模拟类
- **只验证理想逻辑**：不能发现真实代码的问题
- **建议删除或重命名**

---

## 下一步

1. ✅ 测试已经发现了真实问题
2. 🔧 需要修复 zIndex 持久化问题
3. 🔧 需要修复置底操作的逻辑
4. 📝 修复后重新运行测试验证
