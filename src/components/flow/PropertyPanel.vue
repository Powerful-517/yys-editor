<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useDialogs } from '../../ts/useDialogs';
import { getLogicFlowInstance } from '@/ts/useLogicFlow';

type FitMode = 'contain' | 'cover' | 'fill';

const props = defineProps({
  height: {
    type: String,
    default: '100%'
  },
  node: {
    type: Object,
    default: null
  }
});

const { openDialog } = useDialogs();

const selectedNode = computed(() => props.node);

const hasNodeSelected = computed(() => !!selectedNode.value);

const nodeType = computed(() => {
  if (!selectedNode.value) return '';
  return selectedNode.value.type || 'default';
});

type ImageForm = {
  url: string;
  fit: FitMode;
  width: number;
  height: number;
};

const imageForm = reactive<ImageForm>({
  url: '',
  fit: 'contain',
  width: 180,
  height: 120
});

const parseNumber = (value: any, fallback: number) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const getImageProps = (node?: any): ImageForm => {
  const props = node?.properties ?? {};
  const style = props.style ?? {};
  return {
    url: props.image?.url ?? props.url ?? '',
    fit: (props.image?.fit ?? props.fit ?? 'contain') as FitMode,
    width: parseNumber(props.width ?? style.width ?? node?.width, 180),
    height: parseNumber(props.height ?? style.height ?? node?.height, 120)
  };
};

watch(
  () => selectedNode.value,
  (node) => {
    if (!node) {
      imageForm.url = '';
      imageForm.fit = 'contain';
      imageForm.width = 180;
      imageForm.height = 120;
      return;
    }
    const next = getImageProps(node);
    imageForm.url = next.url || '';
    imageForm.fit = next.fit;
    imageForm.width = next.width;
    imageForm.height = next.height;
  },
  { immediate: true, deep: true }
);

// 通用的弹窗处理方法
const handleOpenDialog = (type: 'shikigami' | 'yuhun' | 'property') => {
  const lf = getLogicFlowInstance();
  if (selectedNode.value && lf) {
    const node = selectedNode.value;
    const currentData = node.properties && node.properties[type] ? node.properties[type] : undefined;

    openDialog(
      type,
      currentData,
      node,
      (updatedData) => {
        lf.setProperties(node.id, {
          ...node.properties,
          [type]: updatedData
        });
      }
    );
  }
};

const applyImageChanges = (partial: Partial<ImageForm>) => {
  const lf = getLogicFlowInstance();
  const node = selectedNode.value;
  if (!lf || !node) return;

  const baseProps = node.properties || {};
  const merged = { ...getImageProps(node), ...partial };

  const nextProps = {
    ...baseProps,
    ...merged,
    width: merged.width,
    height: merged.height,
    style: {
      ...(baseProps.style || {}),
      width: merged.width,
      height: merged.height
    },
    image: {
      ...(baseProps.image || {}),
      url: merged.url,
      fit: merged.fit
    },
    url: merged.url
  };

  Object.assign(imageForm, merged);
  lf.setProperties(node.id, nextProps);
};

const handleImageUpload = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    const result = evt.target?.result as string;
    if (result) {
      applyImageChanges({ url: result });
    }
    if (input) input.value = '';
  };
  reader.readAsDataURL(file);
};

const handleImageUrlChange = () => {
  applyImageChanges({ url: imageForm.url });
};

const handleSizeChange = () => {
  applyImageChanges({ width: imageForm.width, height: imageForm.height });
};

const handleFitChange = (val: FitMode) => {
  applyImageChanges({ fit: val });
};
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
          <span>当前选择式神：{{ selectedNode.properties?.shikigami?.name || '未选择' }}</span>
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
          <div class="property-label">图片 URL</div>
          <div class="property-value">
            <el-input
              v-model="imageForm.url"
              size="small"
              placeholder="输入图片链接或上传文件"
              style="width: 100%;"
              @change="handleImageUrlChange"
            />
          </div>
        </div>

        <div class="property-item">
          <div class="property-label">上传文件</div>
          <div class="property-value upload-row">
            <input class="upload-input" type="file" accept="image/*" @change="handleImageUpload" />
            <span class="upload-hint">本地上传将以 base64 保存</span>
          </div>
        </div>

        <div class="property-item">
          <div class="property-label">显示模式</div>
          <div class="property-value">
            <el-select
              v-model="imageForm.fit"
              size="small"
              style="width: 100%;"
              @change="handleFitChange"
            >
              <el-option label="自适应" value="contain" />
              <el-option label="填充" value="cover" />
              <el-option label="拉伸" value="fill" />
            </el-select>
          </div>
        </div>

        <div class="property-item size-item">
          <div class="property-label">宽 / 高</div>
          <div class="property-value size-inputs">
            <el-input-number
              v-model="imageForm.width"
              :min="40"
              :max="1000"
              size="small"
              style="width: 120px;"
              @change="handleSizeChange"
            />
            <span class="size-divider">×</span>
            <el-input-number
              v-model="imageForm.height"
              :min="40"
              :max="1000"
              size="small"
              style="width: 120px;"
              @change="handleSizeChange"
            />
          </div>
        </div>

        <div v-if="imageForm.url" class="property-item">
          <div class="property-label">预览</div>
          <div class="property-value image-preview">
            <img :src="imageForm.url" alt="预览" />
          </div>
        </div>
      </div>

      <!-- 文本节点属性 -->
      <div v-if="nodeType === 'textNode'" class="property-section">
        <div class="section-header">文本编辑</div>
        <div class="property-item">
<!--          <QuillEditor-->
<!--            v-model:content="selectedNode.value.properties.html"-->
<!--            contentType="html"-->
<!--            :toolbar="quillToolbar"-->
<!--            theme="snow"-->
<!--            style="height:120px;"-->
<!--            @update:content="val => updateNodeData('html', val)"-->
<!--          />-->
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

.property-value.upload-row {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.upload-input {
  flex: 1;
}

.upload-hint {
  color: #909399;
  font-size: 12px;
}

.size-item .property-value {
  text-align: left;
}

.size-inputs {
  display: flex;
  align-items: center;
  gap: 6px;
}

.size-divider {
  color: #909399;
  font-size: 12px;
}

.image-preview {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 6px;
  background: #fafafa;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 140px;
  display: block;
  margin: 0 auto;
}
</style>
