// 库入口文件
import 'element-plus/dist/index.css'
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'
import YysEditorEmbed from './YysEditorEmbed.vue'
export { setAssetBaseUrl, getAssetBaseUrl, resolveAssetUrl } from './utils/assetUrl'
export { DEFAULT_GROUP_RULES_CONFIG } from './configs/groupRules'
export { validateGraphGroupRules } from './utils/groupRules'
export {
  GROUP_RULES_STORAGE_KEY,
  readSharedGroupRulesConfig,
  writeSharedGroupRulesConfig,
  clearSharedGroupRulesConfig
} from './utils/groupRulesConfigSource'
export { CUSTOM_ASSET_STORAGE_KEY } from './utils/customAssets'

// 导出组件
export { YysEditorEmbed }
export { YysEditorEmbed as YysEditorPreview }  // 别名导出，用于 wiki 预览场景

// 默认导出
export default YysEditorEmbed

// 类型导出
export * from './YysEditorEmbed.vue'
export * from './flowRuntime'
