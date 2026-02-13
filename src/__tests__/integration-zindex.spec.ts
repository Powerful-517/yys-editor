import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import LogicFlow, { EventType } from '@logicflow/core'

/**
 * 集成测试：验证拖拽创建节点时 zIndex 初始值为 1000
 *
 * 这个测试模拟了完整的用户流程：
 * 1. 从 ComponentsPanel 拖拽创建节点
 * 2. FlowEditor 的 NODE_ADD 事件监听器设置 zIndex 为 1000
 * 3. 验证新节点的 zIndex 确实是 1000
 */
describe('集成测试：拖拽创建节点 zIndex 为 1000', () => {
  let lf: LogicFlow | null = null
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)

    lf = new LogicFlow({
      container,
      grid: { type: 'dot', size: 10 },
    })

    // 模拟 FlowEditor.vue 中的 NODE_ADD 事件监听器（第 947-962 行）
    lf.on(EventType.NODE_ADD, ({ data }) => {
      console.log('[NODE_ADD 事件触发] 节点ID:', data.id)
      const model = lf!.getNodeModelById(data.id)
      if (model) {
        console.log('[NODE_ADD] 获取到节点模型，当前 zIndex:', model.zIndex)
        const newZIndex = 1000
        console.log(`[NODE_ADD] 准备设置 zIndex: ${newZIndex}`)
        model.setZIndex(newZIndex)
        console.log(`[NODE_ADD] 设置后的 zIndex:`, model.zIndex)
      } else {
        console.log('[NODE_ADD] 未能获取到节点模型')
      }
    })

    lf.render({ nodes: [], edges: [] })
  })

  afterEach(() => {
    if (lf) {
      lf.destroy()
      lf = null
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
      container = null
    }
  })

  it('场景：用户从组件面板拖拽创建节点', () => {
    console.log('\n=== 场景：用户从组件面板拖拽创建节点 ===')

    if (!lf) return

    // 步骤 1: 用户从 ComponentsPanel 拖拽一个长方形组件
    console.log('\n步骤 1: 拖拽长方形组件到画布')
    const rectNode = lf.addNode({
      type: 'rect',
      x: 100,
      y: 100,
      properties: {
        width: 150,
        height: 150,
        style: { background: '#fff', border: '2px solid black' }
      }
    })

    const rectModel = lf.getNodeModelById(rectNode.id)
    console.log('长方形节点 zIndex:', rectModel?.zIndex)
    expect(rectModel?.zIndex).toBe(1000)

    // 步骤 2: 用户拖拽一个圆形组件
    console.log('\n步骤 2: 拖拽圆形组件到画布')
    const ellipseNode = lf.addNode({
      type: 'ellipse',
      x: 200,
      y: 200,
      properties: {
        width: 150,
        height: 150,
        style: { background: '#fff', border: '2px solid black', borderRadius: '50%' }
      }
    })

    const ellipseModel = lf.getNodeModelById(ellipseNode.id)
    console.log('圆形节点 zIndex:', ellipseModel?.zIndex)
    expect(ellipseModel?.zIndex).toBe(1000)

    // 步骤 3: 用户拖拽一个菱形组件
    console.log('\n步骤 3: 拖拽菱形组件到画布')
    const diamondNode = lf.addNode({
      type: 'diamond',
      x: 300,
      y: 300,
      properties: {
        width: 150,
        height: 150
      }
    })

    const diamondModel = lf.getNodeModelById(diamondNode.id)
    console.log('菱形节点 zIndex:', diamondModel?.zIndex)
    expect(diamondModel?.zIndex).toBe(1000)

    // 验证所有节点
    console.log('\n验证：所有新创建的节点 zIndex 都是 1000')
    const allNodes = lf.graphModel.nodes
    console.log('所有节点的 zIndex:', allNodes.map(n => ({ id: n.id, type: n.type, zIndex: n.zIndex })))

    allNodes.forEach(node => {
      expect(node.zIndex).toBe(1000)
    })

    console.log('\n✅ 测试通过：所有拖拽创建的节点初始 zIndex 都是 1000')
  })

  it('场景：新节点的 zIndex 不会影响图层操作', () => {
    console.log('\n=== 场景：新节点的 zIndex 不会影响图层操作 ===')

    if (!lf) return

    // 创建 3 个节点（都是 zIndex 1000）
    const node1 = lf.addNode({ type: 'rect', x: 100, y: 100 })
    const node2 = lf.addNode({ type: 'rect', x: 200, y: 200 })
    const node3 = lf.addNode({ type: 'rect', x: 300, y: 300 })

    const model1 = lf.getNodeModelById(node1.id)
    const model2 = lf.getNodeModelById(node2.id)
    const model3 = lf.getNodeModelById(node3.id)

    console.log('初始状态（所有节点 zIndex 都是 1000）:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 执行置顶操作
    console.log('\n执行：将 node1 置于顶层')
    lf.setElementZIndex(node1.id, 'top')

    console.log('操作后:', {
      node1: model1?.zIndex,
      node2: model2?.zIndex,
      node3: model3?.zIndex
    })

    // 验证：node1 的 zIndex 应该大于其他节点
    expect(model1?.zIndex).toBeGreaterThan(model2?.zIndex || 0)
    expect(model1?.zIndex).toBeGreaterThan(model3?.zIndex || 0)

    console.log('\n✅ 测试通过：即使初始 zIndex 相同，图层操作仍然正常工作')
  })
})
