<script setup lang="ts">
import { ref } from 'vue';
import ShikigamiSelect from './nodes/yys/ShikigamiSelect.vue';

// 定义组件分组
const baseComponents = [
  {
    id: 'rect',
    name: '长方形',
    type: 'rect',
    description: '基础长方形节点'
  },
  {
    id: 'ellipse',
    name: '圆形',
    type: 'ellipse',
    description: '基础圆形节点'
  },
  {
    id: 'image',
    name: '图片',
    type: 'imageNode',
    description: '可上传图片的节点'
  },
  {
    id: 'text',
    name: '文字编辑框',
    type: 'textNode',
    description: '可编辑富文本的节点'
  }
  // 可继续添加其他基础图形
];

const yysComponents = [
  {
    id: 'shikigami-select',
    name: '式神选择器',
    type: 'shikigamiSelect',
    description: '用于选择式神的组件'
  },
  {
    id: 'yuhun-select',
    name: '御魂选择器',
    type: 'yuhunSelect',
    description: '用于选择御魂的组件'
  },
  {
    id: 'property-select',
    name: '属性选择器',
    type: 'propertySelect',
    description: '用于设置属性要求的组件'
  }
];

const emit = defineEmits(['add-node']);

// 处理拖拽开始
const handleDragStart = (event, component) => {
  // 设置拖拽数据
  event.dataTransfer.setData('application/json', JSON.stringify({
    id: `${component.type}-${Date.now()}`,
    type: component.type,
    label: component.name,
    data: { componentType: component.type }
  }));
  
  // 设置拖拽效果
  event.dataTransfer.effectAllowed = 'copy';
};

// 处理组件点击
const handleComponentClick = (component) => {
  // 生成唯一ID
  const nodeId = `${component.type}-${Date.now()}`;
  
  // 创建新节点
  const newNode = {
    id: nodeId,
    type: component.type,
    label: component.name,
    position: { x: 100, y: 100 }, // 默认位置
    data: { componentType: component.type }
  };
  
  // 发出添加节点事件
  emit('add-node', newNode);
};
</script>

<template>
  <div class="components-panel">
    <h3>组件库</h3>
    <div class="components-group">
      <div class="group-title">基础组件</div>
      <div class="components-list">
        <div 
          v-for="component in baseComponents" 
          :key="component.id" 
          class="component-item"
          @click="handleComponentClick(component)"
          draggable="true"
          @dragstart="handleDragStart($event, component)"
        >
          <div class="component-icon">
            <i class="el-icon-plus"></i>
          </div>
          <div class="component-info">
            <div class="component-name">{{ component.name }}</div>
            <div class="component-desc">{{ component.description }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="components-group">
      <div class="group-title">阴阳师</div>
      <div class="components-list">
        <div 
          v-for="component in yysComponents" 
          :key="component.id" 
          class="component-item"
          @click="handleComponentClick(component)"
          draggable="true"
          @dragstart="handleDragStart($event, component)"
        >
          <div class="component-icon">
            <i class="el-icon-plus"></i>
          </div>
          <div class="component-info">
            <div class="component-name">{{ component.name }}</div>
            <div class="component-desc">{{ component.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.components-panel {
  padding: 10px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 10px;
}

.components-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.component-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  background-color: white;
  transition: all 0.3s;
}

.component-item:hover {
  background-color: #f2f6fc;
  border-color: #c6e2ff;
}

.component-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ecf5ff;
  border-radius: 4px;
  margin-right: 10px;
}

.component-info {
  flex: 1;
}

.component-name {
  font-weight: bold;
  margin-bottom: 4px;
}

.component-desc {
  font-size: 12px;
  color: #909399;
}

.components-group {
  margin-bottom: 18px;
}
.group-title {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 6px;
  color: #333;
}
</style> 