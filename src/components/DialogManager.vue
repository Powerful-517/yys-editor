<script setup lang="ts">
import { useDialogs } from '../ts/useDialogs'
import PropertySelect from './flow/nodes/yys/PropertySelect.vue'
import GenericImageSelector from './common/GenericImageSelector.vue'
import { useFilesStore } from '../ts/useStore'

const { dialogs, closeDialog, closeGenericSelector } = useDialogs();
const filesStore = useFilesStore();
</script>

<template>
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