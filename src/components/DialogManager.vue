<script setup lang="ts">
import { useDialogs } from '../ts/useDialogs'
import ShikigamiSelect from './flow/nodes/yys/ShikigamiSelect.vue'
import YuhunSelect from './flow/nodes/yys/YuhunSelect.vue'
import PropertySelect from './flow/nodes/yys/PropertySelect.vue'
import GenericImageSelector from './common/GenericImageSelector.vue'
import { useFilesStore } from '../ts/useStore'

const { dialogs, closeDialog, closeGenericSelector } = useDialogs();
const filesStore = useFilesStore();
</script>

<template>
  <ShikigamiSelect
    v-if="dialogs.shikigami.show"
    :showSelectShikigami="dialogs.shikigami.show"
    :currentShikigami="dialogs.shikigami.data"
    @closeSelectShikigami="closeDialog('shikigami')"
    @updateShikigami="data => {
      dialogs.shikigami.callback?.(data);
      closeDialog('shikigami');
    }"
  />
  <YuhunSelect
    v-if="dialogs.yuhun.show"
    :showSelectYuhun="dialogs.yuhun.show"
    :currentYuhun="dialogs.yuhun.data"
    @closeSelectYuhun="closeDialog('yuhun')"
    @updateYuhun="data => {
      dialogs.yuhun.callback?.(data);
      closeDialog('yuhun');
    }"
  />
  <PropertySelect
    v-if="dialogs.property.show"
    :showPropertySelect="dialogs.property.show"
    :currentProperty="dialogs.property.data"
    @closePropertySelect="closeDialog('property')"
    @updateProperty="data => {
      dialogs.property.callback?.(data);
      closeDialog('property');
    }"
  />
  <GenericImageSelector
    v-if="dialogs.generic.show && dialogs.generic.config"
    v-model="dialogs.generic.show"
    :config="dialogs.generic.config"
    @select="data => {
      dialogs.generic.callback?.(data);
      closeGenericSelector();
    }"
    @update:modelValue="value => {
      if (!value) closeGenericSelector();
    }"
  />
</template> 