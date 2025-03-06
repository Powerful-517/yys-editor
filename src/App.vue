<script setup>
import Yys from './components/Yys.vue'
import Watermark from './components/Watermark.vue' // 引入 Watermark 组件
</script>

<template>
  <main id="main-container">
    <!-- 添加 Watermark 组件 -->
    <Watermark text="示例水印" font="30px Arial" color="rgba(184, 184, 184, 0.3)" angle=-20 >
      <Yys />
    </Watermark>
  </main>
</template>

<style scoped>
/* 确保 #main-container 具有相对定位 */
#main-container {
  position: relative;
  width: 100%;
  min-height: 100vh; /* 允许容器扩展 */
  //position: relative;
}

/* 如果 Yys 组件需要特定的高度或布局，可以根据需要调整 */
</style>