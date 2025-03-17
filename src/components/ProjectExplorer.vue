<template>
  <div class="project-explorer">
    <el-tree
        :data="allFiles"
        :props="defaultProps"
        @node-click="handleNodeClick"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useFilesStore } from "@/stores/files";

const filesStore = useFilesStore();

const props = defineProps({
  allFiles: {
    type: Array,
    required: true,
  },
});


const defaultProps = {
  children: 'children',
  label: 'label',
};

const handleNodeClick = (data) => {
  filesStore.setActiveFile(data.name);
  filesStore.setVisible(data.name, true);
};
</script>

<style scoped>
.project-explorer {
  height: 50%; /* 占据侧边栏的一半 */
  overflow-y: auto; /* 允许内容滚动 */
}
</style>