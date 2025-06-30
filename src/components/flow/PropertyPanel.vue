<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useVueFlow } from '@vue-flow/core';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { useDialogs } from '../../ts/useDialogs';

const props = defineProps({
  height: {
    type: String,
    default: '100%'
  }
});

// 使用VueFlow的store获取当前选中的节点
const { findNode, getNodes, updateNode } = useVueFlow();
const { openDialog } = useDialogs();

// getNodes是一个ref对象，而不是函数
const nodes = getNodes;

// 当前选中的节点
const selectedNode = ref(null);

// 监听节点变化
watch(nodes, (newNodes) => {
  // 查找选中的节点
  const selected = newNodes.find(node => node.selected);
  selectedNode.value = selected || null;
}, { deep: true });

// 计算属性：节点是否选中
const hasNodeSelected = computed(() => !!selectedNode.value);

// 计算属性：节点类型
const nodeType = computed(() => {
  if (!selectedNode.value) return '';
  return selectedNode.value.type || 'default';
});

// 通用的弹窗处理方法
const handleOpenDialog = (type: 'shikigami' | 'yuhun' | 'property') => {
  if (selectedNode.value) {
    const node = selectedNode.value;
    const currentData = node.data && node.data[type] ? node.data[type] : undefined;

    openDialog(
      type,
      currentData,
      node,
      (updatedData, nodeToUpdate) => {
        updateNode(nodeToUpdate.id, { data: { ...nodeToUpdate.data, [type]: updatedData } });
      }
    );
  }
};

const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    updateNodeData('url', evt.target.result);
  };
  reader.readAsDataURL(file);
};

const updateNodeData = (key, value) => {
  if (!selectedNode.value) return;
  const node = findNode(selectedNode.value.id);
  if (node) {
    node.data = { ...node.data, [key]: value };
  }
};

const quillToolbar = [
  [{ header: 1 }, { header: 2 }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'bullet' }, { list: 'ordered' }],
  [{ align: [] }],
  ['clean']
];
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
      
      <!-- 式神选择节点的特定属性 -->
      <div v-if="nodeType === 'shikigamiSelect'" class="property-section">
        <div class="section-header">式神属性</div>
        <div class="property-item">
          <el-button 
            type="primary" 
            @click="handleOpenDialog('shikigami')" 
            style="width: 100%"
          >
            选择式神
          </el-button>
        </div>
      </div>
      
      <!-- 御魂选择节点的特定属性 -->
      <div v-if="nodeType === 'yuhunSelect'" class="property-section">
        <div class="section-header">御魂属性</div>
        <div class="property-item">
          <el-button 
            type="primary" 
            @click="handleOpenDialog('yuhun')" 
            style="width: 100%"
          >
            选择御魂
          </el-button>
        </div>
      </div>
      
      <!-- 属性选择节点的特定属性 -->
      <div v-if="nodeType === 'propertySelect'" class="property-section">
        <div class="section-header">属性设置</div>
        <div class="property-item">
          <el-button 
            type="primary" 
            @click="handleOpenDialog('property')" 
            style="width: 100%"
          >
            设置属性
          </el-button>
        </div>
      </div>

      <!-- 图片节点属性 -->
      <div v-if="nodeType === 'imageNode'" class="property-section">
        <div class="section-header">图片设置</div>
        <div class="property-item">
          <input type="file" accept="image/*" @change="handleImageUpload" />
          <div v-if="selectedNode.data && selectedNode.data.url" style="margin-top:8px;">
            <img :src="selectedNode.data.url" alt="预览" style="max-width:100%;max-height:100px;" />
          </div>
        </div>
      </div>

      <!-- 文本节点属性 -->
      <div v-if="nodeType === 'textNode'" class="property-section">
        <div class="section-header">文本编辑</div>
        <div class="property-item">
          <QuillEditor
            v-model:content="selectedNode.data.html"
            contentType="html"
            :toolbar="quillToolbar"
            theme="snow"
            style="height:120px;"
            @update:content="val => updateNodeData('html', val)"
          />
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