<template>
  <div class="watermark-container">
    <!-- 插槽内容（即 Yys 组件） -->
    <slot></slot>
  </div>
</template>

<script setup>
import { onMounted,watch, ref } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: '默认水印'
  },
  font: {
    type: String,
    default: '30px Arial'
  },
  color: {
    type: String,
    default: 'rgba(184, 184, 184, 0.3)' // 半透明灰色
  },
  angle: {
    type: Number,
    default: -20 // 水印倾斜角度
  }
});

onMounted(() => {
  createWatermark();
});



const createWatermark = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 设置画布大小
  canvas.width = 200;
  canvas.height = 100;

  // 设置字体和颜色
  ctx.font = props.font;
  ctx.fillStyle = props.color;

  // 计算文本宽度
  const metrics = ctx.measureText(props.text);
  const textWidth = metrics.width;

  // 填充背景色为透明
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 旋转画布
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((props.angle * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // 绘制水印文本
  ctx.fillText(props.text, (canvas.width - textWidth) / 2, canvas.height / 2);

  // 恢复画布状态
  ctx.restore();

  // 将 canvas 转换为 base64 图像
  const watermarkUrl = canvas.toDataURL('image/png');

  // 获取父容器并应用背景图
  const container = document.querySelector('.watermark-container');
  container.style.backgroundImage = `url(${watermarkUrl})`;
  container.style.backgroundRepeat = 'repeat';

  // 在生成水印后添加 resize 监听
  // const observer = new ResizeObserver(entries => {
  //   entries.forEach(entry => {
  //     container.style.backgroundImage = `url(${watermarkUrl})`;
  //   });
  // });
  // observer.observe(container);
};

// 响应props变化
watch(() => [props.text, props.font, props.color, props.angle], createWatermark);
</script>

<style scoped>
.watermark-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh; /* 基础高度 */
  display: flex;
  flex-direction: column;
}

/* 使用伪元素添加水印背景 */
.watermark-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: inherit;
  background-repeat: repeat;
  pointer-events: none; /* 确保水印不会干扰用户交互 */
  z-index: 9999; /* 确保水印在最顶层 */
  //background-attachment: fixed; /* 增强覆盖效果 */
}
</style>