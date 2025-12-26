<template>
  <div class="toolbar">
    <div>
      <el-button icon="Upload" type="primary" @click="handleImport">{{ t('import') }}</el-button>
      <el-button icon="Download" type="primary" @click="handleExport">{{ t('export') }}</el-button>
      <el-button icon="Share" type="primary" @click="prepareCapture">{{ t('prepareCapture') }}</el-button>
      <el-button icon="Setting" type="primary" @click="state.showWatermarkDialog = true">{{ t('setWatermark') }}</el-button>
      <el-button type="info" @click="loadExample">{{ t('loadExample') }}</el-button>
      <el-button type="info" @click="showUpdateLog">{{ t('updateLog') }}</el-button>
      <el-button type="warning" @click="showFeedbackForm">{{ t('feedback') }}</el-button>
      <el-button type="danger" @click="handleResetWorkspace">重置工作区</el-button>
    </div>

    <!-- 更新日志对话框 -->
    <el-dialog v-model="state.showUpdateLogDialog" title="更新日志" width="60%">
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
    <el-dialog v-model="state.showFeedbackFormDialog" title="更新日志" width="60%">
      <span style="font-size: 24px;">备注阴阳师</span>
      <br/>
      <img src="/assets/Other/Contact.png"
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

  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import updateLogs from "../data/updateLog.json"
import { useFilesStore } from "@/ts/useStore";
import { ElMessageBox } from "element-plus";
import { useGlobalMessage } from "@/ts/useGlobalMessage";
import { getLogicFlowInstance } from "@/ts/useLogicFlow";

const filesStore = useFilesStore();
const { showMessage } = useGlobalMessage();

// 获取当前的 i18n 实例
const {t} = useI18n();

// 定义响应式数据
const state = reactive({
  previewImage: null, // 用于存储预览图像的数据URL
  previewVisible: false, // 控制预览弹窗的显示状态
  showWatermarkDialog: false, // 控制水印设置弹窗的显示状态,
  showUpdateLogDialog: false, // 控制更新日志对话框的显示状态
  showFeedbackFormDialog: false, // 控制反馈表单对话框的显示状态
});

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
  const lastVersion = localStorage.getItem('appVersion');

  if (lastVersion !== CURRENT_APP_VERSION) {
    // 如果版本号不同，则显示更新日志对话框
    state.showUpdateLogDialog = true;
    // 更新本地存储中的版本号为当前版本
    localStorage.setItem('appVersion', CURRENT_APP_VERSION);
  }
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
          // refreshLogicFlowCanvas('LogicFlow 画布已重新渲染（导入数据）');
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

const captureLogicFlowSnapshot = async () => {
  const logicFlowInstance = getLogicFlowInstance() as any;
  if (!logicFlowInstance || typeof logicFlowInstance.getSnapshotBase64 !== 'function') {
    showMessage('error', '未找到 LogicFlow 实例，无法截图');
    return null;
  }

  const snapshotResult = await logicFlowInstance.getSnapshotBase64(
    undefined,
    undefined,
    {
      fileType: 'png',
      backgroundColor: '#ffffff',
      partial: false,
      padding: 20,
    },
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
  height: 48px;
  background: #f8f8f8;
  align-items: center;
  padding: 0 8px;
  z-index: 100;
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
</style>
