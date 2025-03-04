<template>
  <div ref="watermarkContainer" class="watermark-container"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: '默认水印'
  },
  font: {
    type: String,
    default: '20px Arial'
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

const watermarkContainer = ref(null);

onMounted(() => {
  createWatermark();
});

const createWatermark = () => {
  const container = watermarkContainer.value;
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

  // 创建一个 div 并设置背景图
  const watermarkDiv = document.createElement('div');
  watermarkDiv.style.position = 'absolute';
  watermarkDiv.style.top = '0';
  watermarkDiv.style.left = '0';
  watermarkDiv.style.width = '100%';
  watermarkDiv.style.height = '100%';
  watermarkDiv.style.backgroundImage = `url(${watermarkUrl})`;
  watermarkDiv.style.backgroundRepeat = 'repeat';
  watermarkDiv.style.pointerEvents = 'none'; // 确保水印不会干扰用户交互

  // 将水印 div 添加到容器中
  container.appendChild(watermarkDiv);
};
</script>

<style scoped>
.watermark-container {
  position: absolute; /* 使用绝对定位 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* 确保水印不会干扰用户交互 */
}
</style>