import type LogicFlow from '@logicflow/core';

let logicFlowInstance: LogicFlow | null = null;

export function setLogicFlowInstance(lf: LogicFlow) {
  logicFlowInstance = lf;
}

export function getLogicFlowInstance(): LogicFlow | null {
  return logicFlowInstance;
}

export function destroyLogicFlowInstance() {
  logicFlowInstance?.destroy();
  logicFlowInstance = null;
} 