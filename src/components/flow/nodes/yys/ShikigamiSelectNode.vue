<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Handle, Position, useVueFlow } from '@vue-flow/core';
import { NodeResizer } from '@vue-flow/node-resizer';
import '@vue-flow/node-resizer/dist/style.css';

const props = defineProps({
  data: Object,
  id: String,
  selected: Boolean
});

// 获取Vue Flow的实例和节点更新方法
const { findNode, updateNode } = useVueFlow();

// 式神信息保存在节点数据中
const currentShikigami = ref({ name: '未选择式神', avatar: '', rarity: '' });

// 节点尺寸
const nodeWidth = ref(180);
const nodeHeight = ref(180);

// 监听props.data的变化
watch(() => props.data, (newData) => {
  if (newData && newData.shikigami) {
    currentShikigami.value = newData.shikigami;
  }
}, { immediate: true });

// 更新式神信息的方法（将由App.vue调用）
const updateNodeShikigami = (shikigami) => {
  currentShikigami.value = shikigami;
};

// 备用方案：通过全局事件总线监听更新
const handleShikigamiUpdate = (event) => {
  const { nodeId, shikigami } = event.detail;
  if (nodeId === props.id) {
    updateNodeShikigami(shikigami);
  }
};

onMounted(() => {
  console.log('ShikigamiSelectNode mounted:', props.id);
  // 添加全局事件监听
  window.addEventListener('update-shikigami', handleShikigamiUpdate);

  // 初始化时检查是否有数据
  if (props.data && props.data.shikigami) {
    currentShikigami.value = props.data.shikigami;
  }
});

onUnmounted(() => {
  // 移除全局事件监听器
  window.removeEventListener('update-shikigami', handleShikigamiUpdate);
});

// 导出方法，使父组件可以调用
defineExpose({
  updateNodeShikigami
});

// Add Position enum usage to fix type error
const position = Position;
</script>

<template>
    <NodeResizer
        v-if="selected"
    />

    <Handle type="target" :position="position.Left" :id="`${id}-target`" />

    <div class="node-content">
        <img 
            v-if="currentShikigami.avatar" 
            :src="currentShikigami.avatar" 
            :alt="currentShikigami.name"
            class="shikigami-image"
        />
        <div v-else class="placeholder-text">点击选择式神</div>
        <div class="name-text">{{ currentShikigami.name }}</div>
    </div>

    <Handle type="source" :position="position.Right" :id="`${id}-source`" />
</template>

<style scoped>
.node-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.shikigami-image {
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