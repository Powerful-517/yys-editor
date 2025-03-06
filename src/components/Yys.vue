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
  <!-- 现有的代码 -->
  <div style="margin: 20px" data-html2canvas-ignore="true">
    <!-- 触发截图的按钮 -->
    <el-button type="primary" @click="prepareCapture">{{ t('prepareCapture') }}</el-button>
  </div>

  <draggable :list="state.groups" item-key="group" style="display: flex; flex-direction: column; width: 100%;"
             handle=".drag-handle">


    <template #item="{ element: group, index: groupIndex }">
      <el-row :span="24">
        <div>
          <div>
            <div style="display: flex; justify-content: space-between;" data-html2canvas-ignore="true">
              <div>
                <el-button type="primary" icon="CopyDocument" @click="copy(group.shortDescription)">{{ t('Copy') }}
                </el-button>
                <el-button type="primary" icon="Document" @click="paste(groupIndex,'shortDescription')">{{
                    t('Paste')
                  }}
                </el-button>
              </div>
              <div>
                <el-button class="drag-handle" type="primary" icon="Rank" circle></el-button>
                <el-button type="primary" icon="Plus" circle @click="addGroup"></el-button>
                <el-button type="danger" icon="Delete" circle @click="removeGroup(groupIndex)"></el-button>
              </div>
            </div>
            <QuillEditor v-model:content="group.shortDescription" contentType="html" theme="snow"
                         :toolbar="toolbarOptions"/>
          </div>
          <!--          <div style="display: flex; justify-content: flex-end;" data-html2canvas-ignore="true">-->
          <!--            <el-button class="drag-handle" type="primary" icon="Rank" circle></el-button>-->
          <!--            <el-button type="danger" icon="Delete" circle @click="removeGroup(groupIndex)"></el-button>-->
          <!--            <el-button type="primary" icon="Plus" circle @click="addGroup"></el-button>-->
          <!--          </div>-->
          <div>
            <draggable :list="group.groupInfo" item-key="name" style="display: flex; flex-direction: row; width: 20%;">
              <template #item="{element : position, index:positionIndex}">
                <div>
                  <el-col>
                    <el-card shadow="never"
                             :body-style="{ display: 'flex', 'flex-direction': 'column', 'justify-content': 'center', 'align-items': 'center' }">

                      <div>
                        <!-- Add delete button here -->
                        <el-button type="danger" icon="Delete" circle
                                   @click="removeGroupElement(groupIndex, positionIndex)"
                                   data-html2canvas-ignore="true"></el-button>
                        <el-button type="primary" icon="Plus" circle @click="addGroupElement(groupIndex)"
                                   data-html2canvas-ignore="true"></el-button>
                      </div>
                      <div class="avatar-wrapper">
                        <img :src="position.avatar || '/assets/Shikigami/default.png'"
                             class="avatar-image"
                             @click="editShikigami(groupIndex,positionIndex)"/>
                      </div>
                      <div style="padding: 14px; width: 95px">

                        <span>{{ position.name || "" }}</span>
                        <div class="bottom" data-html2canvas-ignore="true">
                          <el-button @click="editProperty(groupIndex,positionIndex)">{{ t('editProperties') }}
                          </el-button>
                        </div>
                        <!--                        properties-->
                        <!--                        {"edit":true,"yuhun":{"yuhunSetEffect":[{"name":"狰","type":"attack","avatar":"/assets/Yuhun/狰.png"}],"target":"伤害输出","property2":["Attack"],"property4":["Attack"],"property6":["Crit","CritDamage"]},"levelRequired":"40","speed":"","skillRequiredMode":"all","skillRequired":["技能一","技能二","技能三"]}-->
                        <div v-if="position.properties">
                          <div>
                            <span
                                style="display: inline-block; width: 100px; height: 25px; background-color: #666; border-top-left-radius: 5px; border-top-right-radius: 5px; margin-right: 5px; color: white; text-align: center; white-space: pre-wrap ">
                              {{ position.properties.yuhun.yuhunSetEffect.map(item => item.name).join(' ') }}
                            </span>
                            <span
                                style="display: inline-block; width: 100px; height: 25px; background-color: #666; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; margin-right: 5px; color: white; text-align: center; white-space: pre-wrap ">
                              {{ t('yuhun_target.' + position.properties.yuhun.target) }}·
                            </span>
                          </div>
                          <div v-for="(value, key, index) in position.properties" data-html2canvas-ignore="true">
                            <span>{{ key }}</span> : <span>{{ value || '-' }}</span>
                          </div>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                </div>
              </template>
            </draggable>

          </div>
          <div>
            <div data-html2canvas-ignore="true">
              <el-button type="primary" icon="CopyDocument" @click="copy(group.details)">{{ t('Copy') }}</el-button>
              <el-button type="primary" icon="Document" @click="paste(groupIndex,'details')">{{
                  t('Paste')
                }}
              </el-button>
            </div>
            <QuillEditor v-model:content="group.details" contentType="html" theme="snow" :toolbar="toolbarOptions"/>
          </div>

        </div>
      </el-row>


    </template>

    <!--    </el-row>-->
  </draggable>
  <div style="margin: 20px">



    <!-- 预览弹窗 -->
    <el-dialog id="preview-container" v-model="state.previewVisible" width="80%" :before-close="handleClose">
      <div style="max-height: 500px; overflow-y: auto;">
        <img v-if="state.previewImage" :src="state.previewImage" alt="Preview" style="width: 100%; display: block;"/>
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
import {ref, reactive, toRefs} from 'vue';
import draggable from 'vuedraggable';
import ShikigamiSelect from './ShikigamiSelect.vue';
import ShikigamiProperty from './ShikigamiProperty.vue';
import html2canvas from 'html2canvas';
import {useI18n} from 'vue-i18n'
import {QuillEditor} from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css' // 引入样式文件
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import shikigamiData from '../data/Shikigami.json';

const dialogTableVisible = ref(false)
// 定义响应式数据
const state = reactive({
  showSelectShikigami: false,
  showProperty: false,
  groups: [
    {
      shortDescription: '',
      groupInfo: [{}, {}, {}, {}, {}],
      details: ''
    },
    {
      shortDescription: '',
      groupInfo: [{}, {}, {}, {}, {}],
      details: ''
    },
  ],
  groupIndex: 0,
  positionIndex: 0,
  currentShikigami: {},
  previewImage: null, // 用于存储预览图像的数据URL
  previewVisible: false, // 控制预览弹窗的显示状态
});

const clipboard = ref('');


// 获取当前的 i18n 实例
const {t} = useI18n()

const copy = (str) => {
  clipboard.value = str
}

const paste = (groupIndex, type) => {
  if ('shortDescription' == type)
    state.groups[groupIndex].shortDescription = clipboard.value
  else if ('details' == type)
    state.groups[groupIndex].details = clipboard.value
}

// 定义工具栏选项
const toolbarOptions = [

  [{'color': []}, {'background': []}],
  ['bold', 'italic', 'underline', 'strike'],
  // ['blockquote', 'code-block'],
  // ['link', 'image', 'video', 'formula'],
  [{'header': 1}, {'header': 2}],
  [{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'check'}],
  // [{ 'script': 'sub'}, { 'script': 'super' }],
  [{'indent': '-1'}, {'indent': '+1'}],
  // [{ 'size': ['small', false, 'large', 'huge'] }],
  // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  // [{ 'font': [] }],
  [{'align': []}],
  [{'direction': 'rtl'}],
  // ['clean']
];

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

  const oldProperties = state.groups[state.groupIndex].groupInfo[state.positionIndex].properties;
  state.groups[state.groupIndex].groupInfo[state.positionIndex] = shikigami;
  state.groups[state.groupIndex].groupInfo[state.positionIndex].properties = oldProperties;
};

const editProperty = (groupIndex, positionIndex) => {
  state.showProperty = true;
  state.groupIndex = groupIndex;
  state.positionIndex = positionIndex;
  state.currentShikigami = state.groups[groupIndex].groupInfo[positionIndex];
  console.log("currentShikigami", JSON.stringify(state.currentShikigami));
};

const closeProperty = () => {
  state.showProperty = false;
  state.currentShikigami = {};
};

const updateProperty = (property) => {
  state.showProperty = false;
  state.currentShikigami = {};
  state.groups[state.groupIndex].groupInfo[state.positionIndex].properties = property;
};

const removeGroupElement = (groupIndex, positionIndex) => {
  state.groups[groupIndex].groupInfo.splice(positionIndex, 1);
};

const removeGroup = (groupIndex) => {
  state.groups.splice(groupIndex, 1);
};

const addGroup = () => {
  state.groups.push({
    shortDescription: '',
    groupInfo: [{}, {}, {}, {}, {}],
    details: ''
  });
};

const addGroupElement = (groupIndex) => {
  state.groups[groupIndex].groupInfo.push({});
};

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
  }finally {
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
.drag-handle {
  cursor: move;
}

.position-drag-handle {
  cursor: move;
}

.ql-toolbar {
  display: none;
}

/* 正方形容器 */
.avatar-wrapper {
  width: 100px; /* 正方形边长 */
  height: 100px; /* 与宽度相同 */
  position: relative;
  overflow: hidden; /* 隐藏超出部分 */
  border-radius: 50%; /* 圆形裁剪 */
//border: 2px solid #fff; /* 可选：添加边框 */ //box-shadow: 0 2px 8px rgba(0,0,0,0.1); /* 可选：添加阴影 */
}

/* 图片样式 */
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 关键属性：保持比例填充容器 */
  object-position: center; /* 居中显示 */
  display: block;
  cursor: pointer;
}




.el-card {
  border: 0;
}


</style>
