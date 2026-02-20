# 开发工作流程

本文档描述在 yys-editor 项目中开发新功能的标准流程。

## 开发流程概览

```
读取计划 → 设计方案 → 实际开发 → 测试验证 → 更新文档
```

## 详细步骤

### 1. 读取项目计划

**在开始任何开发工作前，先了解项目现状：**

#### 1.1 读取 plan.md

```bash
# 查看项目整体规划
cat docs/1management/plan.md
```

重点关注：
- **项目完成度总览**：了解各模块当前状态
- **下一步行动计划**：确定优先级和待办任务
- **愿景实施进度**：查看当前处于哪个阶段
- **详细模块状态**：了解相关模块的已完成和未完成功能

#### 1.2 读取 next.md（可选）

```bash
# 查看下一步任务说明
cat docs/1management/next.md
```

这里通常包含：
- 当前优先级任务
- 开发流程说明
- 技术栈信息

#### 1.3 确定任务

根据 plan.md 中的优先级确定要开发的功能：
- 🔴 高优先级：紧急或核心功能
- 🟡 中优先级：重要但不紧急
- 🟢 低优先级：优化和增强

### 2. 设计方案

**在 `docs/2design/` 目录下创建或更新设计文档**

#### 2.1 确定设计文档名称

根据功能类型选择或创建设计文档：

| 功能类型 | 设计文档 | 说明 |
|---------|---------|------|
| 数据模型变更 | `DataModel.md` | Schema、数据结构、迁移逻辑 |
| 样式系统 | `StyleAndAppearance.md` | 样式属性、渲染逻辑 |
| 新节点类型 | `NodeTypes.md` | 节点定义、属性、行为 |
| 交互功能 | `Interactions.md` | 快捷键、拖拽、选择等 |
| 状态管理 | `StateManagement.md` | Store、持久化、同步 |
| 其他功能 | `<功能名>.md` | 自定义设计文档 |

#### 2.2 编写设计文档

设计文档应包含：

```markdown
# 功能名称

## 背景与目标
- 为什么需要这个功能
- 要解决什么问题
- 预期效果

## 技术方案
- 实现思路
- 技术选型
- 架构设计

## 数据模型（如涉及）
- Schema 变更
- 数据结构定义
- 迁移策略

## 实现细节
- 关键代码位置
- 核心逻辑说明
- 注意事项

## 测试计划
- 测试用例
- 边界情况
- 验收标准
```

#### 2.3 设计文档示例

**示例：添加撤销重做功能**

在 `docs/2design/UndoRedo.md` 中：

```markdown
# 撤销重做系统

## 背景与目标
实现 Ctrl+Z/Y 快捷键，支持撤销和重做画布操作。

## 技术方案
使用 LogicFlow 框架原生的 History 插件。

## 实现细节
- 位置：src/components/flow/FlowEditor.vue
- 插件配置：History 插件，maxSize: 50
- 快捷键：Ctrl+Z 撤销，Ctrl+Y 重做

## 测试计划
- 测试节点增删改操作的撤销重做
- 测试移动、缩放的撤销重做
- 测试历史栈上限
```

### 3. 实际开发

#### 3.1 关键文件位置

```
src/
├── components/
│   ├── flow/
│   │   ├── FlowEditor.vue          # 画布主组件
│   │   ├── ComponentsPanel.vue     # 左侧组件库
│   │   ├── PropertyPanel.vue       # 右侧属性面板
│   │   ├── panels/                 # 属性面板子组件
│   │   │   ├── ImagePanel.vue
│   │   │   ├── TextPanel.vue
│   │   │   └── ...
│   │   └── nodes/                  # 自定义节点
│   │       ├── common/
│   │       └── yys/
│   ├── Toolbar.vue                 # 工具栏
│   └── DialogManager.vue           # 弹窗管理
├── ts/
│   ├── useStore.ts                 # Pinia Store
│   ├── schema.ts                   # 数据模型定义
│   ├── useLogicFlow.ts             # LogicFlow 封装
│   └── nodeStyle.ts                # 样式系统
└── data/                           # 静态数据
```

#### 3.2 开发规范

**使用 Serena 工具高效读取代码：**

```bash
# 查看符号概览
mcp__serena__get_symbols_overview

# 查找特定符号
mcp__serena__find_symbol

# 搜索模式
mcp__serena__search_for_pattern
```

**使用 Context7 查询 LogicFlow 文档：**

```bash
# 查询 LogicFlow 相关功能
mcp__context7__query-docs
```

**代码风格：**
- 遵循项目现有的代码风格
- 使用 TypeScript 类型定义
- 添加必要的注释
- 保持代码简洁清晰

#### 3.3 开发流程

1. **读取相关代码**：使用 Serena 工具快速定位
2. **实现功能**：按照设计文档编写代码
3. **本地测试**：启动开发服务器验证功能
4. **代码检查**：运行 lint 和 format

```bash
# 启动开发服务器
npm run dev

# 代码检查
npm run lint
npm run format
```

### 4. 测试验证

#### 4.1 功能测试

- 在浏览器中测试新功能
- 验证 UI 交互和用户体验
- 测试边界情况和异常场景
- 确保没有破坏现有功能

#### 4.2 测试清单

- [ ] 核心功能正常工作
- [ ] UI 显示正确
- [ ] 交互流畅无卡顿
- [ ] 边界情况处理正确
- [ ] 错误提示友好
- [ ] 没有控制台错误
- [ ] 数据持久化正常（如涉及）

#### 4.3 等待用户确认

**开发完成后，等待用户测试并确认功能正常。**

不要在用户确认前更新文档。

### 5. 更新文档

**测试通过后，必须更新项目管理文档：**

#### 5.1 更新 plan.md

根据完成的功能，更新 `docs/1management/plan.md`：

**更新模块完成度：**

```markdown
## 1. 画布（LogicFlow） — 完成度：100%  ← 更新百分比
- 已完成：
  - ✅ 撤销重做系统：Ctrl+Z/Y 快捷键...  ← 添加新功能
  - ...
- 未完成：
  - 无  ← 如果全部完成，清空未完成列表
```

**标记愿景步骤完成：**

```markdown
| 步骤 | 任务 | 状态 | 说明 |
|------|------|------|------|
| 10 | 历史与撤销重做 | ✅ 完成 | LogicFlow 框架原生支持 |  ← 更新状态
```

**更新总体完成度：**

```markdown
**总体完成度：98%** | **愿景一完成度：100%**  ← 重新计算百分比
```

**更新下一步行动计划：**

```markdown
## 🎯 下一步行动计划

### 🟢 低优先级（后续优化）
1. ~~撤销重做系统~~（已完成）  ← 标记已完成或移除
2. **矢量节点增强**  ← 下一个任务
```

#### 5.2 更新 next.md（可选）

如果 next.md 中有相关任务说明，也需要更新：

```markdown
当前优先级（从 plan.md）：
- 🔴 高优先级：~~实现撤销重做系统~~（已完成）  ← 标记完成
- 🟡 中优先级：textNode 富文本编辑
```

#### 5.3 更新设计文档

在对应的设计文档中添加实现记录：

```markdown
## 实现记录

### 2026-02-20
- ✅ 完成撤销重做系统
- 使用 LogicFlow History 插件
- 快捷键：Ctrl+Z/Y
- 历史栈上限：50 条
```

### 6. 提交代码

#### 6.1 提交前检查清单

- [ ] 功能已测试通过
- [ ] 用户已确认功能正常
- [ ] 代码已格式化（npm run format）
- [ ] 没有 ESLint 错误（npm run lint）
- [ ] **已更新 plan.md**
- [ ] **已更新设计文档**
- [ ] 已更新 next.md（如需要）

#### 6.2 编写 Commit 消息

遵循规范格式：

```
<type>: <subject>

<body>
```

**Type 类型：**
- `feat`: 新功能
- `fix`: 修复 bug
- `refactor`: 重构代码
- `style`: 样式调整
- `docs`: 文档更新
- `chore`: 构建或工具变动

**示例：**
```
feat: 实现撤销重做系统

- 接入 LogicFlow History 插件
- 添加 Ctrl+Z/Y 快捷键
- 支持最多 50 条历史记录
- 更新 plan.md 标记愿景一完成
```

#### 6.3 提交代码

```bash
git add .
git commit -m "feat: 实现撤销重做系统"
git push
```

## 工作流程示例

### 示例：实现撤销重做功能

#### 步骤 1：读取计划

```bash
# 读取 plan.md
cat docs/1management/plan.md
```

发现：
- 愿景一步骤 10：历史与撤销重做（未完成）
- 优先级：🔴 高优先级

#### 步骤 2：设计方案

创建 `docs/2design/UndoRedo.md`：

```markdown
# 撤销重做系统

## 技术方案
使用 LogicFlow 框架原生的 History 插件

## 实现细节
- 位置：src/components/flow/FlowEditor.vue
- 插件：History，maxSize: 50
- 快捷键：Ctrl+Z/Y
```

#### 步骤 3：实际开发

在 `FlowEditor.vue` 中：
- 引入 History 插件
- 配置插件参数
- 添加快捷键监听

#### 步骤 4：测试验证

- 测试节点增删改的撤销重做
- 测试移动、缩放的撤销重做
- 等待用户确认

#### 步骤 5：更新文档

更新 `plan.md`：
```markdown
| 10 | 历史与撤销重做 | ✅ 完成 | LogicFlow 框架原生支持 |

**总体完成度：98%** | **愿景一完成度：100%**
```

#### 步骤 6：提交代码

```bash
git commit -m "feat: 实现撤销重做系统"
```

## 特殊场景处理

### 场景 1：紧急 Bug 修复

1. 直接开始修复，无需设计文档
2. 修复后立即测试
3. 在 plan.md 的"已知问题"中标记已修复
4. 快速提交

### 场景 2：仅 UI 调整

1. 无需设计文档
2. 直接修改样式
3. 手动测试验证
4. 提交时使用 `style:` 类型

### 场景 3：数据模型变更

1. **必须**在 `DataModel.md` 中详细设计
2. 更新 `schema.ts` 类型定义
3. 实现数据迁移逻辑
4. 测试新旧数据兼容性
5. 在 plan.md 中更新 schemaVersion

### 场景 4：重构现有代码

1. 在设计文档中说明重构原因和方案
2. 确保不破坏现有功能
3. 提交时使用 `refactor:` 类型
4. 在 plan.md 中更新模块说明

## 开发工具

### Serena 工具（代码导航）

```bash
# 查看文件符号概览
mcp__serena__get_symbols_overview --relative_path src/components/flow/FlowEditor.vue

# 查找特定符号
mcp__serena__find_symbol --name_path handleUndo

# 搜索模式
mcp__serena__search_for_pattern --substring_pattern "History"
```

### Context7 工具（文档查询）

```bash
# 查询 LogicFlow 文档
mcp__context7__resolve-library-id --libraryName "LogicFlow"
mcp__context7__query-docs --query "History plugin"
```

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 代码格式化
npm run format

# 一键检查
npm run lint && npm run format
```

## 常见问题

### Q: 什么时候需要创建设计文档？

- 涉及数据模型变更：**必须**
- 新增重要功能：**建议**
- 简单 UI 调整：不需要
- Bug 修复：不需要

### Q: 设计文档写多详细？

- 核心思路和技术方案：必须有
- 实现细节：关键部分说明即可
- 代码示例：可选
- 保持简洁，重点突出

### Q: 什么时候更新 plan.md？

**只在用户确认功能正常后更新。**

不要在开发完成后立即更新，等待用户测试。

### Q: 如何计算完成度百分比？

根据模块的已完成功能占总功能的比例：
- 100%：所有功能完成
- 90%：核心功能完成，少量优化待做
- 75%：主要功能完成，部分功能待补
- 50%：基础功能完成，大量功能待做
- 30%：最小可用，大部分功能未完成

## 相关文档

- [项目计划](./plan.md) - 项目整体规划和进度
- [下一步任务](./next.md) - 当前优先级任务
- [设计文档](../2design/) - 各功能的设计方案
- [数据模型](../2design/DataModel.md) - Schema 和数据结构
- [样式系统](../2design/StyleAndAppearance.md) - 样式属性和渲染
