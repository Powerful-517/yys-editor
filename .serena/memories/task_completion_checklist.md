# 任务完成前检查清单（yys-editor）

功能与兼容
- 本地自测通过：`npm run dev` 无报错、关键路径可用（切换 Tab、新增/删除文件、编辑视图渲染、国际化切换等）。
- UI 走查：常用分辨率下布局正常（Toolbar、侧边栏、工作区滚动）。
- 资源校验：新增素材放入 `public/assets/...`，路径正确；体积适中（尽量压缩）。
- i18n：新增/修改的 UI 文案同步维护 `src/locales/zh.json` 与 `src/locales/ja.json`。

代码质量
- 语法检查：`npm run lint`（包含 `--fix` 自动修复）。
- 代码格式：`npm run format`（当前仅格式化 `src/` 目录）。
- 引用规范：优先使用 `@/...` 别名；避免相对路径层级过深。
- 状态与持久化：如更改 `files` store 结构，评估 `localStorage` 兼容/迁移策略。

构建与预览
- 生产构建：`npm run build` 成功，产物在 `dist/`。
- 生产预览：`npm run preview` 本地检查基础路由与功能。

提交
- 更新文档（如需）：`README.md` 或注释。
- Git 提交清晰、原子：`git add -p`、`git commit -m "feat/fix: ..."`。
- 如涉及较大静态资源，建议说明来源与 License。