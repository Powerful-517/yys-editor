<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { EventType } from '@logicflow/core';

type FitMode = 'contain' | 'cover' | 'fill';

const getNode = inject('getNode') as (() => any) | undefined;
const getGraph = inject('getGraph') as (() => any) | undefined;

const imageUrl = ref('');
const fit = ref<FitMode>('contain');

const refreshFromProps = (props?: any, node?: any) => {
  const targetProps = props ?? node?.properties ?? {};
  imageUrl.value = targetProps.image?.url ?? targetProps.url ?? '';
  fit.value = targetProps.image?.fit ?? targetProps.fit ?? 'contain';
};

let offChange: (() => void) | null = null;

onMounted(() => {
  const node = getNode?.();
  refreshFromProps(node?.properties, node);

  const graph = getGraph?.();
  const handler = (eventData: any) => {
    if (node && eventData.id === node.id) {
      refreshFromProps(eventData.properties, node);
    }
  };
  graph?.eventCenter.on(EventType.NODE_PROPERTIES_CHANGE, handler);
  offChange = () => graph?.eventCenter.off(EventType.NODE_PROPERTIES_CHANGE, handler);
});

onBeforeUnmount(() => {
  offChange?.();
});
</script>

<template>
  <div class="image-node">
    <div class="image-wrapper">
      <img v-if="imageUrl" :src="imageUrl" alt="图片节点" :style="{ objectFit: fit }" draggable="false" />
      <div v-else class="placeholder">
        <div class="placeholder-text">未上传图片</div>
        <div class="placeholder-hint">在右侧属性面板上传或填写 URL</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-node {
  width: 100%;
  height: 100%;
  min-width: 150px;
  min-height: 120px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
}

.image-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.image-wrapper img {
  width: 100%;
  height: 100%;
}

.placeholder {
  color: #909399;
  text-align: center;
  line-height: 1.4;
  padding: 12px;
}

.placeholder-text {
  font-weight: 600;
  margin-bottom: 4px;
}

.placeholder-hint {
  font-size: 12px;
}
</style>
