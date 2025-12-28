<script setup lang="ts">
import { computed, ref } from 'vue';
import { toTextStyle } from '@/ts/nodeStyle';
import { useNodeAppearance } from '@/ts/useNodeAppearance';

const currentShikigami = ref({ name: '未选择式神', avatar: '', rarity: '' });

const { containerStyle, textStyle } = useNodeAppearance({
  onPropsChange(props) {
    if (props.shikigami) {
      currentShikigami.value = props.shikigami;
    }
  }
});

const mergedContainerStyle = computed(() => ({ ...containerStyle.value, boxSizing: 'border-box' }));
</script>

<template>
  <div class="node-content" :style="mergedContainerStyle">
    <img
      v-if="currentShikigami.avatar"
      :src="currentShikigami.avatar"
      :alt="currentShikigami.name"
      class="shikigami-image"
      draggable="false"
    />
    <div v-else class="placeholder-text" :style="textStyle">点击选择式神</div>
    <div class="name-text" :style="textStyle">{{ currentShikigami.name }}</div>
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
