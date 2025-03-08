<script setup>
import Yys from './components/Yys.vue'
import Watermark from './components/Watermark.vue' // 引入 Watermark 组件
import Toolbar from './components/Toolbar.vue'

</script>

<template>
  <main id="main-container">
    <!-- 添加工具栏 -->
    <Toolbar title="我的应用" username="示例用户" data-html2canvas-ignore="true"/>
    <!-- 添加 Watermark 组件 -->
    <Yys/>

  </main>
</template>

<style scoped>
/* 确保 #main-container 具有相对定位 */
#main-container {
  margin-top: 48px; /* 与工具栏高度相同 */
  position: relative;
  width: 100%;
  min-height: 100vh; /* 允许容器扩展 */
//position: relative;
}

/* 如果 Yys 组件需要特定的高度或布局，可以根据需要调整 */
</style>