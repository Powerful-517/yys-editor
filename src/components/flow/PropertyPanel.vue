<script setup lang="ts">
import { computed } from 'vue';
import ShikigamiPanel from './panels/ShikigamiPanel.vue';
import YuhunPanel from './panels/YuhunPanel.vue';
import PropertyRulePanel from './panels/PropertyRulePanel.vue';
import ImagePanel from './panels/ImagePanel.vue';
import TextPanel from './panels/TextPanel.vue';

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

const panelMap: Record<string, any> = {
  shikigamiSelect: ShikigamiPanel,
  yuhunSelect: YuhunPanel,
  propertySelect: PropertyRulePanel,
  imageNode: ImagePanel,
  textNode: TextPanel
};

const panelComponent = computed(() => panelMap[nodeType.value] || null);
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

      <component v-if="panelComponent" :is="panelComponent" :node="selectedNode" />
      <div v-else class="property-section">
        <div class="section-header">暂无特定属性</div>
        <div class="property-item">
          <div class="property-value">当前节点类型无需额外配置。</div>
        </div>
      </div>
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
