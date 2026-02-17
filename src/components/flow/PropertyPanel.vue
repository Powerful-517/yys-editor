<script setup lang="ts">
import { computed, ref } from 'vue';
import PropertyRulePanel from './panels/PropertyRulePanel.vue';
import ImagePanel from './panels/ImagePanel.vue';
import TextPanel from './panels/TextPanel.vue';
import StylePanel from './panels/StylePanel.vue';
import AssetSelectorPanel from './panels/AssetSelectorPanel.vue';
import VectorPanel from './panels/VectorPanel.vue';
import { ASSET_LIBRARIES } from '@/types/nodeTypes';
import { getLogicFlowInstance } from '@/ts/useLogicFlow';

const props = defineProps({
  height: {
    type: String,
    default: '100%'
  },
  node: {
    type: Object,
    default: null
  }
});

const selectedNode = computed(() => props.node);
const hasNodeSelected = computed(() => !!selectedNode.value);

const nodeType = computed(() => {
  if (!selectedNode.value) return '';
  return selectedNode.value.type || 'default';
});

const activeTab = ref('game');

const panelMap: Record<string, any> = {
  propertySelect: PropertyRulePanel,
  imageNode: ImagePanel,
  textNode: TextPanel,
  assetSelector: AssetSelectorPanel,
  vectorNode: VectorPanel
};

const panelComponent = computed(() => panelMap[nodeType.value] || null);

// 判断是否支持节点类型切换（仅资产选择器节点支持）
const supportsTypeSwitch = computed(() => nodeType.value === 'assetSelector');

// 当前资产库类型
const currentAssetLibrary = computed({
  get: () => selectedNode.value?.properties?.assetLibrary || 'shikigami',
  set: (value) => {
    const lf = getLogicFlowInstance();
    if (!lf || !selectedNode.value) return;

    lf.setProperties(selectedNode.value.id, {
      ...selectedNode.value.properties,
      assetLibrary: value,
      selectedAsset: null // 切换类型时清空已选资产
    });
  }
});
</script>

<template>
  <div class="property-panel" :style="{ height }">
    <div class="panel-header">
      <h3>属性编辑</h3>
    </div>

    <div v-if="!hasNodeSelected" class="no-selection">
      <p>请选择一个节点以编辑其属性</p>
    </div>

    <div v-else class="property-content">
      <!-- Tab 切换 -->
      <el-tabs v-model="activeTab" class="property-tabs">
        <!-- 游戏属性 Tab -->
        <el-tab-pane label="游戏属性" name="game">
          <div class="property-section">
            <div class="section-header">基本信息</div>
            <div class="property-item">
              <div class="property-label">节点ID</div>
              <div class="property-value">{{ selectedNode.id }}</div>
            </div>
            <div class="property-item">
              <div class="property-label">节点类型</div>
              <div class="property-value">{{ nodeType }}</div>
            </div>
          </div>

          <!-- 节点类型切换（仅资产选择器支持） -->
          <div v-if="supportsTypeSwitch" class="property-section">
            <div class="section-header">节点类型</div>
            <div class="property-item">
              <div class="property-label">资产类型</div>
              <el-select v-model="currentAssetLibrary" placeholder="选择资产类型" style="width: 100%">
                <el-option
                  v-for="lib in ASSET_LIBRARIES"
                  :key="lib.id"
                  :label="lib.label"
                  :value="lib.id"
                />
              </el-select>
            </div>
          </div>

          <!-- 特定节点属性面板 -->
          <component v-if="panelComponent" :is="panelComponent" :node="selectedNode" />
          <div v-else class="property-section">
            <div class="section-header">暂无特定属性</div>
            <div class="property-item">
              <div class="property-value">当前节点类型无需额外配置。</div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 图像属性 Tab -->
        <el-tab-pane label="图像属性" name="style">
          <StylePanel :node="selectedNode" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.property-panel {
  background-color: #f5f7fa;
  border-left: 1px solid #e4e7ed;
  width: 280px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-header {
  padding: 10px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #e4e7ed;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
  padding: 20px;
  text-align: center;
}

.property-content {
  padding: 10px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.property-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.property-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
}

.property-section {
  margin-bottom: 20px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  overflow: hidden;
}

.section-header {
  font-weight: bold;
  padding: 10px;
  background-color: #ecf5ff;
  border-bottom: 1px solid #dcdfe6;
}

.property-item {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.property-item:last-child {
  border-bottom: none;
}

.property-label {
  font-size: 13px;
  color: #606266;
  margin-bottom: 5px;
}

.property-value {
  font-size: 14px;
  word-break: break-all;
}
</style>
