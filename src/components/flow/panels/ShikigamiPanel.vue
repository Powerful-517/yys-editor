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

  const currentData = node.properties?.shikigami;
  openDialog('shikigami', currentData, node, (updatedData) => {
    lf.setProperties(node.id, {
      ...node.properties,
      shikigami: updatedData
    });
  });
};
</script>

<template>
  <div class="property-section">
    <div class="section-header">式神属性</div>
    <div class="property-item">
      <span>当前选择式神：{{ node.properties?.shikigami?.name || '未选择' }}</span>
      <el-button type="primary" @click="handleOpenDialog" style="width: 100%">选择式神</el-button>
    </div>
  </div>
</template>
