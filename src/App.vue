<script setup lang="ts">
import Yys from './components/Yys.vue';
import Toolbar from './components/Toolbar.vue';
import ProjectExplorer from './components/ProjectExplorer.vue';
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useFilesStore } from "@/stores/files";
import Vue3DraggableResizable from 'vue3-draggable-resizable';
import {TabPaneName, TabsPaneContext} from "element-plus";

const filesStore = useFilesStore();

const yysRef = ref(null);
const width = ref('100%');
const height = ref('100vh');
const toolbarHeight = 48; // 工具栏的高度
const windowHeight = ref(window.innerHeight);
const contentHeight = computed(() => `${windowHeight.value - toolbarHeight}px`);

const onResizing = (x, y, width, height) => {
  width.value = width;
  height.value = height;
};

const onHandleInport = (file) => {
  yysRef.value.importGroups(file);
};

const onHandleExport = () => {
  yysRef.value.exportGroups();
};

const element = ref({
  x: 400,
  y: 20,
  width: 1080,
  height: windowHeight.value - toolbarHeight,
  isActive: false,
});

const handleFileSelected = (fileId) => {
  filesStore.setActiveFile(fileId);
};

const handleTabsEdit = (
    targetName: TabPaneName | undefined,
    action: 'remove' | 'add'
)=> {
  const tabIndex = filesStore.fileList.findIndex(file => file.name === parseInt(name.toString()));
  if (tabIndex !== -1) {
    filesStore.fileList.splice(tabIndex, 1);
    if (filesStore.fileList.length > 0) {
      filesStore.setActiveFile(filesStore.fileList[0].name);
    } else {
      filesStore.setActiveFile(-1); // 或者其他适当的值表示没有活动文件
    }
  }
};

onMounted(() => {
  window.addEventListener('resize', () => {
    windowHeight.value = window.innerHeight;
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    windowHeight.value = window.innerHeight;
  });
});
</script>

<template>
  <div class="container">
    <!-- 工具栏 -->
    <Toolbar title="yys-editor" username="示例用户" @handleExport="onHandleExport" @handleImport="onHandleInport" />
    <!-- 侧边栏和工作区 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <ProjectExplorer :files="filesStore.fileList" @file-selected="handleFileSelected" />
      </aside>

      <!-- 工作区 -->
      <div class="workspace">
        <main id="main-container" :style="{ height: contentHeight, overflow: 'auto' }">
          <el-tabs
              v-model="filesStore.activeFile"
              type="card"
              class="demo-tabs"
              editable
              @edit="handleTabsEdit"
          >
            <el-tab-pane
                v-for="(file, index) in filesStore.fileList"
                :key="index"
                :label="file.label"
                :name="file.name.toString()"
            >
              <Yys ref="yysRef" />
            </el-tab-pane>
          </el-tabs>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

.toolbar {
  height: 48px; /* 与 toolbarHeight 一致 */
  flex-shrink: 0; /* 防止 Toolbar 被压缩 */
  background-color: #fff; /* 添加背景色以便观察 */
  z-index: 1; /* 确保 Toolbar 在上层 */
}

.main-content {
  display: flex;
  flex: 1; /* 占据剩余空间 */
  overflow: hidden; /* 防止内容溢出 */
  margin-top: 48px; /* 确保 main-content 在 Toolbar 下方 */
}

.sidebar {
  width: 200px; /* 侧边栏宽度 */
  background-color: #f0f0f0; /* 背景色 */
  flex-shrink: 0; /* 防止侧边栏被压缩 */
  overflow-y: auto; /* 允许侧边栏内容滚动 */
}

.workspace {
  flex: 1; /* 占据剩余空间 */
  overflow: hidden; /* 防止内容溢出 */
}

#main-container {
  position: relative;
  height: 100%; /* 确保内容区域占满父容器 */
  overflow-y: auto; /* 允许内容滚动 */
}
</style>