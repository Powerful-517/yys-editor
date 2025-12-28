import { ref } from 'vue';

// Shared canvas control state between FlowEditor and Toolbar.
const selectionEnabled = ref(true);
const snapGridEnabled = ref(true);
const snaplineEnabled = ref(true);

export function useCanvasSettings() {
  return {
    selectionEnabled,
    snapGridEnabled,
    snaplineEnabled
  };
}
