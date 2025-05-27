<script setup lang="ts">
import {ref, watch} from 'vue';
import {Handle, useVueFlow} from '@vue-flow/core';
import {NodeResizer} from '@vue-flow/node-resizer';
import '@vue-flow/node-resizer/dist/style.css';

const props = defineProps({
  data: Object,
  id: String,
  selected: Boolean
});

const nodeWidth = ref(180);
const nodeHeight = ref(120);

// 监听props.data变化，支持外部更新图片
watch(() => props.data, (newData) => {
  if (newData && newData.width) nodeWidth.value = newData.width;
  if (newData && newData.height) nodeHeight.value = newData.height;
}, {immediate: true});

</script>
<template>
  <NodeResizer v-if="selected" :min-width="60" :min-height="60" :max-width="400" :max-height="400"/>
  <div class="image-node">
    <Handle type="target" position="left" :id="`${id}-target`"/>
    <div class="image-content">
      <img v-if="props.data && props.data.url" :src="props.data.url" alt="图片节点"
           style="width:100%;height:100%;object-fit:contain;"/>
      <div v-else class="image-placeholder">未上传图片</div>
    </div>
    <Handle type="source" position="right" :id="`${id}-source`"/>
  </div>
</template>
<style scoped>
.image-node {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 180px;
  min-height: 180px;
}

.image-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  color: #bbb;
  font-size: 14px;
}
</style> 