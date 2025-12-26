# 项目概览（yys-editor）

目标与定位
- yys-editor 是一个基于浏览器的可视化编辑器，用于拖拽排布素材并生成展示效果（围绕式神/御魂等要素）。
- 适合快速制作、调整与导出展示图（如阵容/排行等）。

技术要点
- Vue 3 + Vite + Element Plus + Pinia + vue-i18n
- 入口：`index.html` -> `/src/main.js` -> `App.vue`
- 路径别名：`@` -> `src/`
- 资源：大量静态图片位于 `public/assets/`
- 语言：中文、日文（从浏览器语言推断，fallback 为 `zh`）

当前现状
- 包管理器：npm（存在 `package-lock.json`）
- 脚本：`dev`/`build`/`preview`/`lint`/`format`
- Lint/Format：ESLint + Prettier（无项目级 Prettier 配置文件，使用默认）
- 测试：未配置自动化测试

典型编辑流程
1) `npm install`
2) `npm run dev` 在 http://localhost:5173/ 进行开发与手动验收
3) `npm run lint` + `npm run format` 保持风格统一
4) `npm run build` 产出 `dist/`，`npm run preview` 进行生产包预览

其它
- 状态存储使用 Pinia，并通过 `localStorage` 自动保存；应用启动时支持恢复上次未保存内容。