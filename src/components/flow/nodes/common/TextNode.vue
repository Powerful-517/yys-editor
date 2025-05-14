<script setup lang="ts">
import { ref, watch } from 'vue';
import { Handle, useVueFlow } from '@vue-flow/core';
import { NodeResizer } from '@vue-flow/node-resizer';
import '@vue-flow/node-resizer/dist/style.css';

const props = defineProps({
  data: Object,
  id: String,
  selected: Boolean
});

const nodeWidth = ref(200);
const nodeHeight = ref(120);
const html = ref('');

watch(() => props.data, (newData) => {
  if (newData && newData.html !== undefined) html.value = newData.html;
  if (newData && newData.width) nodeWidth.value = newData.width;
  if (newData && newData.height) nodeHeight.value = newData.height;
}, { immediate: true });
</script>
<template>
  <div class="text-node" :style="{ width: `${nodeWidth}px`, height: `${nodeHeight}px` }">
    <NodeResizer v-if="selected" :min-width="80" :min-height="40" :max-width="400" :max-height="400" />
    <Handle type="target" position="left" :id="`${id}-target`" />
    <div class="text-content" v-html="html"></div>
    <Handle type="source" position="right" :id="`${id}-source`" />
  </div>
</template>
<style scoped>
.text-node {
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.text-content {
  width: 100%;
  height: 100%;
  padding: 8px;
  font-size: 15px;
  color: #333;
  word-break: break-all;
  overflow: auto;
}
</style> 