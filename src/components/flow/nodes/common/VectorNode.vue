<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNodeAppearance } from '@/ts/useNodeAppearance';

const vectorConfig = ref({
  kind: 'rect',
  svgContent: '',
  path: '',
  tileWidth: 50,
  tileHeight: 50,
  fill: '#409EFF',
  stroke: '#303133',
  strokeWidth: 1
});

const nodeSize = ref({ width: 200, height: 200 });

const { containerStyle } = useNodeAppearance({
  onPropsChange(props, node) {
    // 同步矢量配置
    if (props.vector) {
      Object.assign(vectorConfig.value, props.vector);
    }
    // 同步节点尺寸
    if (node) {
      nodeSize.value.width = node.width;
      nodeSize.value.height = node.height;
    }
  }
});

// 生成唯一的 pattern ID
const patternId = computed(() => `vector-pattern-${Math.random().toString(36).substr(2, 9)}`);

// 生成 SVG 内容
const svgContent = computed(() => {
  const { kind, path, tileWidth, tileHeight, fill, stroke, strokeWidth } = vectorConfig.value;

  let shapeElement = '';
  switch (kind) {
    case 'rect':
      shapeElement = `<rect x="0" y="0" width="${tileWidth}" height="${tileHeight}"
                            fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      break;
    case 'ellipse':
      shapeElement = `<ellipse cx="${tileWidth/2}" cy="${tileHeight/2}"
                               rx="${tileWidth/2 - strokeWidth}" ry="${tileHeight/2 - strokeWidth}"
                               fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      break;
    case 'path':
      shapeElement = `<path d="${path || 'M 0 0'}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      break;
    case 'svg':
      shapeElement = vectorConfig.value.svgContent || '';
      break;
    case 'polygon':
      // 默认三角形
      const points = `0,${tileHeight} ${tileWidth/2},0 ${tileWidth},${tileHeight}`;
      shapeElement = `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
      break;
  }

  return `
    <svg width="${nodeSize.value.width}" height="${nodeSize.value.height}"
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="${patternId.value}"
                 x="0" y="0"
                 width="${tileWidth}"
                 height="${tileHeight}"
                 patternUnits="userSpaceOnUse">
          ${shapeElement}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#${patternId.value})" />
    </svg>
  `;
});
</script>

<template>
  <div class="vector-node" :style="containerStyle">
    <div class="vector-content" v-html="svgContent"></div>
  </div>
</template>

<style scoped>
.vector-node {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.vector-content {
  width: 100%;
  height: 100%;
}

.vector-content :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
