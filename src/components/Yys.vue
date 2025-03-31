<template>
  <draggable :list="groups" item-key="group" style="display: flex; flex-direction: column; width: 100%;"
             handle=".drag-handle">
    <template class="group" #item="{ element: group, index: groupIndex }">
      <el-row :span="24">
        <ShikigamiGroup :groups="groups" :group="group" :group-index="groupIndex"/>
        <div class="divider-horizontal"></div>
      </el-row>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable';
import ShikigamiGroup from "@/components/ShikigamiGroup.vue"; // 引入全局消息通知工具
const props = defineProps<{
  groups: any[];
}>();

</script>

<style scoped>


/* 水平分割线 */
.divider-horizontal {
  border: 0;
  height: 1px;
  background: #e0e0e0;
  margin: 24px 0;
  width: 100%;
}


</style>

