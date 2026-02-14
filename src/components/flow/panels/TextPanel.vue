<script setup lang="ts">
const props = defineProps<{
  node: any;
}>();
</script>

<template>
  <div class="property-section">
    <div class="section-header">文本节点</div>
    <div class="property-item">
      <label class="property-label">内容</label>
      <div class="property-value">
        {{ props.node?.properties?.text || '未设置' }}
      </div>
    </div>
    <div class="property-item">
      <div class="property-note">
        💡 提示：双击画布中的节点即可编辑文字
      </div>
    </div>
  </div>
</template>
