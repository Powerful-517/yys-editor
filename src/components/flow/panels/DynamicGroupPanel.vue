<script setup lang="ts">
import { reactive, watch } from 'vue';
import { getLogicFlowInstance } from '@/ts/useLogicFlow';
import {
  GROUP_META_VERSION,
  normalizeDynamicGroupMeta
} from '@/utils/graphSchema';

const props = defineProps<{
  node: any;
}>();

type DynamicGroupMeta = {
  groupKind: 'team' | 'shikigami';
  ruleEnabled: boolean;
};

const form = reactive<DynamicGroupMeta>({
  groupKind: 'team',
  ruleEnabled: true
});

const syncFromNode = (node?: any) => {
  if (!node) return;
  const groupMeta = normalizeDynamicGroupMeta(node.properties?.groupMeta);
  form.groupKind = groupMeta.groupKind;
  form.ruleEnabled = groupMeta.ruleEnabled;
};

watch(
  () => props.node,
  (node) => {
    if (node) {
      syncFromNode(node);
    }
  },
  { immediate: true, deep: true }
);

const applyGroupMeta = () => {
  const lf = getLogicFlowInstance();
  const node = props.node;
  if (!lf || !node) return;

  lf.setProperties(node.id, {
    ...(node.properties || {}),
    groupMeta: {
      version: GROUP_META_VERSION,
      groupKind: form.groupKind,
      ruleEnabled: form.ruleEnabled
    }
  });
};
</script>

<template>
  <div class="property-section">
    <div class="section-header">分组规则属性</div>

    <div class="property-item">
      <div class="property-label">分组类型</div>
      <el-select v-model="form.groupKind" style="width: 100%" @change="applyGroupMeta">
        <el-option label="队伍组（team）" value="team" />
        <el-option label="式神组（shikigami）" value="shikigami" />
      </el-select>
    </div>

    <div class="property-item">
      <div class="property-label">启用规则检查</div>
      <el-switch v-model="form.ruleEnabled" @change="applyGroupMeta" />
    </div>
  </div>
</template>

<style scoped>
</style>
