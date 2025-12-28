<script setup lang="ts">
import { reactive, watch } from 'vue';
import { getLogicFlowInstance } from '@/ts/useLogicFlow';
import { normalizeNodeStyle, type NodeStyle } from '@/ts/nodeStyle';

const props = defineProps<{
  node: any;
}>();

type StyleForm = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  opacity: number;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
  fontWeight: number | string;
};

const form = reactive<StyleForm>({
  fill: '#ffffff',
  stroke: '#dcdfe6',
  strokeWidth: 1,
  radius: 4,
  shadowColor: 'rgba(0,0,0,0.1)',
  shadowBlur: 4,
  shadowOffsetX: 0,
  shadowOffsetY: 2,
  opacity: 1,
  textAlign: 'left',
  lineHeight: 1.4,
  fontWeight: 400
});

const syncFromNode = (node?: any) => {
  if (!node) return;
  const baseProps = node.properties ?? {};
  const style = normalizeNodeStyle(baseProps.style, { width: baseProps.width ?? node.width, height: baseProps.height ?? node.height });
  form.fill = style.fill ?? form.fill;
  form.stroke = style.stroke ?? form.stroke;
  form.strokeWidth = style.strokeWidth ?? form.strokeWidth;
  form.radius = typeof style.radius === 'number' ? style.radius : style.radius?.[0] ?? form.radius;
  form.shadowColor = style.shadow?.color ?? form.shadowColor;
  form.shadowBlur = style.shadow?.blur ?? form.shadowBlur;
  form.shadowOffsetX = style.shadow?.offsetX ?? form.shadowOffsetX;
  form.shadowOffsetY = style.shadow?.offsetY ?? form.shadowOffsetY;
  form.opacity = style.opacity ?? form.opacity;
  form.textAlign = (style.textStyle?.align as StyleForm['textAlign']) ?? form.textAlign;
  form.lineHeight = style.textStyle?.lineHeight ?? form.lineHeight;
  form.fontWeight = style.textStyle?.fontWeight ?? form.fontWeight;
};

watch(
  () => props.node,
  (node) => {
    if (node) {
      syncFromNode(node);
    }
  },
  { immediate: true, deep: true }
);

const getShadowFromForm = () => ({
  color: form.shadowColor,
  blur: form.shadowBlur,
  offsetX: form.shadowOffsetX,
  offsetY: form.shadowOffsetY
});

const applyStyle = (partial: Partial<NodeStyle>) => {
  const lf = getLogicFlowInstance();
  const node = props.node;
  if (!lf || !node) return;

  const baseProps = node.properties || {};
  const currentStyle = normalizeNodeStyle(baseProps.style, { width: baseProps.width ?? node.width, height: baseProps.height ?? node.height });
  const mergedStyleInput: Partial<NodeStyle> = {
    ...currentStyle,
    ...partial,
    shadow: partial.shadow ? { ...currentStyle.shadow, ...partial.shadow } : currentStyle.shadow,
    textStyle: partial.textStyle ? { ...currentStyle.textStyle, ...partial.textStyle } : currentStyle.textStyle
  };
  const nextStyle = normalizeNodeStyle(mergedStyleInput, { width: currentStyle.width, height: currentStyle.height });

  lf.setProperties(node.id, {
    ...baseProps,
    style: nextStyle,
    width: nextStyle.width,
    height: nextStyle.height
  });
};

const applyShadow = (override?: Partial<NodeStyle['shadow']>) => {
  applyStyle({ shadow: { ...getShadowFromForm(), ...(override || {}) } });
};

const applyTextStyle = (override?: Partial<NodeStyle['textStyle']>) => {
  applyStyle({
    textStyle: {
      ...((props.node?.properties?.style?.textStyle as NodeStyle['textStyle']) || {}),
      align: form.textAlign,
      lineHeight: form.lineHeight,
      fontWeight: form.fontWeight,
      ...(override || {})
    }
  });
};
</script>

<template>
  <div class="property-section">
    <div class="section-header">样式</div>

    <div class="property-item">
      <div class="property-label">填充</div>
      <div class="property-value">
        <el-color-picker v-model="form.fill" size="small" @change="(val: string) => applyStyle({ fill: val })" />
      </div>
    </div>

    <div class="property-item">
      <div class="property-label">描边</div>
      <div class="property-value row">
        <el-color-picker v-model="form.stroke" size="small" @change="(val: string) => applyStyle({ stroke: val })" />
        <el-input-number
          v-model="form.strokeWidth"
          :min="0"
          :max="20"
          size="small"
          controls-position="right"
          @change="(val) => applyStyle({ stroke: form.stroke, strokeWidth: Number(val) || 0 })"
        />
      </div>
    </div>

    <div class="property-item">
      <div class="property-label">圆角</div>
      <div class="property-value">
        <el-input-number
          v-model="form.radius"
          :min="0"
          :max="200"
          size="small"
          controls-position="right"
          @change="(val) => applyStyle({ radius: Number(val) || 0 })"
        />
      </div>
    </div>

    <div class="property-item">
      <div class="property-label">阴影</div>
      <div class="property-value shadow-grid">
        <el-color-picker v-model="form.shadowColor" size="small" @change="(val: string) => applyShadow({ color: val })" />
        <el-input-number
          v-model="form.shadowBlur"
          :min="0"
          :max="50"
          size="small"
          controls-position="right"
          @change="(val) => applyShadow({ blur: Number(val) || 0 })"
        />
        <el-input-number
          v-model="form.shadowOffsetX"
          :min="-100"
          :max="100"
          size="small"
          controls-position="right"
          @change="(val) => applyShadow({ offsetX: Number(val) || 0 })"
        />
        <el-input-number
          v-model="form.shadowOffsetY"
          :min="-100"
          :max="100"
          size="small"
          controls-position="right"
          @change="(val) => applyShadow({ offsetY: Number(val) || 0 })"
        />
      </div>
    </div>

    <div class="property-item">
      <div class="property-label">透明度</div>
      <div class="property-value slider-row">
        <el-slider
          v-model="form.opacity"
          :min="0"
          :max="1"
          :step="0.05"
          show-input
          :show-input-controls="false"
          @change="(val) => applyStyle({ opacity: Number(val) || 0 })"
        />
      </div>
    </div>

    <div class="property-item">
      <div class="property-label">文字对齐</div>
      <div class="property-value">
        <el-select
          v-model="form.textAlign"
          size="small"
          style="width: 100%;"
          @change="(val) => applyTextStyle({ align: val as StyleForm['textAlign'] })"
        >
          <el-option label="左对齐" value="left" />
          <el-option label="居中" value="center" />
          <el-option label="右对齐" value="right" />
        </el-select>
      </div>
    </div>

    <div class="property-item">
      <div class="property-label">行高 / 字重</div>
      <div class="property-value row">
        <el-input-number
          v-model="form.lineHeight"
          :min="0.8"
          :max="3"
          :step="0.1"
          size="small"
          controls-position="right"
          @change="(val) => applyTextStyle({ lineHeight: Number(val) || 1 })"
        />
        <el-select
          v-model="form.fontWeight"
          size="small"
          style="flex: 1;"
          @change="(val) => applyTextStyle({ fontWeight: val as number | string })"
        >
          <el-option label="细（300）" :value="300" />
          <el-option label="常规（400）" :value="400" />
          <el-option label="中等（500）" :value="500" />
          <el-option label="半粗（600）" :value="600" />
          <el-option label="粗体（700）" :value="700" />
        </el-select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.shadow-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.slider-row {
  padding-right: 4px;
}
</style>
