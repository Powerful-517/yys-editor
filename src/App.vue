<script setup lang="ts">
import Toolbar from './components/Toolbar.vue';
import ProjectExplorer from './components/ProjectExplorer.vue';
import ComponentsPanel from './components/flow/ComponentsPanel.vue';
import { computed, ref, onMounted, onUnmounted, onBeforeUpdate, reactive, provide, inject, watch } from "vue";
import { useFilesStore } from "@/ts/useStore";
import Vue3DraggableResizable from 'vue3-draggable-resizable';
import { TabPaneName, TabsPaneContext } from "element-plus";
import FlowEditor from './components/flow/FlowEditor.vue';
import ShikigamiSelect from './components/flow/nodes/yys/ShikigamiSelect.vue';
import YuhunSelect from './components/flow/nodes/yys/YuhunSelect.vue';
import PropertySelect from './components/flow/nodes/yys/PropertySelect.vue';
// import { useVueFlow } from '@vue-flow/core';
import DialogManager from './components/DialogManager.vue';

const filesStore = useFilesStore();
// const { updateNode,toObject,fromObject } = useVueFlow();

const width = ref('100%');
const height = ref('100vh');
const toolbarHeight = 48; // 工具栏的高度
const windowHeight = ref(window.innerHeight);
const contentHeight = computed(() => `${windowHeight.value - toolbarHeight}px`);

const flowEditorRef = ref(null);
const flowEditorRefs = ref({});
const lastActiveFile = ref(filesStore.activeFile);

const handleTabsEdit = (
    targetName: string | undefined,
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
      type: 'FLOW',
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
  // 初始化自动保存功能
  filesStore.initializeWithPrompt();
  filesStore.setupAutoSave();
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

onBeforeUpdate(() => {
  flowEditorRefs.value = {};
});

const handleAddNode = (nodeData) => {
  const activeEditor = flowEditorRefs.value[filesStore.activeFile];
  if (activeEditor) {
    const { x, y, zoom } = activeEditor.getViewport();
    const position = { x: -x / zoom + 150, y: -y / zoom + 150 };
    activeEditor.handleAddNode({ ...nodeData, position });
  }
};

watch(
  () => filesStore.activeFile,
  async (newVal, oldVal) => {
    // 切换前保存旧 tab 的数据和视口
    if (oldVal && flowEditorRef.value) {
      if (flowEditorRef.value.getGraphRawData) {
        const rawData = flowEditorRef.value.getGraphRawData();
        filesStore.updateFileFlowData(oldVal, rawData);
      }
      if (flowEditorRef.value.getViewport) {
        const viewport = flowEditorRef.value.getViewport();
        console.log(`[Tab切换] 切换前保存 tab "${oldVal}" 的视口信息:`, viewport);
        filesStore.updateFileViewport(oldVal, viewport);
      }
    }
    lastActiveFile.value = newVal;

    // 切换后恢复新 tab 的数据和视口
    if (newVal && flowEditorRef.value) {
      if (flowEditorRef.value.renderRawData) {
        const newRawData = filesStore.getFileFlowData(newVal);
        if (newRawData) flowEditorRef.value.renderRawData(newRawData);
      }
      if (flowEditorRef.value.setViewport) {
        const newViewport = filesStore.getFileViewport(newVal);
        console.log(`[Tab切换] 切换后恢复 tab "${newVal}" 的视口信息:`, newViewport);
        requestAnimationFrame(() => {
          flowEditorRef.value.setViewport(newViewport);
        });
      }
    }
  }
);

const handleDropOnCanvas = (event: DragEvent) => {
  event.preventDefault();
  const nodeData = JSON.parse(event.dataTransfer?.getData('application/json') || '{}');
  // 计算画布坐标（这里简单用鼠标坐标，后续可结合 LogicFlow 视口变换优化）
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const id = `node-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  filesStore.addNode({ id, type: nodeData.type, x, y, ...nodeData.data });
};

const handleDragOverOnCanvas = (event: DragEvent) => {
  event.preventDefault();
};

</script>

<template>
  <div class="container">
    <!-- 工具栏 -->
    <Toolbar title="yys-editor" username="示例用户"/>
    <!-- 侧边栏和工作区 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <ComponentsPanel @add-node="handleAddNode" />
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
          />
        </el-tabs>
        <div id="main-container" :style="{ height: contentHeight, overflow: 'auto' }"
          @dragover="handleDragOverOnCanvas"
          @drop="handleDropOnCanvas"
        >
          <FlowEditor
            ref="flowEditorRef"
            :height="contentHeight"
            :nodes="filesStore.getFileFlowData(filesStore.activeFile)?.nodes || []"
            :edges="filesStore.getFileFlowData(filesStore.activeFile)?.edges || []"
            :viewport="filesStore.getFileFlowData(filesStore.activeFile)?.viewport || { x: 0, y: 0, zoom: 1 }"
            :key="filesStore.activeFile"
          />
        </div>
      </div>
    </div>
    <DialogManager />
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



