<script setup>
import Yys from './components/Yys.vue'
import Toolbar from './components/Toolbar.vue'
import {ref} from "vue";

const yysRef = ref(null);

const onHandleInport = (file) => {
  yysRef.value.importGroups(file);
};

const onHandleExport = () => {
  yysRef.value.exportGroups();
};
</script>

<template>
  <main id="main-container">
    <!-- 添加工具栏 -->
    <Toolbar title="yys-editor" username="示例用户" data-html2canvas-ignore="true" @handleExport="onHandleExport" @handleImport="onHandleInport"/>
    <!-- 添加 Watermark 组件 -->
    <Yys ref="yysRef"/>

  </main>
</template>

<style scoped>
/* 确保 #main-container 具有相对定位 */
#main-container {
  margin-top: 48px; /* 与工具栏高度相同 */
  position: relative;

  min-height: 100vh; /* 允许容器扩展 */
  display: inline-block;
  max-width: 100%;

}

/* 如果 Yys 组件需要特定的高度或布局，可以根据需要调整 */
</style>