<script setup lang="ts">
import { computed, ref } from 'vue';
import { useNodeAppearance } from '@/ts/useNodeAppearance';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const DEFAULT_HTML = '<p>请输入文本</p>';

const richHtml = ref(DEFAULT_HTML);

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const normalizeTextHtml = (rawText: any): string => {
  if (typeof rawText === 'string') {
    const trimmed = rawText.trim();
    if (!trimmed) return DEFAULT_HTML;
    return trimmed.startsWith('<') ? trimmed : `<p>${escapeHtml(rawText)}</p>`;
  }

  if (rawText && typeof rawText === 'object') {
    const content = typeof rawText.content === 'string' ? rawText.content : '';
    if (!content.trim()) return DEFAULT_HTML;
    return rawText.rich === false ? `<p>${escapeHtml(content)}</p>` : content;
  }

  return DEFAULT_HTML;
};

const { containerStyle, textStyle } = useNodeAppearance({
  onPropsChange(props) {
    richHtml.value = normalizeTextHtml(props?.text);
  }
});

const DEFAULT_BG = '#ffffff';
const DEFAULT_BORDER = '#dcdfe6';
const DEFAULT_SHADOW = '0px 2px 4px rgba(0,0,0,0.1)';

const displayContainerStyle = computed(() => {
  const style: Record<string, any> = { ...(containerStyle.value || {}) };
  const background = String(style.background ?? '').toLowerCase();
  const borderColor = String(style.borderColor ?? '').toLowerCase();
  const boxShadow = String(style.boxShadow ?? '').replaceAll(/\s+/g, '');

  // Keep user-customized style, but make legacy/default text-node chrome transparent.
  if (!background || background === DEFAULT_BG || background === 'rgb(255,255,255)') {
    style.background = 'transparent';
  }
  if (!borderColor || borderColor === DEFAULT_BORDER || borderColor === 'rgb(220,223,230)') {
    style.borderColor = 'transparent';
  }
  if (!boxShadow || boxShadow === DEFAULT_SHADOW.replaceAll(/\s+/g, '')) {
    style.boxShadow = 'none';
  }

  return style;
});
</script>

<template>
  <div class="text-node" :style="displayContainerStyle">
    <div class="text-content ql-editor" :style="textStyle" v-html="richHtml"></div>
  </div>
</template>

<style scoped>
.text-node {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.text-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 8px;
  overflow: auto;
  word-break: break-word;
  pointer-events: none;
}

.text-content :deep(p) {
  margin: 0 0 0.5em;
}

.text-content :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
