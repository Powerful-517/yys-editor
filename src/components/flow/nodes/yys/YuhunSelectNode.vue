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

// 御魂信息保存在节点数据中
const currentYuhun = ref({ name: '未选择御魂', avatar: '', type: '' });

// 节点尺寸
const nodeWidth = ref(180);
const nodeHeight = ref(180);

// 监听props.data的变化
watch(() => props.data, (newData) => {
  if (newData && newData.yuhun) {
    currentYuhun.value = newData.yuhun;
  }
}, { immediate: true });

// 更新御魂信息的方法（将由App.vue调用）
const updateNodeYuhun = (yuhun) => {
  currentYuhun.value = yuhun;
};

// 备用方案：通过全局事件总线监听更新
const handleYuhunUpdate = (event) => {
  const { nodeId, yuhun } = event.detail;
  if (nodeId === props.id) {
    updateNodeYuhun(yuhun);
  }
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

onMounted(() => {
  console.log('YuhunSelectNode mounted:', props.id);
  // 添加全局事件监听
  window.addEventListener('update-yuhun', handleYuhunUpdate);
  
  // 初始化时检查是否有数据
  if (props.data && props.data.yuhun) {
    currentYuhun.value = props.data.yuhun;
  }
});

onUnmounted(() => {
  // 移除全局事件监听器
  window.removeEventListener('update-yuhun', handleYuhunUpdate);
});

// 导出方法，使父组件可以调用
defineExpose({
  updateNodeYuhun
});
</script>

<template>
  <div class="yuhun-node" :style="{ width: `${nodeWidth}px`, height: `${nodeHeight}px` }">
    <NodeResizer 
      v-if="selected"
      :min-width="150"
      :min-height="150"
      :max-width="300"
      :max-height="300"
    />
    
    <!-- 输入连接点 -->
    <Handle type="target" position="left" :id="`${id}-target`" />
    
    <div class="node-content">
      <div class="node-header">
        <div class="node-title">御魂选择</div>
      </div>
      
      <div class="node-body">
        <div v-if="currentYuhun.avatar" class="yuhun-avatar">
          <img :src="currentYuhun.avatar" alt="御魂图片" />
        </div>
        <div v-else class="yuhun-placeholder">
          点击选择御魂
        </div>
        <div class="yuhun-name">{{ currentYuhun.name }}</div>
        <div v-if="currentYuhun.type" class="yuhun-type">{{ currentYuhun.type }}</div>
      </div>
    </div>
    
    <!-- 输出连接点 -->
    <Handle type="source" position="right" :id="`${id}-source`" />
  </div>
</template>

<style scoped>
.node-content {
  background-color: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 0;
  cursor: pointer;
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

.yuhun-avatar {
  width: 80px;
  height: 80px;
  margin-bottom: 8px;
  transition: width 0.2s, height 0.2s;
}

.yuhun-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.yuhun-placeholder {
  width: 80px;
  height: 80px;
  border: 1px dashed #c0c4cc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  border-radius: 4px;
  margin-bottom: 8px;
  transition: width 0.2s, height 0.2s;
}

.yuhun-name {
  font-size: 14px;
  margin-top: 5px;
}

.yuhun-type {
  font-size: 12px;
  color: #909399;
  margin-top: 3px;
}
</style>
