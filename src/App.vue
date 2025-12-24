<script setup lang="ts">
import Toolbar from './components/Toolbar.vue';
import ProjectExplorer from './components/ProjectExplorer.vue';
import ComponentsPanel from './components/flow/ComponentsPanel.vue';
import {computed, ref, onMounted, onUnmounted, reactive, watch} from "vue";
import {useFilesStore} from "@/ts/useStore";
import Vue3DraggableResizable from 'vue3-draggable-resizable';
import {TabPaneName, TabsPaneContext} from "element-plus";
import FlowEditor from './components/flow/FlowEditor.vue';
import ShikigamiSelect from './components/flow/nodes/yys/ShikigamiSelect.vue';
import YuhunSelect from './components/flow/nodes/yys/YuhunSelect.vue';
import PropertySelect from './components/flow/nodes/yys/PropertySelect.vue';
import DialogManager from './components/DialogManager.vue';
import {getLogicFlowInstance} from "@/ts/useLogicFlow";

const filesStore = useFilesStore();

const width = ref('100%');
const height = ref('100vh');
const toolbarHeight = 48; // 工具栏的高度
const windowHeight = ref(window.innerHeight);
const contentHeight = computed(() => `${windowHeight.value - toolbarHeight}px`);

const handleTabsEdit = (
    targetName: string | undefined,
    action: 'remove' | 'add'
) => {
  if (action === 'remove') {
    filesStore.removeTab(targetName);
  } else if (action === 'add') {
    filesStore.addTab();
  }
};

onMounted(() => {
  // 初始化自动保存功能
  filesStore.initializeWithPrompt();
  filesStore.setupAutoSave();
});

onUnmounted(() => {

});

// 1) 切换激活文件：仅当 id 变化时保存旧数据并渲染新数据
watch(
  () => filesStore.activeFileId,
  async (newId, oldId) => {
    if (oldId && newId !== oldId) {
      filesStore.updateTab(oldId);
    }

    if (newId) {
      const logicFlowInstance = getLogicFlowInstance();
      const currentTab = filesStore.getTab(newId);

      if (logicFlowInstance && currentTab?.graphRawData) {
        try {
          logicFlowInstance.render(currentTab.graphRawData);
          logicFlowInstance.zoom(
            currentTab.transform?.SCALE_X ?? 1,
            [currentTab.transform?.TRANSLATE_X ?? 0, currentTab.transform?.TRANSLATE_Y ?? 0]
          );
        } catch (error) {
          console.warn('渲染画布数据失败:', error);
        }
      }
    }
  },
  { flush: 'post' }
);

// 2) 导入等替换 fileList 引用时，主动按当前 activeFileId 渲染一次，不保存旧数据
watch(
  () => filesStore.fileList,
  () => {
    const logicFlowInstance = getLogicFlowInstance();
    const currentTab = filesStore.getTab(filesStore.activeFileId);

    if (logicFlowInstance && currentTab?.graphRawData) {
      try {
        logicFlowInstance.render(currentTab.graphRawData);
        logicFlowInstance.zoom(
          currentTab.transform?.SCALE_X ?? 1,
          [currentTab.transform?.TRANSLATE_X ?? 0, currentTab.transform?.TRANSLATE_Y ?? 0]
        );
      } catch (error) {
        console.warn('渲染画布数据失败:', error);
      }
    }
  },
  { flush: 'post' }
);

</script>

<template>
  <div class="container">
    <!-- 工具栏 -->
    <Toolbar title="yys-editor" username="示例用户"/>
    <!-- 侧边栏和工作区 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <ComponentsPanel/>
      <!-- 工作区 -->
      <div class="workspace">
        <el-tabs
            v-model="filesStore.activeFileId"
            type="card"
            class="demo-tabs"
            editable
            @edit="handleTabsEdit"
        >
          <el-tab-pane
              v-for="(file, index) in filesStore.visibleFiles"
              :key="`${file.id}-${filesStore.activeFileId}`"
              :label="file.label"
              :name="file.id"
          />
        </el-tabs>
        <div id="main-container" :style="{ height: contentHeight, overflow: 'auto' }">
          <FlowEditor
              :height="contentHeight"
          />
        </div>
      </div>
    </div>
    <DialogManager/>
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
  width: 230px; /* 侧边栏宽度 */
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
}
</style>



