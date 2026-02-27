<template>
  <div class="toolbar" :class="{ 'toolbar--embed': props.isEmbed }">
    <div class="toolbar-actions">
      <el-button icon="Upload" type="primary" @click="handleImport">{{ t('import') }}</el-button>
      <el-button icon="Download" type="primary" @click="handleExport">{{ t('export') }}</el-button>
      <el-button icon="View" type="success" @click="handlePreviewData">数据预览</el-button>
      <el-button icon="Share" type="primary" @click="prepareCapture">{{ t('prepareCapture') }}</el-button>
      <el-button icon="Setting" type="primary" @click="state.showWatermarkDialog = true">{{ t('setWatermark') }}</el-button>
      <el-button icon="Picture" type="primary" plain @click="openAssetManager">素材管理</el-button>
      <el-button icon="EditPen" type="primary" plain @click="openRuleManager">规则管理</el-button>
      <el-button v-if="!props.isEmbed" type="info" @click="loadExample">{{ t('loadExample') }}</el-button>
      <el-button v-if="!props.isEmbed" type="info" @click="showUpdateLog">{{ t('updateLog') }}</el-button>
      <el-button v-if="!props.isEmbed" type="warning" @click="showFeedbackForm">{{ t('feedback') }}</el-button>
      <el-button type="danger" @click="handleResetWorkspace">重置工作区</el-button>
      <el-button type="warning" plain @click="handleClearCanvas">清空画布</el-button>
    </div>
    <div class="toolbar-controls">
      <el-switch
        v-model="selectionEnabled"
        size="small"
        inline-prompt
        active-text="框选开"
        inactive-text="框选关"
      />
      <el-switch
        v-model="snapGridEnabled"
        size="small"
        inline-prompt
        active-text="吸附开"
        inactive-text="吸附关"
      />
      <el-switch
        v-model="snaplineEnabled"
        size="small"
        inline-prompt
        active-text="对齐线开"
        inactive-text="对齐线关"
      />
    </div>

    <!-- 更新日志对话框 -->
    <el-dialog v-if="!props.isEmbed" v-model="state.showUpdateLogDialog" title="更新日志" width="60%">
      <ul>
        <li v-for="(log, index) in updateLogs" :key="index">
          <strong>版本 {{ log.version }} - {{ log.date }}</strong>
          <ul>
            <li v-for="(change, idx) in log.changes" :key="idx">{{ change }}</li>
          </ul>
        </li>
      </ul>
    </el-dialog>

    <!-- 问题反馈对话框 -->
    <el-dialog v-if="!props.isEmbed" v-model="state.showFeedbackFormDialog" title="更新日志" width="60%">
      <span style="font-size: 24px;">备注阴阳师</span>
      <br/>
      <img :src="contactImageUrl"
           style="cursor: pointer; vertical-align: bottom; width: 200px; height: auto;"/>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog id="preview-container" v-model="state.previewVisible" width="80%" height="80%"
               :before-close="handleClose">
      <div style="max-height: 500px; overflow-y: auto;">
        <img v-if="state.previewImage" :src="state.previewImage" alt="Preview" style="width: 100%; display: block;"/>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="state.previewVisible = false">取 消</el-button>
        <el-button type="primary" @click="downloadImage">下 载</el-button>
      </span>
    </el-dialog>

    <!-- 水印设置弹窗 -->
    <el-dialog v-model="state.showWatermarkDialog" title="设置水印" width="30%">
      <el-form>
        <el-form-item label="水印文字">
          <el-input v-model="watermark.text"></el-input>
        </el-form-item>
        <el-form-item label="字体大小">
          <el-input-number v-model="watermark.fontSize" :min="10" :max="100"></el-input-number>
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="watermark.color"></el-color-picker>
        </el-form-item>
        <el-form-item label="水印行数">
          <el-input-number v-model="watermark.rows" :min="1" :max="10"></el-input-number>
        </el-form-item>
        <el-form-item label="水印列数">
          <el-input-number v-model="watermark.cols" :min="1" :max="10"></el-input-number>
        </el-form-item>
        <el-form-item label="角度">
          <el-input-number v-model="watermark.angle" :min="-90" :max="90"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="state.showWatermarkDialog = false">取消</el-button>
          <el-button type="primary" @click="applyWatermarkSettings">确认</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 数据预览对话框 -->
    <el-dialog v-model="state.showDataPreviewDialog" title="数据预览" width="70%">
      <div style="max-height: 600px; overflow-y: auto;">
        <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px; font-size: 12px; line-height: 1.5;">{{ state.previewDataContent }}</pre>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="state.showDataPreviewDialog = false">关闭</el-button>
          <el-button type="primary" @click="copyDataToClipboard">复制到剪贴板</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 素材管理对话框 -->
    <el-dialog v-model="state.showAssetManagerDialog" title="素材管理" width="70%">
      <div class="asset-manager-actions">
        <input
          ref="assetUploadInputRef"
          type="file"
          accept="image/*"
          class="asset-upload-input"
          @change="handleAssetManagerUpload"
        />
        <el-button size="small" type="primary" @click="triggerAssetManagerUpload">
          上传当前分类素材
        </el-button>
      </div>

      <el-tabs v-model="assetManagerLibrary" class="asset-manager-tabs">
        <el-tab-pane
          v-for="library in assetLibraries"
          :key="library.id"
          :label="library.label"
          :name="library.id"
        >
          <div class="asset-manager-grid">
            <div
              v-for="item in getManagedAssets(library.id)"
              :key="item.id || `${item.name}-${item.avatar}`"
              class="asset-manager-item"
            >
              <div
                class="asset-manager-image"
                :style="{ backgroundImage: `url('${resolveAssetUrl(item.avatar)}')` }"
              />
              <div class="asset-manager-name">{{ item.name }}</div>
              <el-button
                size="small"
                text
                type="danger"
                @click="removeManagedAsset(library.id, item)"
              >
                删除
              </el-button>
            </div>
          </div>
          <el-empty
            v-if="getManagedAssets(library.id).length === 0"
            :description="`暂无${library.label}`"
          />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 规则管理对话框 -->
    <el-dialog v-model="state.showRuleManagerDialog" title="规则管理" width="80%">
      <div class="rule-manager-actions">
        <el-button size="small" type="primary" @click="addExpressionRule">新增规则</el-button>
        <el-button size="small" type="primary" plain @click="addRuleVariable">新增变量</el-button>
        <el-button size="small" @click="exportRuleBundle">导出规则变量</el-button>
        <el-button size="small" @click="triggerRuleBundleImport">导入规则变量</el-button>
        <el-button size="small" @click="reloadRuleManagerDraft">重载当前配置</el-button>
        <el-button size="small" type="success" @click="applyRuleManagerConfig">应用并生效</el-button>
        <el-button size="small" type="warning" plain @click="restoreDefaultRuleConfig">恢复默认</el-button>
        <input
          ref="ruleBundleImportInputRef"
          type="file"
          accept=".json,application/json"
          class="asset-upload-input"
          @change="handleRuleBundleImport"
        />
      </div>

      <el-tabs v-model="ruleManagerTab" class="rule-manager-tabs">
        <el-tab-pane label="规则" name="rules">
          <div class="rule-table-wrap">
            <el-table
              v-if="ruleConfigDraft.expressionRules.length > 0"
              :data="ruleConfigDraft.expressionRules"
              size="small"
              border
              class="rule-table"
            >
              <el-table-column label="启用" width="70" align="center">
                <template #default="{ row }">
                  <el-checkbox v-model="row.enabled" />
                </template>
              </el-table-column>
              <el-table-column label="级别" width="110" align="center">
                <template #default="{ row }">
                  <el-select
                    v-model="row.severity"
                    size="small"
                    :class="['rule-inline-select', 'severity-select', `severity-select--${row.severity || 'warning'}`]"
                  >
                    <el-option label="warning" value="warning" />
                    <el-option label="error" value="error" />
                    <el-option label="info" value="info" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="id" label="规则 ID" min-width="180" show-overflow-tooltip />
              <el-table-column label="条件" min-width="260" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="rule-cell-ellipsis">{{ row.condition }}</span>
                </template>
              </el-table-column>
              <el-table-column label="提示" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">
                  <span class="rule-cell-ellipsis">{{ row.message }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" fixed="right">
                <template #default="{ $index }">
                  <el-button size="small" text type="primary" @click="openExpressionRuleEditor($index)">编辑</el-button>
                  <el-button size="small" text type="danger" @click="removeExpressionRule($index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-else description="暂无规则，点击“新增规则”创建" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="变量" name="variables">
          <div class="variable-list">
            <div
              v-for="(item, index) in ruleConfigDraft.ruleVariables"
              :key="`${item.key}-${index}`"
              class="variable-item"
            >
              <el-form-item label="Key" class="variable-key">
                <el-input v-model="item.key" placeholder="如: fire_supporters" />
              </el-form-item>
              <el-form-item label="Value" class="variable-value">
                <el-input
                  v-model="item.value"
                  type="textarea"
                  :rows="2"
                  placeholder="逗号或换行分隔，如：辉夜姬,座敷童子"
                />
              </el-form-item>
              <el-button size="small" text type="danger" @click="removeRuleVariable(index)">删除</el-button>
            </div>
            <el-empty v-if="ruleConfigDraft.ruleVariables.length === 0" description="暂无变量，点击“新增变量”创建" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="文档说明" name="docs">
          <div class="rule-docs">
            <h4>作用域约定</h4>
            <pre>{{ ruleScopeDoc }}</pre>
            <h4>可用上下文</h4>
            <pre>{{ ruleContextDoc }}</pre>
            <h4>支持语法</h4>
            <pre>{{ ruleSyntaxDoc }}</pre>
            <h4>支持函数</h4>
            <pre>{{ ruleFunctionDoc }}</pre>
            <h4>表达式示例</h4>
            <pre>{{ ruleExamplesDoc }}</pre>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <el-dialog v-model="ruleEditorVisible" title="编辑规则" width="56%">
      <el-form v-if="ruleEditorDraft" label-width="96px" class="rule-editor-form">
        <el-form-item label="启用">
          <el-switch v-model="ruleEditorDraft.enabled" />
        </el-form-item>
        <el-form-item label="规则 ID">
          <el-input v-model="ruleEditorDraft.id" placeholder="unique_rule_id" />
        </el-form-item>
        <el-form-item label="级别">
          <el-select
            v-model="ruleEditorDraft.severity"
            :class="['severity-select', `severity-select--${ruleEditorDraft.severity || 'warning'}`]"
            style="width: 100%"
          >
            <el-option label="warning" value="warning" />
            <el-option label="error" value="error" />
            <el-option label="info" value="info" />
          </el-select>
        </el-form-item>
        <el-form-item label="告警 code">
          <el-input v-model="ruleEditorDraft.code" placeholder="CUSTOM_EXPRESSION" />
        </el-form-item>
        <el-form-item label="条件表达式">
          <el-input
            v-model="ruleEditorDraft.condition"
            type="textarea"
            :rows="3"
            placeholder='示例：count(intersect(map(ctx.team.shikigamis, "name"), getVar("供火式神"))) == 0'
          />
        </el-form-item>
        <el-form-item label="提示文案">
          <el-input v-model="ruleEditorDraft.message" placeholder="规则提示文案" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelRuleEditor">取消</el-button>
          <el-button type="primary" @click="saveRuleEditor">保存</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount, ref } from 'vue';
import updateLogs from "../data/updateLog.json"
import { useFilesStore } from "@/ts/useStore";
import { ElMessageBox } from "element-plus";
import { useGlobalMessage } from "@/ts/useGlobalMessage";
import { getLogicFlowInstance } from "@/ts/useLogicFlow";
import { useCanvasSettings } from '@/ts/useCanvasSettings';
import { useSafeI18n } from '@/ts/useSafeI18n';
import { ASSET_LIBRARIES } from '@/types/nodeTypes';
import type { Pinia } from 'pinia';
import { resolveAssetUrl } from '@/utils/assetUrl';
import {
  createCustomAssetFromFile,
  deleteCustomAsset,
  listCustomAssets,
  subscribeCustomAssetStore,
  type CustomAssetItem
} from '@/utils/customAssets';
import {
  readSharedGroupRulesConfig,
  writeSharedGroupRulesConfig
} from '@/utils/groupRulesConfigSource';
import {
  DEFAULT_GROUP_RULES_CONFIG,
  type GroupRulesConfig,
  type ExpressionRuleDefinition,
  type RuleVariableDefinition
} from '@/configs/groupRules';

const props = withDefaults(defineProps<{
  isEmbed?: boolean;
  piniaInstance?: Pinia;
}>(), {
  isEmbed: false
});

const filesStore = props.piniaInstance ? useFilesStore(props.piniaInstance) : useFilesStore();
const contactImageUrl = resolveAssetUrl('/assets/Other/Contact.png') as string;
const { showMessage } = useGlobalMessage();
const { selectionEnabled, snapGridEnabled, snaplineEnabled } = useCanvasSettings();

const { t } = useSafeI18n({
  import: '导入',
  export: '导出',
  prepareCapture: '准备截图',
  setWatermark: '设置水印',
  loadExample: '加载样例',
  updateLog: '更新日志',
  feedback: '问题反馈'
});

// 定义响应式数据
const state = reactive({
  previewImage: null, // 用于存储预览图像的数据URL
  previewVisible: false, // 控制预览弹窗的显示状态
  showWatermarkDialog: false, // 控制水印设置弹窗的显示状态,
  showUpdateLogDialog: false, // 控制更新日志对话框的显示状态
  showFeedbackFormDialog: false, // 控制反馈表单对话框的显示状态
  showDataPreviewDialog: false, // 控制数据预览对话框的显示状态
  showAssetManagerDialog: false, // 控制素材管理对话框的显示状态
  showRuleManagerDialog: false, // 控制规则管理对话框的显示状态
  previewDataContent: '', // 存储预览的数据内容
});
const assetLibraries = ASSET_LIBRARIES.map((item) => ({
  id: item.id,
  label: `${item.label}素材`
}));
const assetManagerLibrary = ref(assetLibraries[0]?.id || 'shikigami');
const assetUploadInputRef = ref<HTMLInputElement | null>(null);
const ruleBundleImportInputRef = ref<HTMLInputElement | null>(null);
const managedAssets = reactive<Record<string, CustomAssetItem[]>>({});
assetLibraries.forEach((item) => {
  managedAssets[item.id] = [];
});
let unsubscribeAssetStore: (() => void) | null = null;

const ruleManagerTab = ref<'rules' | 'variables' | 'docs'>('rules');

const cloneRuleConfig = (config: GroupRulesConfig): GroupRulesConfig => ({
  version: config.version,
  fireShikigamiWhitelist: [...config.fireShikigamiWhitelist],
  shikigamiYuhunBlacklist: config.shikigamiYuhunBlacklist.map((rule) => ({ ...rule })),
  shikigamiConflictPairs: config.shikigamiConflictPairs.map((rule) => ({ ...rule })),
  expressionRules: config.expressionRules.map((rule) => ({ ...rule })),
  ruleVariables: config.ruleVariables.map((item) => ({ ...item }))
});

const createExpressionRule = (): ExpressionRuleDefinition => ({
  id: `rule_${Date.now()}`,
  enabled: true,
  severity: 'warning',
  code: 'CUSTOM_EXPRESSION',
  condition: 'false',
  message: '请补充规则提示文案'
});

const createRuleVariable = (): RuleVariableDefinition => ({
  key: `var_${Date.now()}`,
  value: ''
});

const ruleConfigDraft = ref<GroupRulesConfig>(cloneRuleConfig(readSharedGroupRulesConfig()));
const ruleEditorVisible = ref(false);
const editingRuleIndex = ref<number | null>(null);
const ruleEditorDraft = ref<ExpressionRuleDefinition | null>(null);

const cloneExpressionRule = (rule: ExpressionRuleDefinition): ExpressionRuleDefinition => ({
  id: rule.id || `rule_${Date.now()}`,
  enabled: rule.enabled !== false,
  severity: rule.severity || 'warning',
  code: rule.code || 'CUSTOM_EXPRESSION',
  condition: rule.condition || 'false',
  message: rule.message || '请补充规则提示文案'
});

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');
const normalizeSeverity = (value: unknown): 'warning' | 'error' | 'info' => {
  return value === 'error' || value === 'info' ? value : 'warning';
};
const normalizeImportedExpressionRules = (value: unknown): ExpressionRuleDefinition[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const raw = item as Record<string, unknown>;
      const id = normalizeText(raw.id);
      const condition = normalizeText(raw.condition);
      const message = normalizeText(raw.message);
      if (!id || !condition || !message) return null;
      const code = normalizeText(raw.code);
      return {
        id,
        condition,
        message,
        enabled: raw.enabled !== false,
        severity: normalizeSeverity(raw.severity),
        ...(code ? { code } : {})
      };
    })
    .filter((item): item is ExpressionRuleDefinition => !!item);
};
const normalizeImportedRuleVariables = (value: unknown): RuleVariableDefinition[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const raw = item as Record<string, unknown>;
      const key = normalizeText(raw.key);
      if (!key) return null;
      const variableValue = typeof raw.value === 'string' ? raw.value : String(raw.value ?? '');
      return { key, value: variableValue };
    })
    .filter((item): item is RuleVariableDefinition => !!item);
};

const ruleScopeDoc = `规则新增字段（建议）: scopeKind
- team: 在队伍组(dynamic-group: team)上执行（当前已生效）
- shikigami: 在式神组(dynamic-group: shikigami)上执行（规划中，当前未生效）

注意
- scopeKind 决定“规则运行上下文”
- 告警点击定位固定为：触发该规则的 dynamic-group`;

const ruleContextDoc = `当 scopeKind = "team"（队伍规则）
ctx.team.shikigamis: 式神数组
- 单项示例: { nodeId: "n1", assetId: "sp_kaguya", name: "辉夜姬", library: "shikigami" }

ctx.team.yuhuns: 御魂数组
- 单项示例: { nodeId: "n2", assetId: "p4_poshi", name: "破势", library: "yuhun" }

ctx.group.id / ctx.group.name
- 示例: "team-1" / "冲榜队A"

当 scopeKind = "shikigami"（式神规则，规划中，当前未生效）
ctx.unit.shikigami: 当前式神对象（单个）
- 示例: { nodeId: "n1", assetId: "sp_kaguya", name: "辉夜姬", library: "shikigami" }

ctx.unit.yuhuns: 当前式神关联御魂数组
- 单项示例: { nodeId: "n2", assetId: "p4_poshi", name: "破势", library: "yuhun" }

通用共享变量
shared.vars（变量 tab 配置后的 key/value 映射）
- 示例:
  shared.vars["供火式神"] = ["辉夜姬", "座敷童子"]
  shared.vars["输出式神"] = ["阿修罗", "茨木童子"]`;

const ruleFunctionDoc = `count(value)
- 用途: 计算数量（数组长度 / 字符串长度）
- team 示例: count(ctx.team.shikigamis) >= 5
- shikigami 示例: count(ctx.unit.yuhuns) >= 1

contains(collection, target)
- 用途: 判断集合或字符串是否包含目标值
- team 示例: contains(map(ctx.team.shikigamis, "name"), "辉夜姬")

intersect(leftArray, rightArray)
- 用途: 取数组交集（去重）
- team 示例: count(intersect(map(ctx.team.shikigamis, "name"), getVar("供火式神"))) > 0

map(collection, "fieldName")
- 用途: 提取对象数组字段
- team 示例: map(ctx.team.shikigamis, "name")
- shikigami 示例: map(ctx.unit.yuhuns, "name")

unique(collection)
- 用途: 数组去重
- team 示例: count(unique(map(ctx.team.yuhuns, "name"))) >= 2

exists(value)
- 用途: 判断值是否存在（非 null/空串；数组需长度>0）
- 示例: exists(getVar("核心式神"))

lower(value) / upper(value)
- 用途: 字符串大小写转换
- 示例: contains(lower("PoShi"), "poshi")

getVar("变量Key")
- 用途: 获取变量 tab 里配置的值（通常返回字符串数组）
- 示例: getVar("供火式神")`;

const ruleSyntaxDoc = `支持
- 字面量: "文本" / 数字 / true / false / null
- 数组: ["辉夜姬", "座敷童子"]
- 路径: ctx.team.shikigamis / ctx.unit.shikigami / shared.vars
- 函数调用: count(...), contains(...), intersect(...), map(...)
- 逻辑运算: && || !
- 比较运算: == != > >= < <=
- 算术运算: + - * /
- 括号: ( ... )

不支持
- index 语法（如 getIndexOf / arr[0]）
- 自定义遍历语法（for/while/foreach）
- 自定义函数定义
- 赋值语句
- eval/new Function`;

const ruleExamplesDoc = `1) [team] 队伍至少有一个供火式神
count(intersect(map(ctx.team.shikigamis, "name"), getVar("供火式神"))) > 0

2) [team] 队伍里不能同时出现千姬和腹肌清姬
contains(map(ctx.team.shikigamis, "name"), "千姬") && contains(map(ctx.team.shikigamis, "name"), "腹肌清姬")

3) [team] 队伍御魂至少 2 种（避免全员同御魂）
count(unique(map(ctx.team.yuhuns, "name"))) >= 2

4) [规划中的 shikigami scope] 当前式神是辉夜姬且其关联御魂包含破势
ctx.unit.shikigami.name == "辉夜姬" && contains(map(ctx.unit.yuhuns, "name"), "破势")`;

const refreshManagedAssets = (library?: string) => {
  if (library) {
    managedAssets[library] = listCustomAssets(library);
    return;
  }
  assetLibraries.forEach((item) => {
    managedAssets[item.id] = listCustomAssets(item.id);
  });
};

const openAssetManager = () => {
  refreshManagedAssets();
  state.showAssetManagerDialog = true;
};

const reloadRuleManagerDraft = () => {
  ruleConfigDraft.value = cloneRuleConfig(readSharedGroupRulesConfig());
  cancelRuleEditor();
};

const openRuleManager = () => {
  reloadRuleManagerDraft();
  ruleManagerTab.value = 'rules';
  state.showRuleManagerDialog = true;
  ruleEditorVisible.value = false;
  editingRuleIndex.value = null;
  ruleEditorDraft.value = null;
};

const exportRuleBundle = () => {
  try {
    const payload = {
      version: ruleConfigDraft.value.version,
      expressionRules: ruleConfigDraft.value.expressionRules,
      ruleVariables: ruleConfigDraft.value.ruleVariables
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `rule-bundle-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showMessage('success', '规则变量已导出');
  } catch (error) {
    console.error('导出规则变量失败:', error);
    showMessage('error', '导出失败');
  }
};

const triggerRuleBundleImport = () => {
  ruleBundleImportInputRef.value?.click();
};

const handleRuleBundleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  const file = target?.files?.[0];
  if (!file) {
    if (target) target.value = '';
    return;
  }

  try {
    const rawText = await file.text();
    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const importedRules = normalizeImportedExpressionRules(parsed.expressionRules);
    const importedVariables = normalizeImportedRuleVariables(parsed.ruleVariables);
    if (!importedRules.length && !importedVariables.length) {
      showMessage('warning', '导入文件中没有可用的规则或变量');
      return;
    }
    ruleConfigDraft.value = {
      ...ruleConfigDraft.value,
      expressionRules: importedRules,
      ruleVariables: importedVariables
    };
    cancelRuleEditor();
    showMessage('success', '规则变量已导入，请点击“应用并生效”');
  } catch (error) {
    console.error('导入规则变量失败:', error);
    showMessage('error', '导入失败，文件格式错误');
  } finally {
    if (target) target.value = '';
  }
};

const addExpressionRule = () => {
  const newRule = createExpressionRule();
  ruleConfigDraft.value.expressionRules.push(newRule);
  openExpressionRuleEditor(ruleConfigDraft.value.expressionRules.length - 1);
  ruleManagerTab.value = 'rules';
};

const removeExpressionRule = (index: number) => {
  if (editingRuleIndex.value === index) {
    cancelRuleEditor();
  }
  ruleConfigDraft.value.expressionRules.splice(index, 1);
  if (editingRuleIndex.value != null && editingRuleIndex.value > index) {
    editingRuleIndex.value -= 1;
  }
};

const openExpressionRuleEditor = (index: number) => {
  const target = ruleConfigDraft.value.expressionRules[index];
  if (!target) return;
  editingRuleIndex.value = index;
  ruleEditorDraft.value = cloneExpressionRule(target);
  ruleEditorVisible.value = true;
};

const cancelRuleEditor = () => {
  ruleEditorVisible.value = false;
  editingRuleIndex.value = null;
  ruleEditorDraft.value = null;
};

const saveRuleEditor = () => {
  const index = editingRuleIndex.value;
  const draft = ruleEditorDraft.value;
  if (index == null || !draft) {
    return;
  }
  const ruleId = draft.id?.trim();
  const condition = draft.condition?.trim();
  const message = draft.message?.trim();
  if (!ruleId || !condition || !message) {
    showMessage('warning', '规则 ID、条件表达式、提示文案不能为空');
    return;
  }
  const normalized = cloneExpressionRule({
    ...draft,
    id: ruleId,
    condition,
    message
  });
  ruleConfigDraft.value.expressionRules[index] = normalized;
  cancelRuleEditor();
};

const addRuleVariable = () => {
  ruleConfigDraft.value.ruleVariables.push(createRuleVariable());
  ruleManagerTab.value = 'variables';
};

const removeRuleVariable = (index: number) => {
  ruleConfigDraft.value.ruleVariables.splice(index, 1);
};

const applyRuleManagerConfig = () => {
  try {
    const normalized = writeSharedGroupRulesConfig(ruleConfigDraft.value);
    ruleConfigDraft.value = cloneRuleConfig(normalized);
    showMessage('success', '规则配置已生效');
  } catch (error) {
    console.error('应用规则配置失败:', error);
    showMessage('error', '规则配置应用失败');
  }
};

const restoreDefaultRuleConfig = () => {
  ElMessageBox.confirm('恢复默认会覆盖当前规则和变量，是否继续？', '提示', {
    confirmButtonText: '恢复默认',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const normalized = writeSharedGroupRulesConfig(DEFAULT_GROUP_RULES_CONFIG);
    ruleConfigDraft.value = cloneRuleConfig(normalized);
    cancelRuleEditor();
    showMessage('success', '已恢复默认规则配置');
  }).catch(() => {
    // 用户取消
  });
};

const getManagedAssets = (libraryId: string) => {
  return managedAssets[libraryId] || [];
};

const triggerAssetManagerUpload = () => {
  assetUploadInputRef.value?.click();
};

const handleAssetManagerUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  const file = target?.files?.[0];
  if (!file) {
    if (target) target.value = '';
    return;
  }

  try {
    await createCustomAssetFromFile(assetManagerLibrary.value, file);
    refreshManagedAssets(assetManagerLibrary.value);
    showMessage('success', '素材上传成功');
  } catch (error) {
    console.error('素材上传失败:', error);
    showMessage('error', '素材上传失败');
  } finally {
    if (target) target.value = '';
  }
};

const removeManagedAsset = (libraryId: string, item: CustomAssetItem) => {
  deleteCustomAsset(libraryId, item);
  refreshManagedAssets(libraryId);
};

// 重新渲染 LogicFlow 画布的通用方法
const refreshLogicFlowCanvas = (message?: string) => {
  setTimeout(() => {
    const logicFlowInstance = getLogicFlowInstance();
    if (logicFlowInstance) {
      // 获取当前活动文件的数据
      const currentFileData = filesStore.getTab(filesStore.activeFileId);
      if (currentFileData) {
        // 清空画布并重新渲染
        logicFlowInstance.clearData();
        // 注意：此处根据你的画布 API 传入 graphRawData 或整个文件数据
        const data = (currentFileData as any).graphRawData || currentFileData;
        logicFlowInstance.render(data);
        console.log(message || 'LogicFlow 画布已重新渲染');
      }
    }
  }, 100); // 延迟一点确保数据更新完成
};

const loadExample = () => {
  ElMessageBox.confirm(
      '加载样例会覆盖当前数据，是否覆盖？',
      '提示',
      {
        confirmButtonText: '覆盖',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    // 使用默认状态作为示例
    const defaultState = {
      fileList: [{
        "label": "示例文件",
        "name": "example",
        "visible": true,
        "type": "FLOW",
        "groups": [
          {
            "shortDescription": "示例组",
            "groupInfo": [{}, {}, {}, {}, {}],
            "details": "这是一个示例文件"
          }
        ],
        "flowData": {
          "nodes": [],
          "edges": [],
          "viewport": { "x": 0, "y": 0, "zoom": 1 }
        }
      }],
      activeFile: "example"
    };
    filesStore.importData(defaultState);
    refreshLogicFlowCanvas('LogicFlow 画布已重新渲染（示例数据）');
    showMessage('success', '数据已恢复');
  }).catch(() => {
    showMessage('info', '选择了不恢复旧数据');
  });
}

const CURRENT_APP_VERSION = updateLogs[0].version;
const showUpdateLog = () => {
  state.showUpdateLogDialog = !state.showUpdateLogDialog;
};

onMounted(() => {
  refreshManagedAssets();
  unsubscribeAssetStore = subscribeCustomAssetStore(() => {
    refreshManagedAssets();
  });

  if (props.isEmbed) {
    return;
  }

  const lastVersion = localStorage.getItem('appVersion');

  if (lastVersion !== CURRENT_APP_VERSION) {
    // 如果版本号不同，则显示更新日志对话框
    state.showUpdateLogDialog = true;
    // 更新本地存储中的版本号为当前版本
    localStorage.setItem('appVersion', CURRENT_APP_VERSION);
  }
});

onBeforeUnmount(() => {
  unsubscribeAssetStore?.();
  unsubscribeAssetStore = null;
});


const showFeedbackForm = () => {
  state.showFeedbackFormDialog = !state.showFeedbackFormDialog;
};

const handleExport = () => {
  // 导出前先更新当前数据，确保不丢失最新修改
  filesStore.updateTab();

  // 延迟一点确保更新完成后再导出
  setTimeout(() => {
    filesStore.exportData();
  }, 2000);
};

const handlePreviewData = () => {
  // 预览前先更新当前数据
  filesStore.updateTab();

  // 延迟一点确保更新完成后再预览
  setTimeout(() => {
    try {
      const activeName = filesStore.fileList.find(f => f.id === filesStore.activeFileId)?.name || '';
      const dataObj = {
        schemaVersion: 1,
        fileList: filesStore.fileList,
        activeFileId: filesStore.activeFileId,
        activeFile: activeName,
      };
      state.previewDataContent = JSON.stringify(dataObj, null, 2);
      state.showDataPreviewDialog = true;
    } catch (error) {
      console.error('生成预览数据失败:', error);
      showMessage('error', '数据预览失败');
    }
  }, 100);
};

const copyDataToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(state.previewDataContent);
    showMessage('success', '已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    showMessage('error', '复制失败');
  }
};

const handleImport = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const target = e.target as FileReader;
          const data = JSON.parse(target.result as string);
          filesStore.importData(data);
          refreshLogicFlowCanvas('LogicFlow 画布已重新渲染（导入数据）');
        } catch (error) {
          console.error('Failed to import file', error);
          showMessage('error', '文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const handleResetWorkspace = () => {
  ElMessageBox.confirm('确定重置当前工作区？该操作不可撤销', '提示', {
    confirmButtonText: '重置',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    filesStore.resetWorkspace();
  }).catch(() => {
    // 用户取消
  });
};

const handleClearCanvas = () => {
  ElMessageBox.confirm('仅清空当前画布，不影响其他文件，确定继续？', '提示', {
    confirmButtonText: '清空',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const lfInstance = getLogicFlowInstance();
    const activeId = filesStore.activeFileId;
    const activeFile = filesStore.getTab(activeId);

    if (lfInstance) {
      lfInstance.clearData();
      lfInstance.render({ nodes: [], edges: [] });
      lfInstance.zoom(1, [0, 0]);
    }

    if (activeFile) {
      activeFile.graphRawData = { nodes: [], edges: [] };
      activeFile.transform = {
        SCALE_X: 1,
        SCALE_Y: 1,
        TRANSLATE_X: 0,
        TRANSLATE_Y: 0
      };
      filesStore.updateTab(activeId);
    }

    showMessage('success', '当前画布已清空');
  }).catch(() => {
    // 用户取消
  });
};

const watermark = reactive({
  text: localStorage.getItem('watermark.text') || '示例水印',
  fontSize: Number(localStorage.getItem('watermark.fontSize')) || 30,
  color: localStorage.getItem('watermark.color') || 'rgba(184, 184, 184, 0.3)',
  angle: Number(localStorage.getItem('watermark.angle')) || -20,
  rows: Number(localStorage.getItem('watermark.rows')) || 1,
  cols: Number(localStorage.getItem('watermark.cols')) || 1,
});

const applyWatermarkSettings = () => {
  // 保存水印设置到 localStorage
  localStorage.setItem('watermark.text', watermark.text);
  localStorage.setItem('watermark.fontSize', String(watermark.fontSize));
  localStorage.setItem('watermark.color', watermark.color);
  localStorage.setItem('watermark.angle', String(watermark.angle));
  localStorage.setItem('watermark.rows', String(watermark.rows));
  localStorage.setItem('watermark.cols', String(watermark.cols));

  state.showWatermarkDialog = false;
};


const addWatermarkToImage = (base64: string) => {
  const rows = Math.max(1, Number(watermark.rows) || 1);
  const cols = Math.max(1, Number(watermark.cols) || 1);
  const angle = (Number(watermark.angle) * Math.PI) / 180;

  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) {
        reject(new Error('无法创建画布上下文'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      ctx.font = `${watermark.fontSize}px sans-serif`;
      ctx.fillStyle = watermark.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const rowStep = canvas.height / rows;
      const colStep = canvas.width / cols;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c + 0.5) * colStep;
          const y = (r + 0.5) * rowStep;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle);
          ctx.fillText(watermark.text, 0, 0);
          ctx.restore();
        }
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('快照加载失败'));
    img.src = base64;
  });
};

const waitForNextPaint = () => {
  return new Promise<void>((resolve) => {
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
      resolve();
      return;
    }
    window.requestAnimationFrame(() => resolve());
  });
};

const withDynamicGroupsHiddenForSnapshot = async <T>(
  logicFlowInstance: any,
  runner: () => Promise<T>,
): Promise<T> => {
  const graphModel = logicFlowInstance?.graphModel;
  const dynamicGroupModels = (graphModel?.nodes ?? []).filter(
    (node: any) => node?.type === 'dynamic-group',
  );

  if (!dynamicGroupModels.length) {
    return runner();
  }

  const previousStates = dynamicGroupModels.map((model: any) => ({
    model,
    visible: model.visible,
  }));

  try {
    previousStates.forEach(({ model }) => {
      model.visible = false;
    });
    await waitForNextPaint();
    return await runner();
  } finally {
    previousStates.forEach(({ model, visible }) => {
      model.visible = visible;
    });
    await waitForNextPaint();
  }
};

const captureLogicFlowSnapshot = async () => {
  const logicFlowInstance = getLogicFlowInstance() as any;
  if (!logicFlowInstance || typeof logicFlowInstance.getSnapshotBase64 !== 'function') {
    showMessage('error', '未找到 LogicFlow 实例，无法截图');
    return null;
  }

  const snapshotResult = await withDynamicGroupsHiddenForSnapshot(
    logicFlowInstance,
    () => logicFlowInstance.getSnapshotBase64(
      undefined,
      undefined,
      {
        fileType: 'png',
        backgroundColor: '#ffffff',
        partial: false,
        padding: 20,
      },
    ),
  );

  const base64 = typeof snapshotResult === 'string' ? snapshotResult : snapshotResult?.data;
  if (!base64) {
    showMessage('error', '未获取到截图数据');
    return null;
  }

  return addWatermarkToImage(base64);
};

const prepareCapture = async () => {
  try {
    const img = await captureLogicFlowSnapshot();
    if (!img) return;
    state.previewImage = img;
    state.previewVisible = true;
  } catch (e) {
    showMessage('error', '截图失败: ' + (e?.message || e));
  }
};

const downloadImage = () => {
  if (state.previewImage) {
    const link = document.createElement('a');
    link.href = state.previewImage;
    link.download = 'screenshot.png';
    link.click();
    state.previewVisible = false;
  }
};

const handleClose = (done) => {
  state.previewImage = null; // 清除预览图像
  done(); // 关闭弹窗
};
</script>

<style scoped>
.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  min-height: 48px;
  background: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 0 8px;
  z-index: 100;
  box-sizing: border-box;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.toolbar--embed {
  position: relative;
  top: auto;
  left: auto;
  right: auto;
  height: auto;
  padding: 6px 8px;
  border-bottom: 1px solid #e4e7ed;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 0;
  flex-shrink: 0;
}

.toolbar--embed .toolbar-actions {
  flex-wrap: nowrap;
}

.title {
  flex-grow: 1;
  text-align: center;
  font-size: 16px;
}

.left, .right {
  flex-basis: 120px;
  display: flex;
  gap: 8px;
}

.asset-manager-actions {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.asset-upload-input {
  display: none;
}

.asset-manager-tabs {
  min-height: 360px;
}

.asset-manager-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.asset-manager-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.asset-manager-image {
  width: 80px;
  height: 80px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.asset-manager-name {
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #303133;
  word-break: break-all;
}

.rule-manager-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.rule-manager-tabs {
  min-height: 420px;
}

.rule-table-wrap,
.variable-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.variable-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  background: #fafafa;
}

.rule-table :deep(.el-table__cell) {
  padding-top: 6px;
  padding-bottom: 6px;
}

.rule-inline-select {
  width: 100%;
}

.severity-select--warning :deep(.el-input__wrapper) {
  background: #fff7ed;
  box-shadow: inset 0 0 0 1px #fed7aa;
}

.severity-select--warning :deep(.el-input__inner) {
  color: #9a3412;
}

.severity-select--error :deep(.el-input__wrapper) {
  background: #fef2f2;
  box-shadow: inset 0 0 0 1px #fecaca;
}

.severity-select--error :deep(.el-input__inner) {
  color: #b91c1c;
}

.severity-select--info :deep(.el-input__wrapper) {
  background: #eff6ff;
  box-shadow: inset 0 0 0 1px #bfdbfe;
}

.severity-select--info :deep(.el-input__inner) {
  color: #1d4ed8;
}

.rule-cell-ellipsis {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rule-editor-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.variable-item {
  display: grid;
  grid-template-columns: 220px 1fr auto;
  gap: 12px;
  align-items: start;
}

.variable-key,
.variable-value {
  margin-bottom: 0;
}

.rule-docs {
  max-height: 460px;
  overflow-y: auto;
  padding-right: 4px;
}

.rule-docs h4 {
  margin: 6px 0;
  color: #303133;
}

.rule-docs pre {
  margin: 0 0 12px;
  padding: 10px;
  border-radius: 6px;
  background: #f5f7fa;
  color: #606266;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 900px) {
  .variable-item {
    grid-template-columns: 1fr;
  }
}
</style>
