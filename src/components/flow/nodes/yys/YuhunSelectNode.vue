<script setup lang="ts">
import { ref } from 'vue';
import { useNodeAppearance } from '@/ts/useNodeAppearance';

const currentYuhun = ref({ name: '未选择御魂', avatar: '', type: '' });

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
