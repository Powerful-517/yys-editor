<script setup lang="ts">
import Yys from './components/Yys.vue';
import Toolbar from './components/Toolbar.vue';
import ProjectExplorer from './components/ProjectExplorer.vue';
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useFilesStore } from "@/stores/files";
import Vue3DraggableResizable from 'vue3-draggable-resizable';
import { TabPaneName, TabsPaneContext } from "element-plus";

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

const handleExport = () => {
  const dataStr = JSON.stringify(filesStore.fileList, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'files.json';
  link.click();
  URL.revokeObjectURL(url);
};

const onHandleInport = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result as string);
      if (data[0].visible === true) {
        // 新版本格式：直接替换 fileList
        filesStore.$patch({ fileList: data });
      } else  {
        // 旧版本格式：仅包含 groups 数组
        const newFile = {
          label: `File ${filesStore.fileList.length + 1}`,
          name: String(filesStore.fileList.length + 1),
          visible: true,
          groups: data
        };
        filesStore.addFile(newFile);
      }
    } catch (error) {
      console.error('Failed to import file', error);
    }
  };
  reader.readAsText(file);
};

// const onHandleInport = (file) => {
//
//   handleImport(file);
// };

const onHandleExport = () => {
  handleExport();
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
  filesStore.setVisible(fileId, true);
};

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
      groups:[
        {
          shortDescription: '',
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
    <Toolbar title="yys-editor" username="示例用户" @handleExport="onHandleExport" @handleImport="onHandleInport" />
    <!-- 侧边栏和工作区 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <aside class="sidebar">
        <ProjectExplorer :allFiles="filesStore.fileList" @file-selected="handleFileSelected" />
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
                v-for="(file, index) in filesStore.visibleFiles"
                :key="index"
                :label="file.label"
                :name="file.name.toString()"
            >
              <Yys :groups="activeFileGroups" ref="yysRef" />
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
  min-height: 100vh; /* 允许容器扩展 */
  display: inline-block;
  max-width: 100%;
}
</style>