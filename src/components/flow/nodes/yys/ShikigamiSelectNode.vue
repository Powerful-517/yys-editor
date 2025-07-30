<script setup lang="ts">
import {ref, onMounted, inject, watch} from 'vue';
import { EventType } from '@logicflow/core';

const currentShikigami = ref({ name: '未选择式神', avatar: '', rarity: '' });

const getNode = inject('getNode') as (() => any) | undefined;
const getGraph = inject('getGraph') as (() => any) | undefined;



onMounted(() => {
  const node = getNode?.();
  const graph = getGraph?.();

  // 初始化
  if (node?.properties?.shikigami) {
    currentShikigami.value = node.properties.shikigami;
  }

  // 监听属性变化
  graph?.eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, (eventData: any) => {
    if (eventData.id === node.id && eventData.properties?.shikigami) {
      currentShikigami.value = eventData.properties.shikigami;
    }
  });
});
</script>

<template>
  <div
    class="node-content"
    :style="{
      boxSizing: 'border-box',
      background: '#fff',
      borderRadius: '8px'
    }"
  >
    <img
      v-if="currentShikigami.avatar"
      :src="currentShikigami.avatar"
      :alt="currentShikigami.name"
      class="shikigami-image"
      draggable="false"
    />
    <div v-else class="placeholder-text">点击选择式神</div>
    <div class="name-text">{{ currentShikigami.name }}</div>
  </div>
</template>

<style scoped>
.node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.shikigami-image {
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
</style>