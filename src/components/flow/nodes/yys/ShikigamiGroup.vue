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

  <div class="group-item">
    <div class="group-header">
      <div class="group-opt" data-html2canvas-ignore="true">
        <div class="opt-left">
          <el-button type="primary" icon="CopyDocument" @click="copy(group.shortDescription)">{{ t('Copy') }}
          </el-button>
          <el-button type="primary" icon="Document" @click="paste(groupIndex,'shortDescription')">{{
              t('Paste')
            }}
          </el-button>
        </div>
        <div class="opt-right">
          <el-button class="drag-handle" type="primary" icon="Rank" circle></el-button>
          <el-button type="primary" @click="addGroup">{{ t('AddGroup') }}</el-button>
          <el-button type="primary" @click="addGroupElement(groupIndex)">{{ t('AddShikigami') }}</el-button>
          <el-button type="danger" icon="Delete" circle @click="removeGroup(groupIndex)"></el-button>
        </div>
      </div>
      <QuillEditor ref="shortDescriptionEditor" v-model:content="group.shortDescription" contentType="html" theme="snow"
                   :toolbar="toolbarOptions"/>
    </div>
    <div class="group-body">
      <draggable :list="props.group.groupInfo" item-key="name" class="body-content">
        <template #item="{element : position, index:positionIndex}">
          <div>
            <el-col>
              <el-card class="group-card" shadow="never">
                <div class="opt-btn" data-html2canvas-ignore="true">
                  <!-- Add delete button here -->
                  <el-button type="danger" icon="Delete" circle @click="removeGroupElement(positionIndex)"/>
                  <!-- <el-button type="primary" icon="Plus" circle @click="addGroupElement(groupIndex)"/> -->
                </div>
                <div class="avatar-container">
                  <!-- 头像图片 -->
                  <img :src="position.avatar || '/assets/Shikigami/default.png'"
                       style="cursor: pointer; vertical-align: bottom;"
                       class="avatar-image"
                       @click="editShikigami(positionIndex)"/>

                  <!-- 文字图层 -->
                  <span v-if="position.properties">{{
                      position.properties.levelRequired
                    }}级 {{ position.properties.skillRequired.join('') }}</span>
                </div>

                <div class="property-wrap">
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
                              {{ getYuhunNames(position.properties.yuhun.yuhunSetEffect) }}<br/>{{
                                t('yuhun_target.shortName.' + position.properties.yuhun.target)
                              }}·{{ getYuhunPropertyNames(position.properties.yuhun) }}
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
    <div class="group-footer">
      <div class="group-opt" data-html2canvas-ignore="true">
        <div class="opt-left">
          <el-button type="primary" icon="CopyDocument" @click="copy(group.details)">{{ t('Copy') }}</el-button>
          <el-button type="primary" icon="Document" @click="paste(groupIndex,'details')">{{
              t('Paste')
            }}
          </el-button>
        </div>
      </div>
      <QuillEditor ref="detailsEditor" v-model:content="group.details" contentType="html" theme="snow"
                   :toolbar="toolbarOptions"/>
    </div>
  </div>
  <div class="divider-horizontal"></div>
</template>
<script setup lang="ts">
import {ref, reactive, toRefs, nextTick} from 'vue';
import ShikigamiSelect from './ShikigamiSelect.vue';
import ShikigamiProperty from './ShikigamiProperty.vue';
import html2canvas from 'html2canvas';
import {useI18n} from 'vue-i18n'
import { Quill, QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.bubble.css'
import '@vueup/vue-quill/dist/vue-quill.snow.css' // 引入样式文件
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import shikigamiData from '../../../../data/Shikigami.json';
import _ from 'lodash';
import {Action, ElMessage, ElMessageBox} from "element-plus";
import { useGlobalMessage } from '../../../../ts/useGlobalMessage';
import draggable from 'vuedraggable';

const props = defineProps<{
  groups:any[];
  group: any;
  groupIndex;
}>();

const groupIndex = props.groupIndex


// 定义响应式数据
const state = reactive({
  showSelectShikigami: false,
  showProperty: false,
  groupIndex: 0,
  positionIndex: 0,
  currentShikigami: {}
});

const clipboard = ref('');

const dialogTableVisible = ref(false)
const {showMessage} = useGlobalMessage();

// 获取当前的 i18n 实例
const {t} = useI18n()

// 定义 QuillEditor 的 ref
const shortDescriptionEditor = ref<InstanceType<typeof QuillEditor>>()
const detailsEditor = ref<InstanceType<typeof QuillEditor>>()

const removeGroupElement = async ( positionIndex: number) => {


  if (props.group.groupInfo.length === 1) {
    showMessage('warning', '无法删除');
    return;
  }

  try {
    await ElMessageBox.confirm('确定要删除此元素吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    props.group.groupInfo.splice(positionIndex, 1);
    showMessage('success', '删除成功!');
  } catch (error) {
    showMessage('info', '已取消删除');
  }
};

const removeGroup = async (groupIndex: number) => {
  if (props.groups.length === 1) {
    showMessage('warning', '无法删除最后一个队伍');
    return;
  }

  try {
    await ElMessageBox.confirm('确定要删除此组吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    props.groups.splice(groupIndex, 1);
    showMessage('success', '删除成功!');
  } catch (error) {
    showMessage('info', '已取消删除');
  }
};
const addGroup = () => {
  props.group.groupInfo.push({
    shortDescription: '',
    groupInfo: [{}, {}, {}, {}, {}],
    details: ''
  });

  const container = document.getElementById('main-container');


  nextTick(() => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth' // 可选平滑滚动
    });
  })
};

const addGroupElement = (groupIndex) => {
  props.group.groupInfo.push({});
  editShikigami(props.group.groupInfo.length - 1);
};

const editShikigami = ( positionIndex) => {
  console.log("==== 选择式神 ===", groupIndex, positionIndex);
  state.showSelectShikigami = true;
  state.positionIndex = positionIndex;
  state.currentShikigami = props.group.groupInfo[positionIndex];
};

const getYuhunNames = (yuhunSetEffect) => {
  const names = yuhunSetEffect.map(item => item.name).join('');
  if (names.length <= 6) {
    return names;
  } else {
    return yuhunSetEffect.map(item => item.shortName || item.name).join('');
  }
}

const getYuhunPropertyNames = (yuhun) => {
  // 根据条件处理 yuhun.property2
  let property2Value, property4Value, property6Value;
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

const copy = (str) => {
  clipboard.value = str
}

const paste = (groupIndex, type) => {
  console.log("paste", groupIndex, type, clipboard.value)
  if ('shortDescription' == type)
    props.group.shortDescription = clipboard.value
  else if ('details' == type)
    props.group.details = clipboard.value
}

const registerFonts = () => {
  const Font = Quill.import('attributors/style/font')
  Font.whitelist = ['SimSun', 'SimHei', 'KaiTi', 'FangSong', 'Microsoft YaHei', 'PingFang SC']
  Quill.register(Font, true)
}

// 自定义字号注册
const registerSizes = () => {
  const Size = Quill.import('attributors/style/size')
  Size.whitelist = ['12px', '14px', '16px', '18px', '21px', '29px', '32px', '34px']
  Quill.register(Size, true)
}

// 执行注册
registerFonts()
registerSizes()

// 工具栏配置
const toolbarOptions = ref([
  [{font: ['SimSun', 'SimHei', 'KaiTi', 'FangSong', 'Microsoft YaHei', 'PingFang SC']}],
  [{header: 1}, {header: 2}],
  [{size: ['12px', '14px', '16px', '18px', '21px', '29px', '32px', '34px']}],
  ['bold', 'italic', 'underline', 'strike'],
  [{color: []}, {background: []}],
  // ['blockquote', 'code-block'],
  [{list: 'bullet'}, {list: 'ordered'}, {'list': 'check'}],

  [{indent: '-1'}, {indent: '+1'}],
  [{align: []}],
  [{direction: 'rtl'}],
  // [{ header: [1, 2, 3, 4, 5, 6, false] }],
  // ['link', 'image', 'video'],
  // ['clean']
] as const)

const saveQuillDesc = async (): Promise<string> => {
  if (!shortDescriptionEditor.value) {
    throw new Error('Quill editor instance not found')
  }
  return shortDescriptionEditor.value.getHTML()
}

// 保存方法
const saveQuillDetail = async (): Promise<string> => {
  if (!detailsEditor.value) {
    throw new Error('Quill detailsEditor instance not found')
  }
  return detailsEditor.value.getHTML()
}

const updateShikigami = (shikigami) => {

  state.showSelectShikigami = false;
  const oldProperties = props.group.groupInfo[state.positionIndex].properties;
  props.group.groupInfo[state.positionIndex] = _.cloneDeep(shikigami);
  props.group.groupInfo[state.positionIndex].properties = oldProperties;
};

const editProperty = (groupIndex, positionIndex) => {
  state.showProperty = true;
  state.groupIndex = groupIndex;
  state.positionIndex = positionIndex;
  state.currentShikigami = props.group.groupInfo[positionIndex];
};

const closeProperty = () => {
  state.showProperty = false;
  state.currentShikigami = {};
};

const updateProperty = (property) => {
  state.showProperty = false;
  state.currentShikigami = {};
  props.group.groupInfo[state.positionIndex].properties = _.cloneDeep(property);
};

const closeSelectShikigami = () => {
  console.log("close select ====");
  state.showSelectShikigami = false;
  state.currentShikigami = {};
};
// 暴露方法给父组件
defineExpose({
  saveQuillDesc,
  saveQuillDetail
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

.group-header {
  margin: 10px;
  padding: 10px;
}

.group-opt {
  padding: 10px;
  display: flex;
  justify-content: space-between;
}

.group-item {
  width: 100%;
}

.group-body {
  padding: 20px;
  width: 80%;
}


.body-content {
  display: flex;
  flex-direction: row;
  width: 20%;
}

.group-card {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  .avatar-container {
    position: relative;
    min-width: 100px;
  }

  .avatar-container span {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) translateY(50%);
    font-size: 24px;
    color: white;
    text-shadow: -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black;
    white-space: nowrap;
    padding: 0 8px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .opt-btn {
    position: absolute;
    top: 0px;
    right: 0px;
    z-index: 10;
    opacity: 0;
  }
}

.property-wrap {
  margin: 10px 0;
}

/* 当鼠标悬停在容器上时显示按钮 */
.group-card:hover .opt-btn {
  opacity: 1;
}

.group-footer {
  margin: 10px;
  padding: 10px;
}
</style>
<style>
.ql-container {
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}

.ql-toolbar {
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;

  .ql-tooltip[data-mode="link"]::before {
    content: "链接地址：";
  }

  .ql-tooltip[data-mode="video"]::before {
    content: "视频地址：";
  }

  .ql-tooltip.ql-editing {
    a.ql-action::after {
      content: "保存";
      border-right: 0px;
      padding-right: 0px;
    }
  }

  .ql-picker.ql-font {
    .ql-picker-label[data-value=SimSun]::before,
    .ql-picker-item[data-value=SimSun]::before {
      content: "宋体";
      font-family: SimSun;
      font-size: 15px;
    }

    .ql-picker-label[data-value=SimHei]::before,
    .ql-picker-item[data-value=SimHei]::before {
      content: "黑体";
      font-family: SimHei;
      font-size: 15px;
    }

    .ql-picker-label[data-value=KaiTi]::before,
    .ql-picker-item[data-value=KaiTi]::before {
      content: "楷体";
      font-family: KaiTi;
      font-size: 15px;
    }

    .ql-picker-label[data-value=FangSong]::before,
    .ql-picker-item[data-value=FangSong]::before {
      content: "仿宋";
      font-family: FangSong;
      font-size: 15px;
    }

    .ql-picker-label[data-value="Microsoft YaHei"]::before,
    .ql-picker-item[data-value="Microsoft YaHei"]::before {
      content: "微软雅黑";
      font-family: 'Microsoft YaHei';
      font-size: 15px;
    }

    .ql-picker-label[data-value="PingFang SC"]::before,
    .ql-picker-item[data-value="PingFang SC"]::before {
      content: "苹方";
      font-family: 'PingFang SC';
      font-size: 15px;
    }
  }

  .ql-picker.ql-size {
    .ql-picker-label::before,
    .ql-picker-item::before {
      font-size: 14px !important;
      content: "五号" !important;
    }

    .ql-picker-label[data-value="12px"]::before {
      content: "小五" !important;
    }

    .ql-picker-item[data-value="12px"]::before {
      font-size: 12px;
      content: "小五" !important;
    }

    .ql-picker-label[data-value="16px"]::before {
      content: "小四" !important;
    }

    .ql-picker-item[data-value="16px"]::before {
      font-size: 16px;
      content: "小四" !important;
    }

    .ql-picker-label[data-value="18px"]::before {
      content: "四号" !important;
    }

    .ql-picker-item[data-value="18px"]::before {
      font-size: 18px;
      content: "四号" !important;
    }

    .ql-picker-label[data-value="21px"]::before {
      content: "三号" !important;
    }

    .ql-picker-item[data-value="21px"]::before {
      font-size: 21px;
      content: "三号" !important;
    }

    .ql-picker-label[data-value="24px"]::before {
      content: "小二" !important;
    }

    .ql-picker-item[data-value="24px"]::before {
      font-size: 24px;
      content: "小二" !important;
    }

    .ql-picker-label[data-value="29px"]::before {
      content: "二号" !important;
    }

    .ql-picker-item[data-value="29px"]::before {
      font-size: 29px;
      content: "二号" !important;
    }

    .ql-picker-label[data-value="32px"]::before {
      content: "小一" !important;
    }

    .ql-picker-item[data-value="32px"]::before {
      font-size: 32px;
      content: "小一" !important;
    }

    .ql-picker-label[data-value="34px"]::before {
      content: "一号" !important;
    }

    .ql-picker-item[data-value="34px"]::before {
      font-size: 34px;
      content: "一号" !important;
    }
  }
}
</style>