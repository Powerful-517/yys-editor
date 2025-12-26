<script setup lang="ts">
const props = defineProps<{
  node: any;
}>();
</script>

<template>
  <div class="property-section">
    <div class="section-header">文本节点</div>
    <div class="property-item">
      <div class="property-value">文本编辑器待实现，当前节点内容：{{ props.node?.properties?.text?.content || '未设置' }}</div>
    </div>
  </div>
</template>
