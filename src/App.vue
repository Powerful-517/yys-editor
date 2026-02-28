<script setup lang="ts">
import Toolbar from './components/Toolbar.vue';
import ProjectExplorer from './components/ProjectExplorer.vue';
import ComponentsPanel from './components/flow/ComponentsPanel.vue';
import { onMounted, reactive, watch } from 'vue';
import {useFilesStore} from "@/ts/useStore";
import Vue3DraggableResizable from 'vue3-draggable-resizable';
import {TabPaneName, TabsPaneContext} from "element-plus";
import FlowEditor from './components/flow/FlowEditor.vue';
import ShikigamiSelect from './components/flow/nodes/yys/ShikigamiSelect.vue';
import YuhunSelect from './components/flow/nodes/yys/YuhunSelect.vue';
import PropertySelect from './components/flow/nodes/yys/PropertySelect.vue';
import DialogManager from './components/DialogManager.vue';
import {getLogicFlowInstance} from "@/ts/useLogicFlow";
import { migrateGraphData, needsMigration } from '@/utils/nodeMigration';
import { useGlobalMessage } from '@/ts/useGlobalMessage';

const filesStore = useFilesStore();
const { showMessage } = useGlobalMessage();

const normalizeGraphData = (data: any) => {
  if (data && Array.isArray((data as any).nodes) && Array.isArray((data as any).edges)) {
    // 应用数据迁移
    const { graphData: migratedData, migratedCount, migrations } = migrateGraphData(data);

    // 如果有迁移，显示提示信息
    if (migratedCount > 0) {
      console.log(`[数据迁移] 迁移了 ${migratedCount} 个节点:`, migrations);
      showMessage('info', `已自动升级 ${migratedCount} 个节点到新版本`);
    }

    // 清理节点数据，移除可能导致 Label 插件出错的空 _label 数组
    const cleanedData = {
      ...migratedData,
      nodes: migratedData.nodes.map((node: any) => {
        const cleanedNode = { ...node };
        if (cleanedNode.properties && Array.isArray(cleanedNode.properties._label) && cleanedNode.properties._label.length === 0) {
          delete cleanedNode.properties._label;
        }
        return cleanedNode;
      })
    };
    return cleanedData;
  }
  return { nodes: [], edges: [] };
};

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
          const graphData = normalizeGraphData(currentTab.graphRawData);
          logicFlowInstance.render(graphData);

          // 渲染后立即恢复 zIndex
          if (graphData.nodes) {
            graphData.nodes.forEach((nodeData: any) => {
              if (nodeData.zIndex !== undefined) {
                const model = logicFlowInstance.getNodeModelById(nodeData.id);
                if (model) {
                  model.setZIndex(nodeData.zIndex);
                }
              }
            });
          }

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
        const graphData = normalizeGraphData(currentTab.graphRawData);
        logicFlowInstance.render(graphData);

        // 渲染后立即恢复 zIndex
        if (graphData.nodes) {
          graphData.nodes.forEach((nodeData: any) => {
            if (nodeData.zIndex !== undefined) {
              const model = logicFlowInstance.getNodeModelById(nodeData.id);
              if (model) {
                console.log(`[导入数据] 恢复节点 ${nodeData.id} 的 zIndex: ${nodeData.zIndex}`);
                model.setZIndex(nodeData.zIndex);
              }
            }
          });
        }

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
        <div id="main-container">
          <FlowEditor
              height="100%"
              :enable-label="false"
          />
        </div>
      </div>
    </div>
    <DialogManager/>
  </div>
</template>

<style scoped>
:global(html),
:global(body),
:global(#app) {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.toolbar {
  height: 48px; /* 与 toolbarHeight 一致 */
  flex-shrink: 0; /* 防止 Toolbar 被压缩 */
  background-color: #fff; /* 添加背景色以便观察 */
  z-index: 1; /* 确保 Toolbar 在上层 */
}

.main-content {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding-top: 48px; /* toolbar 为 fixed，需要预留顶部空间 */
  box-sizing: border-box;
}

.sidebar {
  width: 230px; /* 侧边栏宽度 */
  background-color: #f0f0f0; /* 背景色 */
  flex-shrink: 0; /* 防止侧边栏被压缩 */
  overflow-y: auto; /* 允许侧边栏内容滚动 */
}

.workspace {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

#main-container {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.main-content :deep(.components-panel) {
  height: 100%;
  min-height: 0;
  margin-bottom: 0;
  overflow-y: auto;
}

.main-content :deep(.property-panel) {
  height: 100% !important;
  min-height: 0;
  overflow-y: auto;
}
</style>



