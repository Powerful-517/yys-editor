<template>
  <div class="test-page">
    <h1>YysEditorEmbed 测试页面</h1>

    <div class="test-section">
      <h2>测试 1：编辑模式</h2>
      <div class="controls">
        <button @click="testSave">测试保存</button>
        <button @click="testGetData">获取数据</button>
        <button @click="testSetData">设置数据</button>
      </div>
      <YysEditorEmbed
        ref="editorRef"
        mode="edit"
        :data="testData"
        :height="500"
        @save="handleSave"
        @cancel="handleCancel"
        @error="handleError"
      />
    </div>

    <div class="test-section">
      <h2>测试 2：预览模式</h2>
      <button @click="togglePreviewMode">切换到编辑模式</button>
      <YysEditorEmbed
        mode="preview"
        :data="testData"
        :height="400"
      />
    </div>

    <div class="test-section">
      <h2>测试 3：自定义配置</h2>
      <div class="controls">
        <label>
          <input type="checkbox" v-model="showToolbar" />
          显示工具栏
        </label>
        <label>
          <input type="checkbox" v-model="showComponentPanel" />
          显示组件库
        </label>
        <label>
          <input type="checkbox" v-model="showPropertyPanel" />
          显示属性面板
        </label>
      </div>
      <YysEditorEmbed
        mode="edit"
        :data="testData"
        :height="500"
        :show-toolbar="showToolbar"
        :show-component-panel="showComponentPanel"
        :show-property-panel="showPropertyPanel"
      />
    </div>

    <div class="test-section">
      <h2>数据输出</h2>
      <pre>{{ JSON.stringify(outputData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import YysEditorEmbed from '../src/YysEditorEmbed.vue'

const editorRef = ref()
const showToolbar = ref(true)
const showComponentPanel = ref(true)
const showPropertyPanel = ref(true)
const outputData = ref(null)

const testData = ref({
  nodes: [
    {
      id: 'node1',
      type: 'rect',
      x: 100,
      y: 100,
      text: { value: '测试节点 1' },
      properties: {
        width: 120,
        height: 60
      }
    },
    {
      id: 'node2',
      type: 'rect',
      x: 300,
      y: 100,
      text: { value: '测试节点 2' },
      properties: {
        width: 120,
        height: 60
      }
    }
  ],
  edges: [
    {
      id: 'edge1',
      type: 'polyline',
      sourceNodeId: 'node1',
      targetNodeId: 'node2'
    }
  ]
})

const handleSave = (data: any) => {
  console.log('保存数据:', data)
  outputData.value = data
  alert('数据已保存！查看控制台和下方输出。')
}

const handleCancel = () => {
  console.log('取消编辑')
  alert('已取消编辑')
}

const handleError = (error: Error) => {
  console.error('错误:', error)
  alert(`发生错误: ${error.message}`)
}

const testSave = () => {
  const data = editorRef.value?.getGraphData()
  console.log('手动获取数据:', data)
  outputData.value = data
}

const testGetData = () => {
  const data = editorRef.value?.getGraphData()
  console.log('获取数据:', data)
  alert('数据已输出到控制台')
}

const testSetData = () => {
  const newData = {
    nodes: [
      {
        id: 'node3',
        type: 'circle',
        x: 200,
        y: 200,
        text: { value: '新节点' },
        properties: {
          r: 40
        }
      }
    ],
    edges: []
  }
  editorRef.value?.setGraphData(newData)
  alert('已设置新数据')
}

const togglePreviewMode = () => {
  alert('切换模式功能需要在实际应用中实现（通过改变 mode prop）')
}
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 30px;
  color: #333;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.test-section h2 {
  margin-bottom: 15px;
  color: #409eff;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

button {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #66b1ff;
}

label {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
}

label input[type="checkbox"] {
  cursor: pointer;
}

pre {
  background: #f6f8fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
}
</style>
