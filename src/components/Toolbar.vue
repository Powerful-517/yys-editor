<template>
  <div class="toolbar">
    <div data-html2canvas-ignore="true">
      <el-button icon="Upload" type="primary" @click="prepareCapture">{{ t('import') }}</el-button>
      <el-button icon="Download" type="primary" @click="prepareCapture">{{ t('export') }}</el-button>
      <el-button icon="Share" type="primary" @click="prepareCapture">{{ t('prepareCapture') }}</el-button>
      <el-button icon="Setting" type="primary" @click="prepareCapture">{{ t('setWatermark') }}</el-button>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog id="preview-container" v-model="state.previewVisible" width="80%" :before-close="handleClose">
      <div style="max-height: 500px; overflow-y: auto;">
        <Watermark text="示例水印" font="30px Arial" color="rgba(184, 184, 184, 0.3)" angle=-20>

          <img v-if="state.previewImage" :src="state.previewImage" alt="Preview" style="width: 100%; display: block;"/>
        </Watermark>
      </div>
      <!--      <img v-if="state.previewImage" :src="state.previewImage" alt="Preview" style="width: 100%; height: auto;" />-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="state.previewVisible = false">取 消</el-button>
        <el-button type="primary" @click="downloadImage">下 载</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import {inject, nextTick} from 'vue';
import html2canvas from "html2canvas";
import {useI18n} from 'vue-i18n'
import Watermark from './Watermark.vue' // 引入 Watermark 组件

// 获取当前的 i18n 实例
const {t} = useI18n()

// 注入水印控制方法
const watermarkControl = inject('watermarkControl');

defineProps({
  title: {
    type: String,
    default: '默认标题'
  }
})

import {ref, reactive, toRefs} from 'vue';

// 定义响应式数据
const state = reactive({
  previewImage: null, // 用于存储预览图像的数据URL
  previewVisible: false, // 控制预览弹窗的显示状态
});

const ignoreElements = (element) => {
  return element.classList.contains('ql-toolbar');
}
const prepareCapture = async () => {
  state.previewVisible = true; // 显示预览弹窗

  // 创建临时样式
  const style = document.createElement('style')
  style.id = 'capture-style'
  style.textContent = `
    .ql-container.ql-snow {
      border: none !important;
    }
  `
  document.head.appendChild(style)
  // 捕获页面元素并生成图片
  try {
    const element = document.querySelector('#main-container'); // 替换为要捕获的元素选择器
    if (!element) {
      console.error('Element with ID "main-container" not found.');
      state.previewVisible = false;
      return;
    }

    const canvas = await html2canvas(element, {
          ignoreElements: ignoreElements,
          height: element.scrollHeight,
        }
    );
    state.previewImage = canvas.toDataURL();
    if (!state.previewImage) {
      console.error('Failed to generate image data URL.');
      state.previewVisible = false;
      state.previewVisible = false;
    }
  } catch (error) {
    console.error('Failed to capture screenshot', error);
    state.previewVisible = false;
  } finally {
    // 清除临时样式
    document.getElementById('capture-style')?.remove()
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
//border-bottom: 1px solid #eee; display: flex;
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