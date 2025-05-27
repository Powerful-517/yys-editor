<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Handle, Position, useVueFlow } from '@vue-flow/core';
import { NodeResizer } from '@vue-flow/node-resizer'
import '@vue-flow/node-resizer/dist/style.css';

const props = defineProps({
  data: Object,
  id: String,
  selected: Boolean
});

// 获取Vue Flow的实例和节点更新方法
const { findNode, updateNode } = useVueFlow();

// 属性信息保存在节点数据中
const currentProperty = ref({ 
  type: '未选择', 
  value: 0,
  valueType: '',
  priority: '可选',
  levelRequired: "40",
  skillRequiredMode: "all",
  skillRequired: ["5", "5", "5"],
  yuhun: {
    yuhunSetEffect: [],
    target: "1",
    property2: ["Attack"],
    property4: ["Attack"],
    property6: ["Crit", "CritDamage"],
  },
  expectedDamage: 0,
  survivalRate: 50,
  damageType: "balanced",
  description: '',
});

// 节点尺寸
const nodeWidth = ref(180);
const nodeHeight = ref(180);

// 监听props.data的变化
watch(() => props.data, (newData) => {
  if (newData && newData.property) {
    currentProperty.value = newData.property;
  }
}, { immediate: true });

// 更新属性信息的方法（将由App.vue调用）
const updateNodeProperty = (property) => {
  currentProperty.value = property;
};

// 备用方案：通过全局事件总线监听更新
const handlePropertyUpdate = (event) => {
  const { nodeId, property } = event.detail;
  if (nodeId === props.id) {
    updateNodeProperty(property);
  }
};

onMounted(() => {
  console.log('PropertySelectNode mounted:', props.id);
  // 添加全局事件监听
  window.addEventListener('update-property', handlePropertyUpdate);
  
  // 初始化时检查是否有数据
  if (props.data && props.data.property) {
    currentProperty.value = props.data.property;
  }
});

onUnmounted(() => {
  // 移除全局事件监听器
  window.removeEventListener('update-property', handlePropertyUpdate);
});

// 获取属性类型显示名称
const getPropertyTypeName = () => {
  const typeMap = {
    'attack': '攻击',
    'health': '生命',
    'defense': '防御',
    'speed': '速度',
    'crit': '暴击率',
    'critDmg': '暴击伤害',
    'effectHit': '效果命中',
    'effectResist': '效果抵抗',
    '未选择': '未选择'
  };
  
  return typeMap[currentProperty.value.type] || currentProperty.value.type;
};

// 获取优先级显示名称
const getPriorityName = () => {
  const priorityMap = {
    'required': '必须',
    'recommended': '推荐',
    'optional': '可选'
  };
  
  return priorityMap[currentProperty.value.priority] || currentProperty.value.priority;
};

// 获取格式化的属性值显示
const getFormattedValue = () => {
  const type = currentProperty.value.type;
  
  if (type === '未选择') return '';
  
  // 根据属性类型获取相应的值
  let value = 0;
  let isPercentage = false;
  
  switch (type) {
    case 'attack':
      value = currentProperty.value.attackValue || 0;
      isPercentage = currentProperty.value.attackType === 'percentage';
      break;
    case 'health':
      value = currentProperty.value.healthValue || 0;
      isPercentage = currentProperty.value.healthType === 'percentage';
      break;
    case 'defense':
      value = currentProperty.value.defenseValue || 0;
      isPercentage = currentProperty.value.defenseType === 'percentage';
      break;
    case 'speed':
      value = currentProperty.value.speedValue || 0;
      break;
    case 'crit':
      value = currentProperty.value.critRate || 0;
      isPercentage = true;
      break;
    case 'critDmg':
      value = currentProperty.value.critDmg || 0;
      isPercentage = true;
      break;
    case 'effectHit':
      value = currentProperty.value.effectHitValue || 0;
      isPercentage = true;
      break;
    case 'effectResist':
      value = currentProperty.value.effectResistValue || 0;
      isPercentage = true;
      break;
  }
  
  return isPercentage ? `${value}%` : value.toString();
};

// 获取式神技能要求显示
const getSkillRequirementText = () => {
  const mode = currentProperty.value.skillRequiredMode;
  if (mode === 'all') {
    return '技能: 全满';
  } else if (mode === '111') {
    return '技能: 111';
  } else if (mode === 'custom') {
    return `技能: ${currentProperty.value.skillRequired.join('/')}`;
  }
  return '';
};

// 获取御魂套装信息
const getYuhunSetInfo = () => {
  const sets = currentProperty.value.yuhun?.yuhunSetEffect;
  if (!sets || sets.length === 0) return '';
  
  return `御魂: ${sets.length}套`;
};

// 获取显示的等级信息
const getLevelText = () => {
  const level = currentProperty.value.levelRequired;
  return level === '0' ? '等级: 献祭' : `等级: ${level}`;
};

// 处理调整大小
const handleResize = (event, { width, height }) => {
  // 更新本地状态
  nodeWidth.value = width;
  nodeHeight.value = height;
  
  // 更新Vue Flow中的节点
  const node = findNode(props.id);
  if (node) {
    const updatedNode = {
      ...node,
      style: {
        ...node.style,
        width: `${width}px`,
        height: `${height}px`
      }
    };
    updateNode(props.id, updatedNode);
  }
};

// 导出方法，使父组件可以调用
defineExpose({
  updateNodeProperty
});
</script>

<template>
  <NodeResizer
      v-if="selected"
      :min-width="150"
      :min-height="150"
      :max-width="300"
      :max-height="300"
  />
  <div class="property-node" :class="[currentProperty.priority ? `priority-${currentProperty.priority}` : '']" >
    <!-- 输入连接点 -->
    <Handle type="target" position="left" :id="`${id}-target`" />
    
    <div class="node-content">
      <div class="node-header">
        <div class="node-title">属性要求</div>
      </div>
      
      <div class="node-body">
        <div class="property-main">
          <div class="property-type">{{ getPropertyTypeName() }}</div>
          <div v-if="currentProperty.type !== '未选择'" class="property-value">{{ getFormattedValue() }}</div>
          <div v-else class="property-placeholder">点击设置属性</div>
        </div>
        
        <div class="property-details" v-if="currentProperty.type !== '未选择'">
          <div class="property-priority">优先级: {{ getPriorityName() }}</div>
          
          <!-- 额外信息展示 -->
          <div class="property-extra-info" v-if="currentProperty.levelRequired">
            <div>{{ getLevelText() }}</div>
            <div>{{ getSkillRequirementText() }}</div>
            <div>{{ getYuhunSetInfo() }}</div>
          </div>

          <div class="property-description" v-if="currentProperty.description">
            {{ currentProperty.description }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 输出连接点 -->
    <Handle type="source" position="right" :id="`${id}-source`" />
  </div>
</template>

<style scoped>
.property-node {
  position: relative;
  width: 100%;
  height: 100%;
  min-width: 180px;
  min-height: 180px;
}

.node-content {
  position: relative;
  background-color: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0;
  cursor: pointer;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  height: 100%;

  min-width: 180px;
  min-height: 180px;
}

:deep(.vue-flow__node-resizer) {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

:deep(.vue-flow__node-resizer-handle) {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #409EFF;
  border: 1px solid white;
  border-radius: 50%;
  pointer-events: all;
}

:deep(.vue-flow__node-resizer-handle.top-left) {
  top: -4px;
  left: -4px;
  cursor: nwse-resize;
}

:deep(.vue-flow__node-resizer-handle.top-right) {
  top: -4px;
  right: -4px;
  cursor: nesw-resize;
}

:deep(.vue-flow__node-resizer-handle.bottom-left) {
  bottom: -4px;
  left: -4px;
  cursor: nesw-resize;
}

:deep(.vue-flow__node-resizer-handle.bottom-right) {
  bottom: -4px;
  right: -4px;
  cursor: nwse-resize;
}

.priority-required {
  border: 2px solid #f56c6c;
}

.priority-recommended {
  border: 2px solid #67c23a;
}

.priority-optional {
  border: 1px solid #dcdfe6;
}

.node-header {
  padding: 8px 10px;
  background-color: #f0f7ff;
  border-bottom: 1px solid #dcdfe6;
  border-radius: 4px 4px 0 0;
}

.node-title {
  font-weight: bold;
  font-size: 14px;
}

.node-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.property-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}

.property-type {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.property-value {
  font-size: 16px;
  color: #409eff;
  font-weight: bold;
  margin-bottom: 5px;
}

.property-placeholder {
  width: 120px;
  height: 40px;
  border: 1px dashed #c0c4cc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  border-radius: 4px;
  margin: 8px 0;
  transition: width 0.2s, height 0.2s;
}

.property-details {
  width: 100%;
  border-top: 1px dashed #ebeef5;
  padding-top: 8px;
}

.property-priority {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}

.property-extra-info {
  font-size: 11px;
  color: #909399;
  margin-bottom: 5px;
}

.property-extra-info > div {
  margin-bottom: 2px;
}

.property-description {
  font-size: 11px;
  color: #606266;
  margin-top: 5px;
  border-top: 1px dashed #ebeef5;
  padding-top: 5px;
  word-break: break-all;
}
</style> 