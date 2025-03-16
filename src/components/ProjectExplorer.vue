<template>
  <div class="project-explorer">
    <el-tree
        :data="files"
        :props="defaultProps"
        @node-click="handleNodeClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  files: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['file-selected']);

const defaultProps = {
  children: 'children',
  label: 'label',
};

const handleNodeClick = (data) => {
  emit('file-selected', data.name);
};
</script>

<style scoped>
.project-explorer {
  height: 50%; /* 占据侧边栏的一半 */
  overflow-y: auto; /* 允许内容滚动 */
}
</style>