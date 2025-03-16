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
          <div>
            <draggable :list="group.groupInfo" item-key="name" style="display: flex; flex-direction: row; width: 20%;">
              <template #item="{element : position, index:positionIndex}">
                <div>
                  <el-col>
                    <el-card shadow="never"
                             :body-style="{ display: 'flex', 'flex-direction': 'column', 'justify-content': 'center', 'align-items': 'center' }">

                      <div data-html2canvas-ignore="true">
                        <!-- Add delete button here -->
                        <el-button type="danger" icon="Delete" circle @click="removeGroupElement(groupIndex, positionIndex)"/>
                        <el-button type="primary" icon="Plus" circle @click="addGroupElement(groupIndex)"/>
                      </div>
                      <div style="position: relative; display: inline-block;">
                        <!-- 头像图片 -->
                        <img :src="position.avatar || '/assets/Shikigami/default.png'"
                             style="cursor: pointer; vertical-align: bottom;"
                             class="avatar-image"
                             @click="editShikigami(groupIndex, positionIndex)"/>

                        <!-- 文字图层 -->
                        <span v-if="position.properties"
                              style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%) translateY(50%);
               font-size: 24px; color: white; text-shadow: -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black;
               white-space: nowrap; padding: 0 8px; margin: 0; display: flex; align-items: center; justify-content: center;">
    {{ position.properties.levelRequired }}级 {{ position.properties.skillRequired.join('') }}
  </span>
                      </div>
                      <div style="padding: 14px; width: 120px;">

                        <div style="display: flex; justify-content: center;" data-html2canvas-ignore="true">
                          <span>{{ position.name || "" }}</span>
                        </div>
                        <div style="display: flex; justify-content: center;" class="bottom" data-html2canvas-ignore="true">
                          <el-button @click="editProperty(groupIndex,positionIndex)">{{ t('editProperties') }}
                          </el-button>
                        </div>
                        <div v-if="position.properties">
                          <div style="display: flex; justify-content: center;">
                            <span
                                style="width: 100px;height: 50px;background-color: #666;
                                border-radius: 5px; margin-right: 5px; color: white;
                                text-align: center; white-space: pre-wrap; display: flex; align-items: center; justify-content: center; flex-direction: column ">
                              {{getYuhunNames(position.properties.yuhun.yuhunSetEffect)}}<br/>{{ t('yuhun_target.shortName.' + position.properties.yuhun.target) }}·{{ getYuhunPropertyNames(position.properties.yuhun) }}
                            </span>
                          </div>
                          <div>
                            <span
                                style="display: inline-block; width: 100px; height: 30px;  border-radius: 5px; margin-right: 5px; color: red; text-align: center; white-space: pre-wrap; display: flex; align-items: center; justify-content: center; flex-direction: column ">
                              {{ position.properties.desc }}
                            </span>
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
import _ from 'lodash';

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
  state.currentShikigami = state.groups[groupIndex].groupInfo[positionIndex];
};

const updateShikigami = (shikigami) => {
  console.log("parent====> ", shikigami);
  state.showSelectShikigami = false;

  const oldProperties = state.groups[state.groupIndex].groupInfo[state.positionIndex].properties;
  state.groups[state.groupIndex].groupInfo[state.positionIndex] = _.cloneDeep(shikigami);
  state.groups[state.groupIndex].groupInfo[state.positionIndex].properties = oldProperties;
};

const editProperty = (groupIndex, positionIndex) => {
  state.showProperty = true;
  state.groupIndex = groupIndex;
  state.positionIndex = positionIndex;
  state.currentShikigami = state.groups[groupIndex].groupInfo[positionIndex];
};

const closeProperty = () => {
  state.showProperty = false;
  state.currentShikigami = {};
};

const updateProperty = (property) => {
  state.showProperty = false;
  state.currentShikigami = {};
  state.groups[state.groupIndex].groupInfo[state.positionIndex].properties = _.cloneDeep(property);
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


const exportGroups = () => {
  const dataStr = JSON.stringify(state.groups, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `yys-export-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

const getYuhunNames =(yuhunSetEffect) =>{
  const names = yuhunSetEffect.map(item => item.name).join('');
  if (names.length <= 6) {
    return names;
  } else {
    return yuhunSetEffect.map(item => item.shortName || item.name).join('');
  }
}

const getYuhunPropertyNames = (yuhun) =>{
  // 根据条件处理 yuhun.property2
  let property2Value,property4Value,property6Value;
  if (yuhun.property2.length >= 4) {
    property2Value = 'X';
  } else {
    property2Value = t('yuhun_property.shortName.' + yuhun.property2[0]);
  }

  if (yuhun.property4.length >= 5) {
    property4Value = 'X';
  } else {
    property4Value = t('yuhun_property.shortName.' + yuhun.property4[0]);
  }

  if (yuhun.property6.length >= 5) {
    property6Value = 'X';
  } else {
    property6Value = t('yuhun_property.shortName.' + yuhun.property6[0]);
  }
  // 构建 propertyNames 字符串
  const propertyNames =
      property2Value + property4Value + property6Value

  return propertyNames;
}

const importGroups = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      state.groups = importedData;
      ElMessage.success('导入成功');
    } catch (error) {
      ElMessage.error('文件格式错误');
    }
  };
  reader.readAsText(file);
};

// 暴露方法给父组件
defineExpose({
  exportGroups,
  importGroups
});

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
