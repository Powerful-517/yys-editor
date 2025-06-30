<script setup lang="ts">
import { ref } from 'vue';
import useDragAndDrop from '@/ts/useDnD';

const { onDragStart } = useDragAndDrop();

// 使用嵌套结构定义组件分组
const componentGroups = [
  {
    id: 'basic',
    title: '基础组件',
    components: [
      {
        id: 'rect',
        name: '长方形',
        type: 'rect',
        description: '基础长方形节点',
        data: {
          width: 150,
          height: 150,
          style: { background: '#fff', border: '2px solid black' }
        }
      },
      {
        id: 'ellipse',
        name: '圆形',
        type: 'ellipse',
        description: '基础圆形节点',
        data: {
          width: 150,
          height: 150,
          style: { background: '#fff', border: '2px solid black', borderRadius: '50%' }
        }
      },
      {
        id: 'image',
        name: '图片',
        type: 'imageNode',
        description: '可上传图片的节点',
        data: {
          url: '',
          width: 180,
          height: 120
        }
      },
      {
        id: 'text',
        name: '文字编辑框',
        type: 'textNode',
        description: '可编辑富文本的节点',
        data: {
          html: '<div>双击右侧可编辑文字</div>',
          width: 200,
          height: 120
        }
      }
    ]
  },
  {
    id: 'yys',
    title: '阴阳师',
    components: [
      {
        id: 'shikigami-select',
        name: '式神选择器',
        type: 'shikigamiSelect',
        description: '用于选择式神的组件',
        data: {
          shikigami: { name: '未选择式神', avatar: '', rarity: '' }
        }
      },
      {
        id: 'yuhun-select',
        name: '御魂选择器',
        type: 'yuhunSelect',
        description: '用于选择御魂的组件',
        data: {
          yuhun: { name: '未选择御魂', avatar: '', type: '' }
        }
      },
      {
        id: 'property-select',
        name: '属性选择器',
        type: 'propertySelect',
        description: '用于设置属性要求的组件',
        data: {
          property: {
            type: '未选择',
            priority: 'optional',
            description: '',
            value: 0,
            valueType: '',
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
            damageType: "balanced"
          }
        }
      }
    ]
  }
  // 可以轻松添加新的游戏组件组
  // {
  //   id: 'other-game',
  //   title: '其他游戏',
  //   components: []
  // }
];

// 处理组件点击 - 直接使用 onDragStart 的数据格式
const handleComponentClick = (component) => {
  const nodeData = {
    type: component.type,
    label: component.name,
    position: { x: 100, y: 100 },
    data: component.data
  };
  
  onDragStart({ dataTransfer: { setData: () => {} } } as DragEvent, nodeData);
};
</script>

<template>
  <div class="components-panel">
    <h3>组件库</h3>
    <!-- 使用两层遍历生成界面元素 -->
    <div 
      v-for="group in componentGroups" 
      :key="group.id"
      class="components-group"
    >
      <div class="group-title">{{ group.title }}</div>
      <div class="components-list">
        <div 
          v-for="component in group.components" 
          :key="component.id" 
          class="component-item"
          @click="handleComponentClick(component)"
          draggable="true"
          @dragstart="(e) => onDragStart(e, {
            type: component.type,
            label: component.name,
            data: component.data
          })"
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
  width: 200px;
  display: flex;
  flex-direction: column;
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