import { describe, it, expect } from 'vitest'
import {
  CURRENT_SCHEMA_VERSION,
  DefaultNodeStyle,
  type GraphNode,
  type GraphEdge,
  type NodeProperties,
  type RootDocument
} from '../ts/schema'

describe('Schema 数据结构验证', () => {
  it('当前 schema 版本应该是 1.0.0', () => {
    expect(CURRENT_SCHEMA_VERSION).toBe('1.0.0')
  })

  it('DefaultNodeStyle 应该包含正确的默认值', () => {
    expect(DefaultNodeStyle).toMatchObject({
      width: 180,
      height: 120,
      rotate: 0,
      fill: '#ffffff',
      stroke: '#dcdfe6'
    })
  })

  it('创建 GraphNode 应该符合类型定义', () => {
    const node: GraphNode = {
      id: 'node-1',
      type: 'rect',
      x: 100,
      y: 200,
      properties: {
        style: {
          width: 200,
          height: 150,
          fill: '#ff0000'
        }
      }
    }

    expect(node.id).toBe('node-1')
    expect(node.type).toBe('rect')
    expect(node.properties.style.width).toBe(200)
  })

  it('创建 GraphEdge 应该包含必需字段', () => {
    const edge: GraphEdge = {
      id: 'edge-1',
      sourceNodeId: 'node-1',
      targetNodeId: 'node-2'
    }

    expect(edge.id).toBe('edge-1')
    expect(edge.sourceNodeId).toBe('node-1')
    expect(edge.targetNodeId).toBe('node-2')
  })

  it('NodeProperties 应该支持式神数据', () => {
    const properties: NodeProperties = {
      style: DefaultNodeStyle,
      shikigami: {
        name: '茨木童子',
        avatar: '/assets/Shikigami/ibaraki.png',
        rarity: 'SSR'
      }
    }

    expect(properties.shikigami?.name).toBe('茨木童子')
    expect(properties.shikigami?.rarity).toBe('SSR')
  })

  it('NodeProperties 应该支持御魂数据', () => {
    const properties: NodeProperties = {
      style: DefaultNodeStyle,
      yuhun: {
        name: '破势',
        type: '攻击',
        avatar: '/assets/Yuhun/poshi.png'
      }
    }

    expect(properties.yuhun?.name).toBe('破势')
    expect(properties.yuhun?.type).toBe('攻击')
  })

  it('RootDocument 应该包含文件列表和活动文件', () => {
    const doc: RootDocument = {
      schemaVersion: '1.0.0',
      fileList: [],
      activeFile: 'File 1',
      activeFileId: 'f_123'
    }

    expect(doc.schemaVersion).toBe('1.0.0')
    expect(doc.activeFile).toBe('File 1')
    expect(doc.activeFileId).toBe('f_123')
  })
})
