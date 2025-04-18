<script setup lang="ts">
import Yys from './components/Yys.vue';
import Toolbar from './components/Toolbar.vue';
import ProjectExplorer from './components/ProjectExplorer.vue';
import {computed, ref, onMounted, onUnmounted} from "vue";
import {useFilesStore} from "@/ts/files";
import Vue3DraggableResizable from 'vue3-draggable-resizable';
import {TabPaneName, TabsPaneContext} from "element-plus";
import YysRank from "@/components/YysRank.vue";

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

const element = ref({
  x: 400,
  y: 20,
  width: 1080,
  height: windowHeight.value - toolbarHeight,
  isActive: false,
});

const handleTabsEdit = (
    targetName: String | undefined,
    action: 'remove' | 'add'
) => {
  if (action === 'remove') {
    filesStore.closeTab(targetName);
  } else if (action === 'add') {
    const newFileName = `File ${filesStore.fileList.length + 1}`;

    filesStore.addFile({
      label: newFileName,
      name: newFileName,
      visible: true,
      type: 'PVE',
      groups: [
        {
          shortDescription: " ",
          groupInfo: [{}, {}, {}, {}, {}],
          details: ''
        },
        {
          shortDescription: '',
          groupInfo: [{}, {}, {}, {}, {}],
          details: ''
        }
      ]
    });
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

const activeFileGroups = computed(() => {
  const activeFile = filesStore.fileList.find(file => file.name === filesStore.activeFile);
  return activeFile ? activeFile.groups : [];
});
</script>

<template>
  <div class="container">
    <!-- 工具栏 -->
    <Toolbar title="yys-editor" username="示例用户"/>
    <!-- 侧边栏和工作区 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <ProjectExplorer :allFiles="filesStore.fileList"/>
      </aside>

      <!-- 工作区 -->
      <div class="workspace">
        <el-tabs
            v-model="filesStore.activeFile"
            type="card"
            class="demo-tabs"
            editable
            @edit="handleTabsEdit"
        >
          <el-tab-pane
              v-for="(file, index) in filesStore.visibleFiles"
              :key="`${file.name}-${filesStore.activeFile}`"
              :label="file.label"
              :name="file.name.toString()"
          >
            <main id="main-container" :style="{ height: contentHeight, overflow: 'auto' }">
              <Yys class="yys" :groups="activeFileGroups" v-if="file.type === 'PVE' "/>
              <YysRank :groups="activeFileGroups" v-else-if="file.type === 'PVP' "/>
            </main>
          </el-tab-pane>
        </el-tabs>
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
  width: 20%; /* 侧边栏宽度 */
  background-color: #f0f0f0; /* 背景色 */
  flex-shrink: 0; /* 防止侧边栏被压缩 */
  overflow-y: auto; /* 允许侧边栏内容滚动 */
}

.workspace {
  flex: 1; /* 占据剩余空间 */
  overflow: hidden; /* 防止内容溢出 */
  display: inline-block;
}

#main-container {
  position: relative;
  height: 100%; /* 确保内容区域占满父容器 */
  overflow-y: auto; /* 允许内容滚动 */
  min-height: 100vh; /* 允许容器扩展 */
  //display: inline-block;
  max-width: 100%;
}

</style>