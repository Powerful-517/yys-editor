<script setup lang="ts">
import { useDialogs } from '../ts/useDialogs'
import ShikigamiSelect from './flow/nodes/yys/ShikigamiSelect.vue'
import YuhunSelect from './flow/nodes/yys/YuhunSelect.vue'
import PropertySelect from './flow/nodes/yys/PropertySelect.vue'

const { dialogs, closeDialog } = useDialogs();
</script>

<template>
  <ShikigamiSelect
    v-if="dialogs.shikigami.show"
    :showSelectShikigami="dialogs.shikigami.show"
    :currentShikigami="dialogs.shikigami.data"
    @closeSelectShikigami="closeDialog('shikigami')"
    @updateShikigami="data => { dialogs.shikigami.callback?.(data, dialogs.shikigami.node); closeDialog('shikigami') }"
  />
  <YuhunSelect
    v-if="dialogs.yuhun.show"
    :showSelectYuhun="dialogs.yuhun.show"
    :currentYuhun="dialogs.yuhun.data"
    @closeSelectYuhun="closeDialog('yuhun')"
    @updateYuhun="data => { dialogs.yuhun.callback?.(data, dialogs.yuhun.node); closeDialog('yuhun') }"
  />
  <PropertySelect
    v-if="dialogs.property.show"
    :showPropertySelect="dialogs.property.show"
    :currentProperty="dialogs.property.data"
    @closePropertySelect="closeDialog('property')"
    @updateProperty="data => { dialogs.property.callback?.(data, dialogs.property.node); closeDialog('property') }"
  />
</template> 