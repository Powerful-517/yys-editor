<script setup lang="ts">
import { reactive, watch } from 'vue';
import { getLogicFlowInstance } from '@/ts/useLogicFlow';

const props = defineProps<{ node: any }>();

const form = reactive({
  kind: 'rect',
  tileWidth: 50,
  tileHeight: 50,
  fill: '#409EFF',
  stroke: '#303133',
  strokeWidth: 1,
  path: '',
  svgContent: ''
});

// 从节点同步数据
watch(
  () => props.node,
  (node) => {
    if (node?.properties?.vector) {
      Object.assign(form, node.properties.vector);
    }
  },
  { immediate: true, deep: true }
);

// 应用更改
const applyChanges = (partial: Record<string, any>) => {
  const lf = getLogicFlowInstance();
  if (!lf || !props.node) return;

  const currentVector = props.node.properties?.vector || {};
  lf.setProperties(props.node.id, {
    ...props.node.properties,
    vector: {
      ...currentVector,
      ...partial
    }
  });
};

const kindOptions = [
  { label: '矩形', value: 'rect' },
  { label: '椭圆', value: 'ellipse' },
  { label: '多边形', value: 'polygon' },
  { label: '路径', value: 'path' },
  { label: '自定义SVG', value: 'svg' }
];
</script>

<template>
  <div class="property-section">
    <div class="section-header">矢量配置</div>

    <!-- 图形类型 -->
    <div class="property-item">
      <div class="property-label">图形类型</div>
      <div class="property-value">
        <el-select
          v-model="form.kind"
          size="small"
          @change="() => applyChanges({ kind: form.kind })"
        >
          <el-option
            v-for="opt in kindOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 平铺尺寸 -->
    <div class="property-item">
      <div class="property-label">平铺尺寸 (宽×高)</div>
      <div class="property-value row">
        <el-input-number
          v-model="form.tileWidth"
          :min="10"
          :max="500"
          size="small"
          @change="() => applyChanges({ tileWidth: form.tileWidth })"
        />
        <span>×</span>
        <el-input-number
          v-model="form.tileHeight"
          :min="10"
          :max="500"
          size="small"
          @change="() => applyChanges({ tileHeight: form.tileHeight })"
        />
      </div>
    </div>

    <!-- 填充颜色 -->
    <div class="property-item">
      <div class="property-label">填充颜色</div>
      <div class="property-value">
        <el-color-picker
          v-model="form.fill"
          size="small"
          @change="() => applyChanges({ fill: form.fill })"
        />
      </div>
    </div>

    <!-- 描边颜色 -->
    <div class="property-item">
      <div class="property-label">描边颜色</div>
      <div class="property-value">
        <el-color-picker
          v-model="form.stroke"
          size="small"
          @change="() => applyChanges({ stroke: form.stroke })"
        />
      </div>
    </div>

    <!-- 描边宽度 -->
    <div class="property-item">
      <div class="property-label">描边宽度</div>
      <div class="property-value">
        <el-input-number
          v-model="form.strokeWidth"
          :min="0"
          :max="20"
          size="small"
          @change="() => applyChanges({ strokeWidth: form.strokeWidth })"
        />
      </div>
    </div>

    <!-- Path 数据（仅当 kind='path' 时显示） -->
    <div v-if="form.kind === 'path'" class="property-item">
      <div class="property-label">Path 数据</div>
      <div class="property-value">
        <el-input
          v-model="form.path"
          type="textarea"
          :rows="3"
          size="small"
          placeholder="M 0 0 L 50 50 Z"
          @change="() => applyChanges({ path: form.path })"
        />
      </div>
    </div>

    <!-- SVG 内容（仅当 kind='svg' 时显示） -->
    <div v-if="form.kind === 'svg'" class="property-item">
      <div class="property-label">SVG 内容</div>
      <div class="property-value">
        <el-input
          v-model="form.svgContent"
          type="textarea"
          :rows="5"
          size="small"
          placeholder="<rect x='0' y='0' width='50' height='50' />"
          @change="() => applyChanges({ svgContent: form.svgContent })"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.property-section {
  margin-bottom: 20px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
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
  width: 100%;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
