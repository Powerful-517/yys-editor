import { reactive } from 'vue'
import type { SelectorConfig } from '@/types/selector'

const dialogs = reactive({
  property: { show: false, data: null, node: null, callback: null },
  generic: { show: false, config: null, callback: null }
})

function openDialog(type: string, data = null, node = null, callback = null) {
  dialogs[type].show = true
  dialogs[type].data = data
  dialogs[type].node = node
  dialogs[type].callback = callback
}

function closeDialog(type: string) {
  dialogs[type].show = false
  dialogs[type].data = null
  dialogs[type].node = null
  dialogs[type].callback = null
}

function openGenericSelector(config: SelectorConfig, callback: (item: any) => void) {
  dialogs.generic.show = true
  dialogs.generic.config = config
  dialogs.generic.callback = callback
}

function closeGenericSelector() {
  dialogs.generic.show = false
  dialogs.generic.config = null
  dialogs.generic.callback = null
}

export function useDialogs() {
  return {
    dialogs,
    openDialog,
    closeDialog,
    openGenericSelector,
    closeGenericSelector
  }
} 