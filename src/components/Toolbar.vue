<template>
  <div class="toolbar">
    <div>
      <el-button icon="Upload" type="primary" @click="handleImport">{{ t('import') }}</el-button>
      <el-button icon="Download" type="primary" @click="handleExport">{{ t('export') }}</el-button>
      <el-button icon="Share" type="primary" @click="prepareCapture">{{ t('prepareCapture') }}</el-button>
      <el-button icon="Setting" type="primary" @click="state.showWatermarkDialog = true">{{
          t('setWatermark')
        }}
      </el-button>
      <!-- 新增的按钮 -->
      <el-button type="info" @click="showUpdateLog">更新日志</el-button>
      <el-button type="warning" @click="showFeedbackForm">问题反馈</el-button>
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

    <!-- 更新日志对话框 -->
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
import {ref, reactive} from 'vue';
import html2canvas from "html2canvas";
import {useI18n} from 'vue-i18n';
import updateLogs from "../data/updateLog.json"
import {useFilesStore} from "@/ts/files";

const filesStore = useFilesStore();

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


const showUpdateLog = () => {
  state.showUpdateLogDialog = !state.showUpdateLogDialog;
};

const showFeedbackForm = () => {
  state.showFeedbackFormDialog = !state.showFeedbackFormDialog;
};

const handleExport = () => {
  const dataStr = JSON.stringify(filesStore.fileList, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'files.json';
  link.click();
  URL.revokeObjectURL(url);
};

const handleImport = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result as string);
          if (data[0].visible === true) {
            // 新版本格式：直接替换 fileList
            filesStore.$patch({ fileList: data });
          } else  {
            // 旧版本格式：仅包含 groups 数组
            const newFile = {
              label: `File ${filesStore.fileList.length + 1}`,
              name: String(filesStore.fileList.length + 1),
              visible: true,
              groups: data
            };
            filesStore.addFile(newFile);
          }
        } catch (error) {
          console.error('Failed to import file', error);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const watermark = reactive({
  text: '示例水印',
  fontSize: 30,
  color: 'rgba(184, 184, 184, 0.3)',
  angle: -20,
  rows: 1,  // 新增行数
  cols: 1   // 新增列数
});

const applyWatermarkSettings = () => {
  state.showWatermarkDialog = false;
};

// 计算视觉总高度
function calculateVisualHeight(selector) {
  // 1. 获取所有目标元素
  const elements = Array.from(document.querySelectorAll(selector));

  // 2. 获取元素位置信息并排序
  const rects = elements.map(el => {
    const rect = el.getBoundingClientRect();
    return {
      el,
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height
    };
  }).sort((a, b) => a.top - b.top); // 按垂直位置排序

  // 3. 动态分组同行元素
  const rows = [];
  rects.forEach(rect => {
    let placed = false;

    // 尝试将元素加入已有行
    for (const row of rows) {
      if (
          rect.top < row.bottom &&  // 元素顶部在行底部上方
          rect.bottom > row.top     // 元素底部在行顶部下方
      ) {
        row.elements.push(rect);
        row.bottom = Math.max(row.bottom, rect.bottom); // 扩展行底部
        row.maxHeight = Math.max(row.maxHeight, rect.height);
        placed = true;
        break;
      }
    }

    // 未加入则创建新行
    if (!placed) {
      rows.push({
        elements: [rect],
        top: rect.top,
        bottom: rect.bottom,
        maxHeight: rect.height
      });
    }
  });

  // 4. 累加每行最大高度
  return rows.reduce((sum, row) => sum + row.maxHeight, 0);
}

const ignoreElements = (element) => {
  return element.classList.contains('ql-toolbar') || element.classList.contains('el-tabs__header');
};

const prepareCapture = async () => {
  state.previewVisible = true;

  // 创建临时样式
  const style = document.createElement('style');
  style.textContent = `.ql-container.ql-snow { border: none !important; }`;
  document.head.appendChild(style);

  // 获取目标元素
  const element = document.querySelector('#main-container');
  if (!element) {
    console.error('Element not found');
    return;
  }

  // 保存原始 overflow 样式
  const originalOverflow = element.style.overflow;

  try {
    // 临时隐藏 overflow 样式
    element.style.overflow = 'visible';

    // 计算需要忽略的元素高度
    let totalHeight = calculateVisualHeight('[data-html2canvas-ignore]') + calculateVisualHeight('.ql-toolbar');
    console.log('所有携带指定属性的元素高度之和:', totalHeight);

    console.log('主元素宽度', element.scrollWidth);
    console.log('主元素高度', element.scrollHeight);

    // 1. 生成原始截图
    const canvas = await html2canvas(element, {
      ignoreElements: ignoreElements,
      scrollX: 0,
      scrollY: 0,
      width: element.scrollWidth,
      height: element.scrollHeight - totalHeight,
    });

    // 2. 创建新Canvas添加水印
    const watermarkedCanvas = document.createElement('canvas');
    const ctx = watermarkedCanvas.getContext('2d');

    // 设置新Canvas尺寸
    watermarkedCanvas.width = canvas.width;
    watermarkedCanvas.height = canvas.height;

    // 绘制原始截图
    ctx.drawImage(canvas, 0, 0);

    // 添加水印
    ctx.font = `${watermark.fontSize}px Arial`;
    ctx.fillStyle = watermark.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 计算每个水印的位置间隔
    const colSpace = watermarkedCanvas.width / (watermark.cols + 1);
    const rowSpace = watermarkedCanvas.height / (watermark.rows + 1);

    // 保存原始画布状态
    ctx.save();

    // 循环绘制多个水印
    for (let row = 1; row <= watermark.rows; row++) {
      for (let col = 1; col <= watermark.cols; col++) {
        ctx.save(); // 保存当前状态
        const x = col * colSpace;
        const y = row * rowSpace;

        // 移动到目标位置并旋转
        ctx.translate(x, y);
        ctx.rotate((watermark.angle * Math.PI) / 180);

        // 绘制水印文字
        ctx.fillText(watermark.text, 0, 0);
        ctx.restore(); // 恢复状态
      }
    }

    ctx.restore(); // 恢复原始状态

    // 3. 存储带水印的图片
    state.previewImage = watermarkedCanvas.toDataURL();
  } catch (error) {
    console.error('Capture failed', error);
  } finally {
    // 恢复原始 overflow 样式
    element.style.overflow = originalOverflow;

    // 移除临时样式
    document.head.removeChild(style);
  }
};

const downloadImage = () => {
  if (state.previewImage) {
    const link = document.createElement('a');
    link.href = state.previewImage;
    link.download = 'screenshot.png'; // 设置下载的文件名
    link.click();
    state.previewVisible = false; // 关闭预览弹窗
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