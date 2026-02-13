import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import LogicFlow from '@logicflow/core'

/**
 * 图层管理真实场景测试
 *
 * 这个测试直接使用 LogicFlow 实例，模拟真实的用户操作：
 * 1. 创建节点（模拟从 ComponentsPanel 拖拽）
 * 2. 执行图层操作（模拟 FlowEditor 中的操作）
 * 3. 验证数据预览（模拟 Toolbar 的 handlePreviewData）
 */

/**
 * 辅助函数：获取包含 zIndex 的图数据
 * 模拟 useStore.ts 中的 syncLogicFlowDataToStore 逻辑
 */
function getGraphDataWithZIndex(lf: LogicFlow) {
  const graphData = lf.getGraphRawData();
  return {
    ...graphData,
    nodes: (graphData.nodes || []).map((node: any) => {
      const model = lf.getNodeModelById(node.id);
      return {
        ...node,
        zIndex: model?.zIndex ?? node.zIndex ?? 1
      };
    })
  };
}

describe('图层管理真实场景测试', () => {
  let lf: LogicFlow | null = null
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    // 创建 Pinia 实例
    const pinia = createPinia()
    setActivePinia(pinia)

    // 创建容器
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)

    // 创建 LogicFlow 实例
    lf = new LogicFlow({
      container,
      grid: { type: 'dot', size: 10 },
      allowResize: true,
      allowRotate: true,
    })

    lf.render({ nodes: [], edges: [] })
  })

  afterEach(() => {
    // 清理
    if (lf) {
      lf.destroy()
      lf = null
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
      container = null
    }
  })

  it('场景1: 创建节点并验证 zIndex 分配', () => {
    console.log('\n=== 场景1: 创建节点并验证 zIndex 分配 ===')

    if (!lf) return

    // 模拟从 ComponentsPanel 拖拽创建 3 个节点
    const node1 = lf.addNode({
      type: 'rect',
      x: 100,
      y: 100,
      properties: {}
    })

    const node2 = lf.addNode({
      type: 'rect',
      x: 200,
      y: 200,
      properties: {}
    })

    const node3 = lf.addNode({
      type: 'rect',
      x: 300,
      y: 300,
      properties: {}
    })

    // 获取节点模型
    const model1 = lf.getNodeModelById(node1.id)
    const model2 = lf.getNodeModelById(node2.id)
    const model3 = lf.getNodeModelById(node3.id)

    console.log('创建后的 zIndex:')
    console.log(`  node1: ${model1?.zIndex}`)
    console.log(`  node2: ${model2?.zIndex}`)
    console.log(`  node3: ${model3?.zIndex}`)

    // 验证：所有节点都有 zIndex
    expect(model1?.zIndex).toBeDefined()
    expect(model2?.zIndex).toBeDefined()
    expect(model3?.zIndex).toBeDefined()

    // 验证：zIndex 是数字
    expect(typeof model1?.zIndex).toBe('number')
    expect(typeof model2?.zIndex).toBe('number')
    expect(typeof model3?.zIndex).toBe('number')
  })

  it('场景2: 置顶操作（模拟右键菜单）', () => {
    console.log('\n=== 场景2: 置顶操作 ===')

    if (!lf) return

    // 创建 3 个节点
    const node1 = lf.addNode({ type: 'rect', x: 100, y: 100 })
    const node2 = lf.addNode({ type: 'rect', x: 200, y: 200 })
    const node3 = lf.addNode({ type: 'rect', x: 300, y: 300 })

    const model1 = lf.getNodeModelById(node1.id)
    const model2 = lf.getNodeModelById(node2.id)
    const model3 = lf.getNodeModelById(node3.id)

    // 手动设置初始 zIndex（模拟历史数据加载）
    model1?.setZIndex(1)
    model2?.setZIndex(2)
    model3?.setZIndex(3)

    console.log('初始 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 模拟用户右键点击 node1，选择"置于顶层"
    lf.setElementZIndex(node1.id, 'top')

    console.log('置顶后 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 验证：node1 的 zIndex 最大
    const allZIndexes = [model1?.zIndex, model2?.zIndex, model3?.zIndex].filter(z => z !== undefined) as number[]
    expect(model1?.zIndex).toBe(Math.max(...allZIndexes))
    expect(model1?.zIndex).toBeGreaterThan(model2?.zIndex || 0)
    expect(model1?.zIndex).toBeGreaterThan(model3?.zIndex || 0)
  })

  it('场景3: 置底操作（模拟右键菜单）', () => {
    console.log('\n=== 场景3: 置底操作 ===')

    if (!lf) return

    // 创建 3 个节点
    const node1 = lf.addNode({ type: 'rect', x: 100, y: 100 })
    const node2 = lf.addNode({ type: 'rect', x: 200, y: 200 })
    const node3 = lf.addNode({ type: 'rect', x: 300, y: 300 })

    const model1 = lf.getNodeModelById(node1.id)
    const model2 = lf.getNodeModelById(node2.id)
    const model3 = lf.getNodeModelById(node3.id)

    model1?.setZIndex(1)
    model2?.setZIndex(2)
    model3?.setZIndex(3)

    console.log('初始 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 模拟用户右键点击 node3，选择"置于底层"
    // 修复：使用正确的置底逻辑（与 FlowEditor.vue 中的 sendToBack 一致）
    const allNodesScene3 = lf.graphModel.nodes;
    const allZIndexesForBottom = allNodesScene3.map(n => n.zIndex).filter(z => z !== undefined);
    const minZIndex = allZIndexesForBottom.length > 0 ? Math.min(...allZIndexesForBottom) : 1;
    const newZIndex = minZIndex - 1;
    model3?.setZIndex(newZIndex);

    console.log('置底后 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 验证：node3 的 zIndex 最小
    const allZIndexes = [model1?.zIndex, model2?.zIndex, model3?.zIndex].filter(z => z !== undefined) as number[]
    expect(model3?.zIndex).toBe(Math.min(...allZIndexes))
    expect(model3?.zIndex).toBeLessThan(model1?.zIndex || Infinity)
    expect(model3?.zIndex).toBeLessThan(model2?.zIndex || Infinity)
  })

  it('场景4: 上移一层操作', () => {
    console.log('\n=== 场景4: 上移一层操作 ===')

    if (!lf) return

    // 创建 3 个节点
    const node1 = lf.addNode({ type: 'rect', x: 100, y: 100 })
    const node2 = lf.addNode({ type: 'rect', x: 200, y: 200 })
    const node3 = lf.addNode({ type: 'rect', x: 300, y: 300 })

    const model1 = lf.getNodeModelById(node1.id)
    const model2 = lf.getNodeModelById(node2.id)
    const model3 = lf.getNodeModelById(node3.id)

    model1?.setZIndex(1)
    model2?.setZIndex(2)
    model3?.setZIndex(3)

    const originalZIndex1 = model1?.zIndex
    const originalZIndex2 = model2?.zIndex

    console.log('上移前 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 模拟 FlowEditor 的 bringForward 方法
    const currentNode = model1
    if (currentNode) {
      const currentZIndex = currentNode.zIndex
      const allNodes = lf.graphModel.nodes
      const nodesAbove = allNodes
        .filter((node) => node.zIndex > currentZIndex)
        .sort((a, b) => a.zIndex - b.zIndex)

      if (nodesAbove.length > 0) {
        const nextNode = nodesAbove[0]
        currentNode.setZIndex(nextNode.zIndex)
        nextNode.setZIndex(currentZIndex)
      }
    }

    console.log('上移后 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 验证：node1 和 node2 的 zIndex 已交换
    expect(model1?.zIndex).toBe(originalZIndex2)
    expect(model2?.zIndex).toBe(originalZIndex1)
    expect(model1?.zIndex).toBeGreaterThan(model2?.zIndex || 0)
  })

  it('场景5: 下移一层操作', () => {
    console.log('\n=== 场景5: 下移一层操作 ===')

    if (!lf) return

    // 创建 3 个节点
    const node1 = lf.addNode({ type: 'rect', x: 100, y: 100 })
    const node2 = lf.addNode({ type: 'rect', x: 200, y: 200 })
    const node3 = lf.addNode({ type: 'rect', x: 300, y: 300 })

    const model1 = lf.getNodeModelById(node1.id)
    const model2 = lf.getNodeModelById(node2.id)
    const model3 = lf.getNodeModelById(node3.id)

    model1?.setZIndex(1)
    model2?.setZIndex(2)
    model3?.setZIndex(3)

    const originalZIndex2 = model2?.zIndex
    const originalZIndex3 = model3?.zIndex

    console.log('下移前 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 模拟 FlowEditor 的 sendBackward 方法
    const currentNode = model3
    if (currentNode) {
      const currentZIndex = currentNode.zIndex
      const allNodes = lf.graphModel.nodes
      const nodesBelow = allNodes
        .filter((node) => node.zIndex < currentZIndex)
        .sort((a, b) => b.zIndex - a.zIndex)

      if (nodesBelow.length > 0) {
        const prevNode = nodesBelow[0]
        currentNode.setZIndex(prevNode.zIndex)
        prevNode.setZIndex(currentZIndex)
      }
    }

    console.log('下移后 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 验证：node3 和 node2 的 zIndex 已交换
    expect(model3?.zIndex).toBe(originalZIndex2)
    expect(model2?.zIndex).toBe(originalZIndex3)
    expect(model3?.zIndex).toBeLessThan(model2?.zIndex || Infinity)
  })

  it('场景6: 数据预览验证（模拟 Toolbar.handlePreviewData）', () => {
    console.log('\n=== 场景6: 数据预览验证 ===')

    if (!lf) return

    // 创建节点
    const node1 = lf.addNode({ type: 'rect', x: 100, y: 100 })
    const node2 = lf.addNode({ type: 'rect', x: 200, y: 200 })
    const node3 = lf.addNode({ type: 'rect', x: 300, y: 300 })

    const model1 = lf.getNodeModelById(node1.id)
    const model2 = lf.getNodeModelById(node2.id)
    const model3 = lf.getNodeModelById(node3.id)

    model1?.setZIndex(1)
    model2?.setZIndex(2)
    model3?.setZIndex(3)

    // 执行置顶操作
    lf.setElementZIndex(node1.id, 'top')

    // 模拟 Toolbar 的 handlePreviewData 方法（使用辅助函数获取包含 zIndex 的数据）
    const graphData = getGraphDataWithZIndex(lf)

    console.log('数据预览:')
    console.log(JSON.stringify(graphData, null, 2))

    // 验证：数据中包含 zIndex
    expect(graphData.nodes).toBeDefined()
    expect(graphData.nodes.length).toBe(3)

    graphData.nodes.forEach((node: any) => {
      expect(node.zIndex).toBeDefined()
      expect(typeof node.zIndex).toBe('number')
      console.log(`  节点 ${node.id}: zIndex = ${node.zIndex}`)
    })

    // 验证：node1 的 zIndex 最大
    const node1Data = graphData.nodes.find((n: any) => n.id === node1.id)
    const allZIndexes = graphData.nodes.map((n: any) => n.zIndex)
    expect(node1Data?.zIndex).toBe(Math.max(...allZIndexes))
  })

  it('场景7: 完整用户流程测试', () => {
    console.log('\n=== 场景7: 完整用户流程测试 ===')

    if (!lf) return

    // 步骤 1: 用户从 ComponentsPanel 拖拽创建 4 个节点
    console.log('\n步骤 1: 创建节点')
    const nodes = [
      lf.addNode({ type: 'rect', x: 100, y: 100 }),
      lf.addNode({ type: 'rect', x: 200, y: 200 }),
      lf.addNode({ type: 'rect', x: 300, y: 300 }),
      lf.addNode({ type: 'rect', x: 400, y: 400 })
    ]

    const models = nodes.map(n => lf!.getNodeModelById(n.id))
    models.forEach((m, i) => m?.setZIndex(i + 1))

    console.log('初始状态:', models.map((m, i) => ({
      id: nodes[i].id,
      zIndex: m?.zIndex
    })))

    // 步骤 2: 用户右键点击 node1，选择"置于顶层"
    console.log('\n步骤 2: node1 置于顶层')
    lf.setElementZIndex(nodes[0].id, 'top')
    console.log('操作后:', models.map((m, i) => ({
      id: nodes[i].id,
      zIndex: m?.zIndex
    })))

    // 步骤 3: 用户右键点击 node4，选择"置于底层"
    console.log('\n步骤 3: node4 置于底层')
    // 修复：使用正确的置底逻辑
    const allNodesStep3 = lf.graphModel.nodes;
    const allZIndexesStep3 = allNodesStep3.map(n => n.zIndex).filter(z => z !== undefined);
    const minZIndexStep3 = allZIndexesStep3.length > 0 ? Math.min(...allZIndexesStep3) : 1;
    models[3]?.setZIndex(minZIndexStep3 - 1);
    console.log('操作后:', models.map((m, i) => ({
      id: nodes[i].id,
      zIndex: m?.zIndex
    })))

    // 步骤 4: 用户点击 Toolbar 的"数据预览"按钮
    console.log('\n步骤 4: 数据预览')
    const graphData = getGraphDataWithZIndex(lf)

    console.log('最终数据:')
    graphData.nodes.forEach((node: any) => {
      console.log(`  节点 ${node.id}: zIndex = ${node.zIndex}`)
    })

    // 验证最终顺序
    const sortedNodes = [...graphData.nodes].sort((a: any, b: any) => a.zIndex - b.zIndex)

    // node4 应该在最底层
    expect(sortedNodes[0].id).toBe(nodes[3].id)

    // node1 应该在最顶层
    expect(sortedNodes[sortedNodes.length - 1].id).toBe(nodes[0].id)

    console.log('\n✅ 完整流程测试通过！')
    console.log('验证结果:')
    console.log(`  - 最底层: ${sortedNodes[0].id} (zIndex: ${sortedNodes[0].zIndex})`)
    console.log(`  - 最顶层: ${sortedNodes[sortedNodes.length - 1].id} (zIndex: ${sortedNodes[sortedNodes.length - 1].zIndex})`)
  })

  it('场景8: 边界情况 - 最顶层节点继续置顶', () => {
    console.log('\n=== 场景8: 边界情况 - 最顶层节点继续置顶 ===')

    if (!lf) return

    const node1 = lf.addNode({ type: 'rect', x: 100, y: 100 })
    const node2 = lf.addNode({ type: 'rect', x: 200, y: 200 })
    const node3 = lf.addNode({ type: 'rect', x: 300, y: 300 })

    const model1 = lf.getNodeModelById(node1.id)
    const model2 = lf.getNodeModelById(node2.id)
    const model3 = lf.getNodeModelById(node3.id)

    model1?.setZIndex(1)
    model2?.setZIndex(2)
    model3?.setZIndex(3)

    const originalZIndex3 = model3?.zIndex

    console.log('初始 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 对已经在顶层的 node3 执行置顶
    lf.setElementZIndex(node3.id, 'top')

    console.log('置顶后 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 验证：顶层节点置顶会增加 zIndex
    expect(model3?.zIndex).toBeGreaterThan(originalZIndex3 || 0)
  })

  it('场景9: 边界情况 - 最底层节点继续置底', () => {
    console.log('\n=== 场景9: 边界情况 - 最底层节点继续置底 ===')

    if (!lf) return

    const node1 = lf.addNode({ type: 'rect', x: 100, y: 100 })
    const node2 = lf.addNode({ type: 'rect', x: 200, y: 200 })
    const node3 = lf.addNode({ type: 'rect', x: 300, y: 300 })

    const model1 = lf.getNodeModelById(node1.id)
    const model2 = lf.getNodeModelById(node2.id)
    const model3 = lf.getNodeModelById(node3.id)

    model1?.setZIndex(1)
    model2?.setZIndex(2)
    model3?.setZIndex(3)

    const originalZIndex1 = model1?.zIndex

    console.log('初始 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 对已经在底层的 node1 执行置底
    // 修复：使用正确的置底逻辑
    const allNodesScene9 = lf.graphModel.nodes;
    const allZIndexesScene9 = allNodesScene9.map(n => n.zIndex).filter(z => z !== undefined);
    const minZIndexScene9 = allZIndexesScene9.length > 0 ? Math.min(...allZIndexesScene9) : 1;
    model1?.setZIndex(minZIndexScene9 - 1);

    console.log('置底后 zIndex:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 验证：底层节点置底会减少 zIndex
    expect(model1?.zIndex).toBeLessThan(originalZIndex1 || Infinity)
  })
})
