<script setup lang="ts">
import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue';
import { useNodeAppearance } from '@/ts/useNodeAppearance';

const currentYuhun = ref({ name: '未选择御魂', avatar: '', type: '' });
const getNode = inject('getNode') as (() => any) | undefined;
const zIndex = ref(1);
let intervalId: number | null = null;

// 使用轮询方式定期更新 zIndex
onMounted(() => {
  const node = getNode?.();
  if (node) {
    zIndex.value = node.zIndex ?? 1;

    // 每 100ms 检查一次 zIndex 是否变化
    intervalId = window.setInterval(() => {
      const currentZIndex = node.zIndex ?? 1;
      if (zIndex.value !== currentZIndex) {
        zIndex.value = currentZIndex;
      }
    }, 100);
  }
});

onBeforeUnmount(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
});

const { containerStyle, textStyle } = useNodeAppearance({
  onPropsChange(props) {
    if (props.yuhun) {
      currentYuhun.value = props.yuhun;
    }
  }
});
</script>

<template>
  <div class="node-content" :style="containerStyle">
    <div class="zindex-badge">{{ zIndex }}</div>
    <img
      v-if="currentYuhun.avatar"
      :src="currentYuhun.avatar"
      :alt="currentYuhun.name"
      class="yuhun-image"
      draggable="false"
    />
    <div v-else class="placeholder-text" :style="textStyle">点击选择御魂</div>
    <div class="name-text" :style="textStyle">{{ currentYuhun.name }}</div>
    <div v-if="currentYuhun.type" class="type-text" :style="textStyle">{{ currentYuhun.type }}</div>
  </div>
</template>

<style scoped>
.node-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.zindex-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(64, 158, 255, 0.9);
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  z-index: 10;
  pointer-events: none;
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
