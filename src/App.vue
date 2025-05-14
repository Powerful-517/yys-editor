<script setup lang="ts">
import Toolbar from './components/Toolbar.vue';
import ProjectExplorer from './components/ProjectExplorer.vue';
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useFilesStore } from "@/ts/files";
import Vue3DraggableResizable from 'vue3-draggable-resizable';
import { TabPaneName, TabsPaneContext } from "element-plus";
import FlowEditor from './components/flow/FlowEditor.vue';
import ShikigamiSelect from './components/flow/nodes/yys/ShikigamiSelect.vue';
import YuhunSelect from './components/flow/nodes/yys/YuhunSelect.vue';
import PropertySelect from './components/flow/nodes/yys/PropertySelect.vue';
import { useVueFlow } from '@vue-flow/core';

const filesStore = useFilesStore();
const { updateNode } = useVueFlow();

const width = ref('100%');
const height = ref('100vh');
const toolbarHeight = 48; // 工具栏的高度
const windowHeight = ref(window.innerHeight);
const contentHeight = computed(() => `${windowHeight.value - toolbarHeight}px`);

// Dialogs and Selected Node Management
const showShikigamiDialog = ref(false);
const showYuhunDialog = ref(false);
const showPropertyDialog = ref(false);

const currentShikigami = ref({ name: '未选择式神', avatar: '', rarity: '' });
const currentYuhun = ref({ name: '未选择御魂', avatar: '', type: '' });
const currentProperty = ref({ type: '未选择属性', priority: 'optional', description: '' });

const selectedNode = ref(null);
const flowEditorRef = ref(null);

const openDialogForType = (type: string, node: any) => {
  selectedNode.value = node;
  switch (type) {
    case 'shikigami': showShikigamiDialog.value = true; break;
    case 'yuhun': showYuhunDialog.value = true; break;
    case 'property': showPropertyDialog.value = true; break;
  }
};

// Handle Dialogs Close
const closeDialogForType = (type: string) => {
  switch (type) {
    case 'shikigami': showShikigamiDialog.value = false; break;
    case 'yuhun': showYuhunDialog.value = false; break;
    case 'property': showPropertyDialog.value = false; break;
  }
};

// 更新式神信息
const updateNodeData = (type: string, data: any) => {
  if (selectedNode.value) {
    updateNode(selectedNode.value.id, {
      data: {
        ...selectedNode.value.data,
        [type]: data
      }
    });
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)}信息已更新:`, data.name || data.type);
    closeDialogForType(type);
  }
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
      <ProjectExplorer />
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
            <div id="main-container" :style="{ height: contentHeight, overflow: 'auto' }">
              <!-- 流程图编辑器 -->
              <FlowEditor
                  ref="flowEditorRef"
                  :height="contentHeight"
                  @open-shikigami-select="node => openDialogForType('shikigami', node)"
                  @open-yuhun-select="node => openDialogForType('yuhun', node)"
                  @open-property-select="node => openDialogForType('property', node)"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 全局式神选择对话框 -->
    <ShikigamiSelect
        :showSelectShikigami="showShikigamiDialog"
        :currentShikigami="currentShikigami"
        @closeSelectShikigami="closeDialogForType('shikigami')"
        @updateShikigami="data => updateNodeData('shikigami', data)"
    />

    <!-- 全局御魂选择对话框 -->
    <YuhunSelect
        :showSelectYuhun="showYuhunDialog"
        :currentYuhun="currentYuhun"
        @closeSelectYuhun="closeDialogForType('yuhun')"
        @updateYuhun="data => updateNodeData('yuhun', data)"
    />

    <!-- 全局属性选择对话框 -->
    <PropertySelect
        :showPropertySelect="showPropertyDialog"
        :currentProperty="currentProperty"
        @closePropertySelect="closeDialogForType('property')"
        @updateProperty="data => updateNodeData('property', data)"
    />
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
}
</style>



