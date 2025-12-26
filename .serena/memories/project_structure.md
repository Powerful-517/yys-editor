# yys-editor 项目结构（概要）

根目录
- `index.html`：Vite 入口 HTML，挂载点 `#app`，引入 `/src/main.js`。
- `package.json` / `package-lock.json`：npm 包与脚本；包管理器为 npm。
- `vite.config.js`：Vite 配置，`@` -> `src/`。
- `jsconfig.json`：编辑器路径提示（`@/*` -> `./src/*`）。
- `.gitignore`：忽略 `node_modules/`、`dist/` 等。
- `.vscode/`：推荐扩展（Volar）。
- `README.md`：项目说明（中文）。
- `public/`：静态资源目录（大量图片素材：`assets/Shikigami`, `assets/Yuhun` 等）。

`src/`
- `main.js`：应用入口，注册 Element Plus、Icons、vue-i18n、Pinia、vue3-draggable-resizable；挂载 `App.vue`。
- `App.vue`：主布局（工具栏、侧边栏、工作区 Tab），根据文件类型切换主要编辑视图。
- `components/`：
  - 核心：`Yys.vue`, `YysRank.vue`, `Toolbar.vue`, `ProjectExplorer.vue` 等
  - 基础：`ShikigamiSelect.vue`, `YuhunSelect.vue`, `Watermark.vue`, `HelloWorld.vue` 等
  - `components/icons/`：若干图标组件
- `assets/`：基础样式 `base.css`, `main.css` 与 logo 等
- `data/`：若干 JSON 数据（如 `Shikigami.json`, `Yuhun.json`, `property.json`, `updateLog.json`）
- `locales/`：多语言资源 `zh.json` 与 `ja.json`
- `ts/`：脚本与 store
  - `files.ts`：Pinia store（文件页签、可见性、删除/重命名；含 `localStorage` 自动保存与启动恢复提示）
  - `useGlobalMessage.ts`：全局消息（Element Plus）
- `types/`：类型定义（如后续扩展）

说明
- 未见 `router` 相关文件；当前为单页多区域布局。
- 构建产物输出到 `dist/`（`npm run build`）。