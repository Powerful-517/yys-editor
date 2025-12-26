# yys-editor 常用命令（Windows/PowerShell）

- 安装依赖：
  - `npm install`
- 本地开发（Vite 开发服务器，默认 http://localhost:5173/）：
  - `npm run dev`
- 生产构建（输出到 `dist/`）：
  - `npm run build`
- 本地预览生产包：
  - `npm run preview`
- 代码检查（ESLint，自动修复）：
  - `npm run lint`
- 代码格式化（Prettier，仅 `src/` 目录）：
  - `npm run format`

辅助命令（PowerShell 常用）：
- 进入目录/查看/读取文件：`cd`, `ls` (Get-ChildItem), `cat file` (Get-Content -Raw)
- 删除/复制/移动：`rm -r -Force path` (Remove-Item), `cp src dst` (Copy-Item), `mv src dst` (Move-Item)
- Git：`git status`, `git add -p`, `git commit -m "msg"`, `git switch -c <branch>`, `git push`
- 进程占用端口排查（可选）：`Get-Process`、`netstat -ano | findstr 5173`
- 快速全文搜索（若已安装）：`rg "pattern"`

说明：
- 包管理器使用 npm（见 `package-lock.json`）。
- Vite 默认端口 5173，未在 `vite.config.js` 中覆写。
- 项目未配置自动化测试命令。