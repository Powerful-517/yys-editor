<template>
  <div class="project-explorer">
    <el-tree
        :data="allFiles"
        :props="defaultProps"
        @node-click="handleNodeClick"
        node-key="name"
        default-expand-all
        :expand-on-click-node="false"
    >
      <template #default="{ node, data }">
        <div class="custom-tree-node">
          <span>{{ node.label }}</span>
          <div>
            <el-dropdown>
              <el-button
                  style="margin-left: 4px"
                  icon="MoreFilled"
                  link
              />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="() => renameFile(data)">Rename</el-dropdown-item>
                  <el-dropdown-item @click="() => deleteFile(data)">Delete</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, ref} from 'vue';
import {useFilesStore} from "@/ts/files";
import {ElTree, ElButton, ElDropdownMenu, ElDropdownItem} from 'element-plus';

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

const visibleDropdown = ref(false);
const dropdownLeft = ref(0);
const dropdownTop = ref(0);
const selectedData = ref(null);

const handleNodeClick = (data) => {
  filesStore.setActiveFile(data.name);
  filesStore.setVisible(data.name, true);
};

const showOptions = (node, data) => {
  visibleDropdown.value = true;
  dropdownLeft.value = node.$el.offsetLeft + 20;
  dropdownTop.value = node.$el.offsetTop + 20;
  selectedData.value = data;
};

const hideDropdown = () => {
  visibleDropdown.value = false;
};

document.addEventListener('click', hideDropdown);

const deleteFile = (data) => {
  filesStore.deleteFile(data.name);
  hideDropdown();
};

const renameFile = (data) => {
  const newName = prompt("Enter new name:", data.label);
  if (newName && newName !== data.label) {
    filesStore.renameFile(data.name, newName);
  }
  hideDropdown();
};
</script>

<style scoped>
.project-explorer {
  height: 50%; /* 占据侧边栏的一半 */
  min-height: 400px;
  overflow-y: auto; /* 允许内容滚动 */
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>