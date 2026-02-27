<script setup lang="ts">
import { reactive, watch } from 'vue';
import { getLogicFlowInstance } from '@/ts/useLogicFlow';
import {
  DEFAULT_GROUP_RULE_SCOPE,
  GROUP_META_VERSION,
  normalizeDynamicGroupMeta
} from '@/utils/graphSchema';

const props = defineProps<{
  node: any;
}>();

type DynamicGroupMeta = {
  groupKind: 'team' | 'shikigami';
  groupName: string;
  ruleEnabled: boolean;
  ruleScope: string[];
};

const DEFAULT_SCOPE_OPTIONS = [
  { value: 'shikigami-yuhun', label: '式神-御魂关系' },
  { value: 'shikigami-shikigami', label: '式神-式神关系' }
];

const form = reactive<DynamicGroupMeta>({
  groupKind: 'team',
  groupName: '',
  ruleEnabled: true,
  ruleScope: [...DEFAULT_GROUP_RULE_SCOPE]
});

const normalizeRuleScope = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [...DEFAULT_GROUP_RULE_SCOPE];
  }
  const normalized = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => !!item);
  return normalized.length ? normalized : [...DEFAULT_GROUP_RULE_SCOPE];
};

const syncFromNode = (node?: any) => {
  if (!node) return;
  const groupMeta = normalizeDynamicGroupMeta(node.properties?.groupMeta);
  form.groupKind = groupMeta.groupKind;
  form.groupName = groupMeta.groupName;
  form.ruleEnabled = groupMeta.ruleEnabled;
  form.ruleScope = normalizeRuleScope(groupMeta.ruleScope);
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
      groupName: form.groupName.trim(),
      ruleEnabled: form.ruleEnabled,
      ruleScope: normalizeRuleScope(form.ruleScope)
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
      <div class="property-label">分组名称</div>
      <el-input
        v-model="form.groupName"
        placeholder="例如：队伍1、PVP阵容A"
        clearable
        @change="applyGroupMeta"
      />
    </div>

    <div class="property-item">
      <div class="property-label">启用规则检查</div>
      <el-switch v-model="form.ruleEnabled" @change="applyGroupMeta" />
    </div>

    <div class="property-item">
      <div class="property-label">规则范围</div>
      <el-select
        v-model="form.ruleScope"
        multiple
        filterable
        allow-create
        default-first-option
        style="width: 100%"
        placeholder="选择或输入规则范围"
        @change="applyGroupMeta"
      >
        <el-option
          v-for="option in DEFAULT_SCOPE_OPTIONS"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <div class="property-tip">可扩展：后续新增规则域时可直接添加 scope。</div>
    </div>
  </div>
</template>

<style scoped>
.property-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
}
</style>
