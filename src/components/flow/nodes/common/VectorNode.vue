<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useNodeAppearance } from '@/ts/useNodeAppearance';
import {
  DEFAULT_VECTOR_CONFIG,
  buildNextVectorConfig,
  createRafLatestScheduler,
  type VectorConfig
} from './vectorNodeSync';

const vectorConfig = ref<VectorConfig>({ ...DEFAULT_VECTOR_CONFIG });
const patternId = `vector-pattern-${Math.random().toString(36).slice(2, 11)}`;

const syncVectorConfig = createRafLatestScheduler<VectorConfig>((nextConfig) => {
  vectorConfig.value = nextConfig;
});

const { containerStyle } = useNodeAppearance({
  onPropsChange(props) {
    const nextConfig = buildNextVectorConfig(vectorConfig.value, props?.vector);
    if (nextConfig) {
      syncVectorConfig.enqueue(nextConfig);
    }
  }
});

onBeforeUnmount(() => {
  syncVectorConfig.cancel();
});

const ellipseCx = computed(() => vectorConfig.value.tileWidth / 2);
const ellipseCy = computed(() => vectorConfig.value.tileHeight / 2);
const ellipseRx = computed(() => Math.max(0, vectorConfig.value.tileWidth / 2 - vectorConfig.value.strokeWidth));
const ellipseRy = computed(() => Math.max(0, vectorConfig.value.tileHeight / 2 - vectorConfig.value.strokeWidth));
const polygonPoints = computed(
  () => `0,${vectorConfig.value.tileHeight} ${vectorConfig.value.tileWidth / 2},0 ${vectorConfig.value.tileWidth},${vectorConfig.value.tileHeight}`
);
const safePath = computed(() => vectorConfig.value.path || 'M 0 0');
const patternFill = computed(() => `url(#${patternId})`);
</script>

<template>
  <div class="vector-node" :style="containerStyle">
    <svg class="vector-content" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <defs>
        <pattern
          :id="patternId"
          x="0"
          y="0"
          :width="vectorConfig.tileWidth"
          :height="vectorConfig.tileHeight"
          patternUnits="userSpaceOnUse"
        >
          <rect
            v-if="vectorConfig.kind === 'rect'"
            x="0"
            y="0"
            :width="vectorConfig.tileWidth"
            :height="vectorConfig.tileHeight"
            :fill="vectorConfig.fill"
            :stroke="vectorConfig.stroke"
            :stroke-width="vectorConfig.strokeWidth"
          />
          <ellipse
            v-else-if="vectorConfig.kind === 'ellipse'"
            :cx="ellipseCx"
            :cy="ellipseCy"
            :rx="ellipseRx"
            :ry="ellipseRy"
            :fill="vectorConfig.fill"
            :stroke="vectorConfig.stroke"
            :stroke-width="vectorConfig.strokeWidth"
          />
          <path
            v-else-if="vectorConfig.kind === 'path'"
            :d="safePath"
            :fill="vectorConfig.fill"
            :stroke="vectorConfig.stroke"
            :stroke-width="vectorConfig.strokeWidth"
          />
          <g v-else-if="vectorConfig.kind === 'svg'" v-html="vectorConfig.svgContent || ''"></g>
          <polygon
            v-else
            :points="polygonPoints"
            :fill="vectorConfig.fill"
            :stroke="vectorConfig.stroke"
            :stroke-width="vectorConfig.strokeWidth"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" :fill="patternFill" />
    </svg>
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
  display: block;
  width: 100%;
  height: 100%;
}
</style>
