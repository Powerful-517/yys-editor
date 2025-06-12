<script setup lang="ts">
import {ref, onMounted, onUnmounted, watch} from 'vue';
import {Handle, Position, useVueFlow} from '@vue-flow/core';
import {NodeResizer} from '@vue-flow/node-resizer'
import '@vue-flow/node-resizer/dist/style.css';

const props = defineProps({
  data: Object,
  id: String,
  selected: Boolean
});

// 获取Vue Flow的实例和节点更新方法
const {findNode, updateNode} = useVueFlow();

// 御魂信息保存在节点数据中
const currentYuhun = ref({name: '未选择御魂', avatar: '', type: ''});

// 节点尺寸
const nodeWidth = ref(180);
const nodeHeight = ref(180);

// 监听props.data的变化
watch(() => props.data, (newData) => {
  if (newData && newData.yuhun) {
    currentYuhun.value = newData.yuhun;
  }
}, {immediate: true});

// 更新御魂信息的方法（将由App.vue调用）
const updateNodeYuhun = (yuhun) => {
  currentYuhun.value = yuhun;
};

// 备用方案：通过全局事件总线监听更新
const handleYuhunUpdate = (event) => {
  const {nodeId, yuhun} = event.detail;
  if (nodeId === props.id) {
    updateNodeYuhun(yuhun);
  }
};

// 处理调整大小
const handleResize = (event, {width, height}) => {
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
    <NodeResizer
        v-if="selected"
        :min-width="150"
        :min-height="150"
        :max-width="300"
        :max-height="300"
    />

    <Handle type="target" :position="Position.Left" :id="`${id}-target`" />

    <div class="node-content">
        <img 
            v-if="currentYuhun.avatar" 
            :src="currentYuhun.avatar" 
            :alt="currentYuhun.name"
            class="yuhun-image"
        />
        <div v-else class="placeholder-text">点击选择御魂</div>
        <div class="name-text">{{ currentYuhun.name }}</div>
        <div v-if="currentYuhun.type" class="type-text">{{ currentYuhun.type }}</div>
    </div>

    <Handle type="source" :position="Position.Right" :id="`${id}-source`" />
</template>

<style scoped>
.node-content {
    width: 100%;
    height: 100%;
    min-width: 180px;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.yuhun-image {
    width: 85%;
    height: 85%;
    object-fit: cover;
}

.placeholder-text {
    color: #909399;
    font-size: 12px;
}

.name-text {
    font-size: 14px;
    text-align: center;
    margin-top: 8px;
}

.type-text {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
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
    width: 8px;
    height: 8px;
    background-color: #409EFF;
    border-radius: 50%;
    pointer-events: all;
}
</style>
