<script setup lang="ts">
import { ref, watch, onMounted, inject } from 'vue';
import { EventType } from '@logicflow/core';

const currentYuhun = ref({ name: '未选择御魂', avatar: '', type: '' });

const getNode = inject('getNode') as (() => any) | undefined;
const getGraph = inject('getGraph') as (() => any) | undefined;



onMounted(() => {
  const node = getNode?.();
  const graph = getGraph?.();

  if (node?.properties?.yuhun) {
    currentYuhun.value = node.properties.yuhun;
  }

  graph?.eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, (eventData: any) => {
    if (eventData.id === node.id && eventData.properties?.yuhun) {
      currentYuhun.value = eventData.properties.yuhun;
    }
  });
});
</script>

<template>
  <div class="node-content">
    <img
      v-if="currentYuhun.avatar"
      :src="currentYuhun.avatar"
      :alt="currentYuhun.name"
      class="yuhun-image"
    />
    <div v-else class="placeholder-text">点击选择御魂</div>
    <div class="name-text">{{ currentYuhun.name }}</div>
    <div v-if="currentYuhun.type" class="type-text">{{ currentYuhun.type }}</div>
  </div>
</template>

<style scoped>
.node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.yuhun-image {
  width: 85%;
  height: 85%;
  object-fit: cover;
}
.placeholder-text {
  color: #909399;
  font-size: 12px;
}
.name-text {
  font-size: 14px;
  text-align: center;
  margin-top: 8px;
}
.type-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
