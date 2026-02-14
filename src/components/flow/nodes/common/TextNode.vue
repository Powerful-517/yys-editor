<script setup lang="ts">
// LogicFlow 会自动处理文本节点的渲染和编辑
</script>

<template>
  <div class="text-content">
    <!-- LogicFlow 会自动渲染 text 内容 -->
  </div>
</template>

<style scoped>
.text-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  outline: none;
  word-break: break-word;
  padding: 4px;
  box-sizing: border-box;
  cursor: text;
}

.text-content:focus {
  background: rgba(64, 158, 255, 0.1);
  border-radius: 2px;
}
</style>
