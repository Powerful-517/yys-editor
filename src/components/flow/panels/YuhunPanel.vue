<script setup lang="ts">
import { useDialogs } from '@/ts/useDialogs';
import { getLogicFlowInstance } from '@/ts/useLogicFlow';

const props = defineProps<{
  node: any;
}>();

const { openDialog } = useDialogs();

const handleOpenDialog = () => {
  const lf = getLogicFlowInstance();
  const node = props.node;
  if (!lf || !node) return;

  const currentData = node.properties?.yuhun;
  openDialog('yuhun', currentData, node, (updatedData) => {
    lf.setProperties(node.id, {
      ...node.properties,
      yuhun: updatedData
    });
  });
};
</script>

<template>
  <div class="property-section">
    <div class="section-header">御魂属性</div>
    <div class="property-item">
      <el-button type="primary" @click="handleOpenDialog" style="width: 100%">选择御魂</el-button>
    </div>
  </div>
</template>
