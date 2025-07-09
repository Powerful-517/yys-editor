import { useVueFlow } from '@vue-flow/core'
import { ref, watch } from 'vue'
import { useFilesStore } from './useStore'

let id = 0

function getId() {
  return `dndnode_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

const state = {
  draggedType: ref<string | null>(null),
  isDragOver: ref(false),
  isDragging: ref(false),
}

export default function useDragAndDrop() {
  const { draggedType, isDragOver, isDragging } = state
  const { screenToFlowCoordinate, onNodesInitialized } = useVueFlow()
  const filesStore = useFilesStore()

  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? 'none' : ''
  })

  function onDragStart(event: DragEvent, nodeData: any) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify(nodeData))
      event.dataTransfer.effectAllowed = 'move'
    }

    draggedType.value = nodeData.type
    isDragging.value = true

    document.addEventListener('drop', onDragEnd)
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault()

    if (draggedType.value) {
      isDragOver.value = true

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
      }
    }
  }

  function onDragLeave() {
    isDragOver.value = false
  }

  function onDragEnd() {
    isDragging.value = false
    isDragOver.value = false
    draggedType.value = null
    document.removeEventListener('drop', onDragEnd)
  }

  function onDrop(event: DragEvent) {
    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })

    try {
      const nodeData = JSON.parse(event.dataTransfer?.getData('application/json') || '{}')
      const nodeId = getId()

      const newNode = {
        id: nodeId,
        ...nodeData,
        position,
      }

      filesStore.addNode(newNode)

      const { off } = onNodesInitialized(() => {
        filesStore.updateNode(nodeId, {
          position: { 
            x: position.x - newNode.dimensions?.width / 2 || position.x, 
            y: position.y - newNode.dimensions?.height / 2 || position.y 
          },
        })
        off()
      })

    } catch (error) {
      console.error('拖拽放置处理失败:', error)
    }
  }

  return {
    draggedType,
    isDragOver,
    isDragging,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDrop,
  }
} 