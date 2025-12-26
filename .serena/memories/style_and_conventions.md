# yys-editor 技术栈与风格约定

技术栈
- 前端框架：Vue 3（Composition API，部分 SFC 使用 `<script setup lang="ts">`）
- 构建与开发：Vite
- UI 组件：Element Plus（含 `@element-plus/icons-vue`）
- 状态管理：Pinia（示例：`src/ts/files.ts` 存储文件页签等，含本地存储自动保存）
- 国际化：vue-i18n（`src/locales/zh.json` + `src/locales/ja.json`，默认从浏览器语言推断，fallback 为 `zh`）
- 拖拽缩放：vue3-draggable-resizable
- 其它依赖：`@vueup/vue-quill`（如后续使用富文本）/ `html2canvas` / `vuedraggable` 等

工程与路径
- 别名：`@` 指向 `src/`（见 `vite.config.js` 与 `jsconfig.json`）。
- 入口：`index.html` -> `/src/main.js` -> `App.vue`。
- 静态资源：`public/`（大量图片素材位于 `public/assets/...`）。

代码风格
- 代码格式：Prettier（未见项目级配置，使用默认规则；脚本仅格式化 `src/`）。
- 语法检查：ESLint（`eslint-plugin-vue` + `@vue/eslint-config-prettier`；脚本已启用 `--fix`）。
- 组件命名：PascalCase 单文件组件（`.vue`），按功能归档于 `src/components/`。
- 类型：以 JS 为主，SFC 中可使用 TS（经 Vite/ESBuild 处理，无专门 `tsconfig.json`，有 `jsconfig.json` 路径提示）。
- 国际化：新增/修改文案时，请同步维护 `zh.json` 与 `ja.json`，避免硬编码 UI 文案。
- 状态与持久化：Pinia store 通过 `localStorage` 自动保存，注意 key 兼容；涉及 schema 变更时考虑迁移逻辑。

样式
- 常规样式位于 `src/assets/*.css`，组件中常用 `<style scoped>` 以局部隔离。
- UI 主题由 Element Plus 提供，如需自定义主题请统一约定变量来源。

提交与约定
- 未发现提交规范配置（如 commitlint/husky），建议信息清晰、原子化提交。必要时中英文均可，但保持一致性。

测试
- 未配置自动化测试框架；变更请重点进行手动验收（参见 `task_completion_checklist.md`）。