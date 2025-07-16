<script setup lang="ts">
import { ref, watch, onMounted, inject } from 'vue';
import { EventType } from '@logicflow/core';

const currentProperty = ref({ type: '未选择', priority: '可选' });

const getNode = inject('getNode') as (() => any) | undefined;
const getGraph = inject('getGraph') as (() => any) | undefined;


onMounted(() => {
  const node = getNode?.();
  const graph = getGraph?.();

  if (node?.properties?.property) {
    currentProperty.value = node.properties.property;
  }

  graph?.eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, (eventData: any) => {
    if (eventData.id === node.id && eventData.properties?.property) {
      currentProperty.value = eventData.properties.property;
    }
  });
});

// 辅助函数
const getPropertyTypeName = () => {
  const typeMap: Record<string, string> = {
    'attack': '攻击',
    'health': '生命',
    'defense': '防御',
    'speed': '速度',
    'crit': '暴击率',
    'critDmg': '暴击伤害',
    'effectHit': '效果命中',
    'effectResist': '效果抵抗',
    '未选择': '未选择'
  };
  return typeMap[currentProperty.value.type] || currentProperty.value.type;
};
const getPriorityName = () => {
  const priorityMap: Record<string, string> = {
    'required': '必须',
    'recommended': '推荐',
    'optional': '可选'
  };
  return priorityMap[currentProperty.value.priority] || currentProperty.value.priority;
};
</script>

<template>
  <div class="property-node" :class="[currentProperty.priority ? `priority-${currentProperty.priority}` : '']">
    <div class="node-content">
      <div class="node-header">
        <div class="node-title">属性要求</div>
      </div>
      <div class="node-body">
        <div class="property-main">
          <div class="property-type">{{ getPropertyTypeName() }}</div>
          <div v-if="currentProperty.type !== '未选择'" class="property-value">{{ currentProperty.value }}</div>
          <div v-else class="property-placeholder">点击设置属性</div>
        </div>
        <div class="property-details" v-if="currentProperty.type !== '未选择'">
          <div class="property-priority">优先级: {{ getPriorityName() }}</div>
          <div class="property-description" v-if="currentProperty.description">
            {{ currentProperty.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.property-node {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 180px;
  min-height: 180px;
}
.node-content {
  position: relative;
  background-color: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 100%;
  min-width: 180px;
  min-height: 180px;
}
.node-header {
  padding: 8px 10px;
  background-color: #f0f7ff;
  border-bottom: 1px solid #dcdfe6;
  border-radius: 4px 4px 0 0;
}
.node-title {
  font-weight: bold;
  font-size: 14px;
}
.node-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.property-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}
.property-type {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}
.property-value {
  font-size: 16px;
  color: #409eff;
  font-weight: bold;
  margin-bottom: 5px;
}
.property-placeholder {
  width: 120px;
  height: 40px;
  border: 1px dashed #c0c4cc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  border-radius: 4px;
  margin: 8px 0;
  transition: width 0.2s, height 0.2s;
}
.property-details {
  width: 100%;
  border-top: 1px dashed #ebeef5;
  padding-top: 8px;
}
.property-priority {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}
.property-description {
  font-size: 11px;
  color: #606266;
  margin-top: 5px;
  border-top: 1px dashed #ebeef5;
  padding-top: 5px;
  word-break: break-all;
}
</style>