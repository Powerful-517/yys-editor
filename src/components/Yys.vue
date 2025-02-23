<template>
  <ShikigamiSelect
      :showSelectShikigami="state.showSelectShikigami"
      :currentShikigami="state.currentShikigami"
      @closeSelectShikigami="closeSelectShikigami"
      @updateShikigami="updateShikigami"
  />

  <ShikigamiProperty
      :showProperty="state.showProperty"
      :currentShikigami="state.currentShikigami"
      @closeProperty="closeProperty"
      @updateProperty="updateProperty"
  />
  <draggable :list="state.groups" item-key="group" style="display: flex; flex-direction: column; width: 100%;"
             handle=".drag-handle">

    <template #item="{ element: group, index: groupIndex }">

      <el-row :span="24">
        <div>
          <div style="display: flex; justify-content: flex-end;">
            <el-button class="drag-handle" type="primary" icon="Rank" circle></el-button>
            <el-button type="danger" icon="Delete" circle @click="removeGroup(groupIndex)"></el-button>
            <el-button type="primary" icon="Plus" circle @click="addGroup"></el-button>
          </div>
          <div>
            <draggable :list="group" item-key="name" style="display: flex; flex-direction: row; width: 20%;">
              <template #item="{element : position, index:positionIndex}">
                <div>
                  <el-col>
                    <el-card :body-style="{ padding: '0px' } ">
                      <img :src="position.avatar || '/assets/Shikigami/default.png'" class="image"
                           @click="editShikigami(groupIndex,positionIndex)"/>
                      <div style="padding: 14px; width: 95px">

                        <span>{{ position.name || "" }}</span>
                        <div class="bottom">
                          <el-button @click="editProperties(groupIndex,positionIndex)">配置属性</el-button>
                        </div>
                        <!--                        properties-->
                        <!--                        {"edit":true,"yuhun":{"yuhunSetEffect":[{"name":"狰","type":"attack","avatar":"/assets/Yuhun/狰.png"}],"target":"伤害输出","property2":["Attack"],"property4":["Attack"],"property6":["Crit","CritDamage"]},"levelRequired":"40","speed":"","skillRequiredMode":"all","skillRequired":["技能一","技能二","技能三"]}-->
                        <div v-if="position.properties">
                          <span>已配置属性：</span>
                          <div>
                            <span>{{ position.properties.yuhun.yuhunSetEffect.map(item => item.name).join(' ') }}</span>

                          </div>
                          <div v-for="(value, key, index) in position.properties">
                            <span>{{ key }}</span> : <span>{{ value || '-' }}</span>
                          </div>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                  <!-- Add delete button here -->
                  <el-button type="danger" icon="Delete" circle
                             @click="removeGroupElement(groupIndex, positionIndex)"></el-button>
                  <el-button type="primary" icon="Plus" circle @click="addGroupElement(groupIndex)"></el-button>
                </div>
              </template>
            </draggable>

          </div>
        </div>
      </el-row>


    </template>

    <!--    </el-row>-->
  </draggable>
  <div style="margin: 20px">

    <!-- 现有的代码 -->
    <div style="margin: 20px">
      <span>配置结果</span>
      <!-- 触发截图的按钮 -->
      <button @click="prepareCapture">生成截图</button>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog id="preview-container" v-model="state.previewVisible" width="50%" :before-close="handleClose">
      <img v-if="state.previewImage" :src="state.previewImage" alt="Preview" style="width: 100%; height: auto;" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="state.previewVisible = false">取 消</el-button>
        <el-button type="primary" @click="downloadImage">下 载</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, toRefs } from 'vue';
import draggable from 'vuedraggable';
import ShikigamiSelect from './ShikigamiSelect.vue';
import ShikigamiProperty from './ShikigamiProperty.vue';
import html2canvas from 'html2canvas';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import shikigamiData from '../data/Shikigami.json';
const dialogTableVisible = ref(false)
// 定义响应式数据
const state = reactive({
  showSelectShikigami: false,
  showProperty: false,
  groups: [
    [{}, {}, {}, {}, {}],
    [{}, {}, {}, {}, {}]
  ],
  groupIndex: 0,
  positionIndex: 0,
  currentShikigami: {},
  previewImage: null, // 用于存储预览图像的数据URL
  previewVisible: false, // 控制预览弹窗的显示状态
});

// 定义方法
const closeSelectShikigami = () => {
  console.log("close select ====");
  state.showSelectShikigami = false;
  state.currentShikigami = {};
};

const editShikigami = (groupIndex, positionIndex) => {
  console.log("==== 选择式神 ===", groupIndex, positionIndex);
  state.showSelectShikigami = true;
  state.groupIndex = groupIndex;
  state.positionIndex = positionIndex;
};

const updateShikigami = (shikigami) => {
  console.log("parent====> ", shikigami);
  state.showSelectShikigami = false;

  const oldProperties = state.groups[state.groupIndex][state.positionIndex].properties;
  state.groups[state.groupIndex][state.positionIndex] = shikigami;
  state.groups[state.groupIndex][state.positionIndex].properties = oldProperties;
};

const editProperties = (groupIndex, positionIndex) => {
  state.showProperty = true;
  state.groupIndex = groupIndex;
  state.positionIndex = positionIndex;
  state.currentShikigami = state.groups[groupIndex][positionIndex];
  console.log("currentShikigami", JSON.stringify(state.currentShikigami));
};

const closeProperty = () => {
  state.showProperty = false;
  state.currentShikigami = state.groups[state.groupIndex][state.positionIndex];
};

const updateProperty = (property) => {
  state.showProperty = false;
  state.currentShikigami = {};
  state.groups[state.groupIndex][state.positionIndex].properties = property;
};

const removeGroupElement = (groupIndex, positionIndex) => {
  state.groups[groupIndex].splice(positionIndex, 1);
};

const removeGroup = (groupIndex) => {
  state.groups.splice(groupIndex, 1);
};

const addGroup = () => {
  state.groups.push([{}, {}, {}, {}, {}]);
};

const addGroupElement = (groupIndex) => {
  state.groups[groupIndex].push({});
};

const prepareCapture = async () => {
  state.previewVisible = true; // 显示预览弹窗

  // 捕获页面元素并生成图片
  try {
    const element = document.querySelector('#main-container'); // 替换为要捕获的元素选择器
    if (!element) {
      console.error('Element with ID "main-container" not found.');
      state.previewVisible = false;
      return;
    }

    const canvas = await html2canvas(element);
    state.previewImage = canvas.toDataURL();
    if (!state.previewImage) {
      console.error('Failed to generate image data URL.');
      state.previewVisible = false;
    }
  } catch (error) {
    console.error('Failed to capture screenshot', error);
    state.previewVisible = false;
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
.drag-handle {
  cursor: move;
}

.position-drag-handle {
  cursor: move;
}
</style>
