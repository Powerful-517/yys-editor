import { reactive } from 'vue'

const dialogs = reactive({
  shikigami: { show: false, data: null, node: null, callback: null },
  yuhun: { show: false, data: null, node: null, callback: null },
  property: { show: false, data: null, node: null, callback: null }
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

export function useDialogs() {
  return {
    dialogs,
    openDialog,
    closeDialog
  }
} 