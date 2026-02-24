// 库入口文件
import 'element-plus/dist/index.css'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
import YysEditorEmbed from './YysEditorEmbed.vue'

// 导出组件
export { YysEditorEmbed }
export { YysEditorEmbed as YysEditorPreview }  // 别名导出，用于 wiki 预览场景

// 默认导出
export default YysEditorEmbed

// 类型导出
export * from './YysEditorEmbed.vue'
export * from './flowRuntime'
