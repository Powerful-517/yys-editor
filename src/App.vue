<script setup>
import Yys from './components/Yys.vue'
import Watermark from './components/Watermark.vue' // 引入 Watermark 组件
</script>

<template>
  <main id="main-container">
    <Yys />
    <Watermark text="示例水印" font="30px Arial" color="rgba(184, 184, 184, 0.3)" angle=-20 /> <!-- 添加 Watermark 组件 -->
  </main>
</template>

<style scoped>
/* 确保 #main-container 具有相对定位 */
#main-container {
  position: relative;
  width: 100%;
  height: 100vh; /* 视口高度 */
}

/* 如果 Yys 组件需要特定的高度或布局，可以根据需要调整 */
</style>