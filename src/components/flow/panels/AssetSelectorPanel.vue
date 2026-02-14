<script setup lang="ts">
import { computed } from 'vue';
import { useDialogs } from '@/ts/useDialogs';
import { getLogicFlowInstance } from '@/ts/useLogicFlow';
import { SELECTOR_PRESETS } from '@/configs/selectorPresets';

const props = defineProps<{
  node: any;
}>();

const { openGenericSelector } = useDialogs();

// 当前选中的资产库
const currentLibrary = computed(() => props.node.properties?.assetLibrary || 'shikigami');

// 当前选中的资产
const currentAsset = computed(() => {
  return props.node.properties?.selectedAsset || { name: '未选择' };
});

// 打开选择器
const handleOpenSelector = () => {
  const lf = getLogicFlowInstance();
  const node = props.node;
  if (!lf || !node) return;

  const library = currentLibrary.value;
  const config = SELECTOR_PRESETS[library];

  if (!config) {
    console.error('未找到资产库配置:', library);
    return;
  }

  // 设置当前选中项
  config.currentItem = node.properties?.selectedAsset;

  openGenericSelector(config, (selectedItem) => {
    lf.setProperties(node.id, {
      ...node.properties,
      selectedAsset: selectedItem,
      assetLibrary: library
    });
  });
};
</script>

<template>
  <div class="property-section">
    <div class="section-header">资产属性</div>

    <div class="property-item">
      <div class="property-label">当前选择</div>
      <span>{{ currentAsset.name }}</span>
      <el-button type="primary" @click="handleOpenSelector" style="width: 100%; margin-top: 8px">
        选择资产
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.property-section {
  padding: 12px;
}

.section-header {
  font-weight: bold;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.property-item {
  margin-bottom: 16px;
}

.property-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}
</style>
