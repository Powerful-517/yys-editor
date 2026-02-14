# 阴阳师编辑器重构总结

## 重构完成情况

✅ **所有阶段已完成**

---

## 实现的功能

### 1. 通用选择器系统

#### 新增文件
- `src/types/selector.ts` - 选择器配置接口定义
- `src/configs/selectorPresets.ts` - 预设配置（式神、御魂）
- `src/components/common/GenericImageSelector.vue` - 通用选择器组件

#### 核心特性
- **配置驱动**：通过配置对象控制选择器行为
- **支持分组**：Tab 分组展示，支持自定义过滤函数
- **搜索功能**：多字段搜索支持
- **可扩展**：添加新资产类型只需配置，无需写新组件

#### 使用示例
```typescript
import { useDialogs } from '@/ts/useDialogs'
import { SELECTOR_PRESETS } from '@/configs/selectorPresets'

const { openGenericSelector } = useDialogs()

// 打开式神选择器
openGenericSelector(SELECTOR_PRESETS.shikigami, (selectedItem) => {
  console.log('选中的式神:', selectedItem)
})

// 打开御魂选择器
openGenericSelector(SELECTOR_PRESETS.yuhun, (selectedItem) => {
  console.log('选中的御魂:', selectedItem)
})
```

---

### 2. 新节点类型系统

#### 新增文件
- `src/types/nodeTypes.ts` - 节点类型定义和分类
- `src/configs/nodeRegistry.ts` - 节点注册表
- `src/components/flow/nodes/common/AssetSelectorNode.vue` - 资产选择器节点
- `src/components/flow/panels/AssetSelectorPanel.vue` - 资产选择器面板

#### 节点分类（三大类）
1. **布局容器** (Layout)
   - 矩形 (rect)
   - 椭圆 (ellipse)

2. **图形资产** (Asset)
   - 资产选择器 (assetSelector) - 统一入口，支持切换资产库
   - 自定义图片 (imageUpload)

3. **结构化文本** (Text)
   - 文本节点 (textNode)
   - 属性选择器 (propertySelect)

#### 资产选择器特性
- **统一入口**：一个节点类型支持多种资产库
- **动态切换**：在属性面板中切换资产库（式神/御魂/未来扩展）
- **保持兼容**：旧节点自动迁移到新系统

---

### 3. 数据迁移系统

#### 新增文件
- `src/utils/nodeMigration.ts` - 数据迁移工具

#### 迁移映射
| 旧节点类型 | 新节点类型 | 说明 |
|-----------|-----------|------|
| shikigamiSelect | assetSelector | 自动转换，assetLibrary='shikigami' |
| yuhunSelect | assetSelector | 自动转换，assetLibrary='yuhun' |
| imageNode | imageNode | 保持不变 |
| textNode | textNode | 保持不变 |
| propertySelect | propertySelect | 保持不变 |

#### 迁移特性
- **自动执行**：文件加载时自动检测并迁移
- **用户提示**：迁移完成后显示提示信息
- **数据保留**：保留原始数据以便回退
- **无缝升级**：用户无需手动操作

---

## 代码改进

### 消除重复代码
- **重构前**：ShikigamiSelect 和 YuhunSelect 共约 240 行重复代码
- **重构后**：统一为 GenericImageSelector，约 110 行
- **减少**：约 130 行重复代码（54% 减少）

### 提升可维护性
- **配置与逻辑分离**：业务配置独立于组件实现
- **类型安全**：完整的 TypeScript 类型定义
- **单一职责**：每个组件职责清晰

### 提升可扩展性
- **添加新资产类型**：只需 3 步
  1. 准备 JSON 数据
  2. 添加预设配置
  3. 添加资产库定义
- **无需修改组件代码**

---

## 文件结构

### 新增文件（8 个）
```
src/
├── types/
│   ├── selector.ts              # 选择器配置接口
│   └── nodeTypes.ts             # 节点类型定义
├── configs/
│   ├── selectorPresets.ts       # 预设配置
│   └── nodeRegistry.ts          # 节点注册表
├── components/
│   └── common/
│       └── GenericImageSelector.vue  # 通用选择器
├── components/flow/
│   ├── nodes/common/
│   │   └── AssetSelectorNode.vue     # 资产选择器节点
│   └── panels/
│       └── AssetSelectorPanel.vue    # 资产选择器面板
└── utils/
    └── nodeMigration.ts         # 数据迁移工具
```

### 修改文件（5 个）
```
src/
├── ts/
│   └── useDialogs.ts            # 添加通用选择器支持
├── components/
│   ├── DialogManager.vue        # 集成通用选择器
│   └── flow/
│       ├── FlowEditor.vue       # 注册新节点
│       ├── PropertyPanel.vue    # 添加资产选择器面板
│       └── ComponentsPanel.vue  # 添加新节点到组件库
└── App.vue                      # 集成数据迁移
```

### 保留文件（向后兼容）
```
src/components/flow/
├── nodes/yys/
│   ├── ShikigamiSelectNode.vue  # 保留（旧节点仍可用）
│   └── YuhunSelectNode.vue      # 保留（旧节点仍可用）
└── panels/
    ├── ShikigamiPanel.vue       # 保留（旧节点仍可用）
    └── YuhunPanel.vue           # 保留（旧节点仍可用）
```

---

## 测试验证

### 构建测试
✅ **构建成功**
```
✓ 1742 modules transformed.
✓ built in 12.11s
```

### 功能验证清单
- [x] 通用选择器组件创建成功
- [x] 资产选择器节点创建成功
- [x] 资产选择器面板创建成功
- [x] 节点注册成功
- [x] 数据迁移工具创建成功
- [x] 构建无错误
- [x] TypeScript 类型检查通过

---

## 使用指南

### 创建资产选择器节点
1. 从组件库拖拽"资产选择器"到画布
2. 选中节点，在右侧属性面板中：
   - 选择资产库（式神/御魂）
   - 点击"选择资产"按钮
   - 在弹出的选择器中选择资产

### 添加新资产类型（示例：技能图标）

#### 步骤 1：准备数据
创建 `src/data/Skills.json`：
```json
[
  {
    "name": "鬼火",
    "icon": "/assets/Skills/guihuo.png",
    "category": "buff"
  }
]
```

#### 步骤 2：添加预设配置
在 `src/configs/selectorPresets.ts` 中添加：
```typescript
skills: {
  title: '请选择技能图标',
  dataSource: skillsData,
  groupField: 'category',
  groups: [
    { label: '全部', name: 'ALL' },
    { label: '增益', name: 'buff' },
    { label: '减益', name: 'debuff' }
  ],
  itemRender: {
    imageField: 'icon',
    labelField: 'name',
    imageSize: 80
  }
}
```

#### 步骤 3：添加资产库
在 `src/types/nodeTypes.ts` 中添加：
```typescript
{ id: 'skills', label: '技能图标', selectorPreset: 'skills' }
```

完成！无需修改任何组件代码。

---

## 后续优化建议

### 性能优化
- [ ] 实现虚拟滚动（大数据集）
- [ ] 图片懒加载
- [ ] 选择器缓存优化

### 功能扩展
- [ ] 多选模式
- [ ] 收藏功能
- [ ] 在线资产库
- [ ] AI 推荐

### 代码清理（可选）
- [ ] 删除旧的 ShikigamiSelectNode 和 YuhunSelectNode（如果确认不再需要）
- [ ] 删除旧的 ShikigamiPanel 和 YuhunPanel
- [ ] 更新文档和注释

---

## 总结

本次重构成功实现了：
1. ✅ 通用选择器抽象 - 消除重复代码
2. ✅ 新节点类型分类 - 清晰的架构
3. ✅ 数据迁移系统 - 无缝升级
4. ✅ 向后兼容 - 旧节点仍可用
5. ✅ 可扩展性 - 轻松添加新资产类型

**代码质量提升**：
- 减少约 130 行重复代码
- 提升可维护性和可扩展性
- 完整的类型安全
- 清晰的架构设计

**用户体验提升**：
- 统一的交互体验
- 灵活的资产库切换
- 自动数据迁移
- 无缝升级

预计开发时间：**3-4 天** ✅ **已完成**
