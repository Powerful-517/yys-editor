import type LogicFlow from '@logicflow/core'
import { Menu, Label, Snapshot, SelectionSelect, MiniMap, Control } from '@logicflow/extension'
import { register } from '@logicflow/vue-node-registry'

import ImageNode from './components/flow/nodes/common/ImageNode.vue'
import AssetSelectorNode from './components/flow/nodes/common/AssetSelectorNode.vue'
import TextNode from './components/flow/nodes/common/TextNode.vue'
import TextNodeModel from './components/flow/nodes/common/TextNodeModel'
import VectorNode from './components/flow/nodes/common/VectorNode.vue'
import VectorNodeModel from './components/flow/nodes/common/VectorNodeModel'

export type FlowCapabilityLevel = 'render-only' | 'interactive'

export interface FlowNodeRegistration {
  type: string
  component?: any
  model?: any
}

export type FlowPlugin = any

const DEFAULT_FLOW_NODES: FlowNodeRegistration[] = [
  { type: 'imageNode', component: ImageNode },
  { type: 'assetSelector', component: AssetSelectorNode },
  { type: 'textNode', component: TextNode, model: TextNodeModel },
  { type: 'vectorNode', component: VectorNode, model: VectorNodeModel }
]

const FLOW_PLUGIN_PRESETS: Record<FlowCapabilityLevel, FlowPlugin[]> = {
  'render-only': [Snapshot],
  interactive: [Menu, Label, Snapshot, SelectionSelect, MiniMap, Control]
}

export function getFlowPluginsByCapability(capability: FlowCapabilityLevel): FlowPlugin[] {
  return [...FLOW_PLUGIN_PRESETS[capability]]
}

export function resolveFlowPlugins(
  capability: FlowCapabilityLevel,
  plugins?: FlowPlugin[]
): FlowPlugin[] {
  if (Array.isArray(plugins) && plugins.length > 0) {
    return plugins
  }
  return getFlowPluginsByCapability(capability)
}

export function getDefaultFlowNodes(): FlowNodeRegistration[] {
  return [...DEFAULT_FLOW_NODES]
}

export function resolveFlowNodes(nodes?: FlowNodeRegistration[]): FlowNodeRegistration[] {
  if (Array.isArray(nodes) && nodes.length > 0) {
    return nodes
  }
  return getDefaultFlowNodes()
}

export function registerFlowNodes(lfInstance: LogicFlow, nodes?: FlowNodeRegistration[]) {
  const registrations = resolveFlowNodes(nodes)
  registrations.forEach((registration) => register(registration, lfInstance))
}

