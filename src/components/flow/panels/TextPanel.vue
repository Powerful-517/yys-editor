<script setup lang="ts">
import { ref, watch } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { getLogicFlowInstance } from '@/ts/useLogicFlow';

const props = defineProps<{ node: any }>();

const DEFAULT_HTML = '<p>请输入文本</p>';

const editorHtml = ref(DEFAULT_HTML);

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['clean']
] as const;

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

const syncEditorFromNode = (node?: any) => {
  const next = normalizeTextHtml(node?.properties?.text);
  if (next !== editorHtml.value) {
    editorHtml.value = next;
  }
};

watch(
  () => props.node,
  (node) => {
    syncEditorFromNode(node);
  },
  { immediate: true, deep: true }
);

const handleContentChange = (value: string) => {
  const lf = getLogicFlowInstance();
  const node = props.node;
  if (!lf || !node) return;

  const nextHtml = value?.trim() ? value : DEFAULT_HTML;
  editorHtml.value = nextHtml;

  const current = normalizeTextHtml(node?.properties?.text);
  if (current === nextHtml) return;

  lf.setProperties(node.id, {
    ...(node.properties || {}),
    text: {
      content: nextHtml,
      rich: true
    }
  });
};
</script>

<template>
  <div class="property-section">
    <div class="section-header">文本节点</div>

    <div class="property-item">
      <label class="property-label">内容</label>
      <div class="editor-wrapper">
        <QuillEditor
          :content="editorHtml"
          contentType="html"
          theme="snow"
          :toolbar="toolbarOptions"
          @update:content="handleContentChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-wrapper :deep(.ql-toolbar.ql-snow) {
  border: none;
  border-bottom: 1px solid #ebeef5;
}

.editor-wrapper :deep(.ql-container.ql-snow) {
  border: none;
  min-height: 180px;
}

.editor-wrapper :deep(.ql-editor) {
  min-height: 180px;
}
</style>
