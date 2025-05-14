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


  <div class="yys-rank">
    <div class="pvp-mindmap">

    </div>
    <div class="pvp-shikigami-editor">
      <el-button type="primary" @click="addGroupElement()">{{ t('AddShikigami') }}</el-button>

      <div style="max-height: 600px; overflow-y: auto;">
        <el-space wrap size="large">
          <draggable :list="props.groups[0].groupInfo" item-key="name" class="body-content">
            <template #item="{element : position, index:positionIndex}">
              <div class="group-card">
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
                  <!--              <span v-if="position.properties">{{ position.properties.levelRequired }}级 {{ position.properties.skillRequired.join('') }}</span>-->
                </div>
                <div class="opt-foot">
                  <div class="property-wrap">
                    <div style="display: flex; justify-content: center;" data-html2canvas-ignore="true">
                      <span>{{ position.name || "" }}</span>
                    </div>
                    <div style="display: flex; justify-content: center;" class="bottom" data-html2canvas-ignore="true">
                      <el-button @click="editProperty(positionIndex)">{{ t('editProperties') }}
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
                </div>
              </div>
            </template>
          </draggable>
        </el-space>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue';
import shikigami from "../data/Shikigami.json"
import ShikigamiSelect from "@/components/flow/nodes/yys/ShikigamiSelect.vue";
import ShikigamiProperty from "@/components/flow/nodes/yys/ShikigamiProperty.vue";
import _ from "lodash";
import {useI18n} from "vue-i18n";
import draggable from 'vuedraggable';


const {t} = useI18n()

const props = defineProps<{
  groups: any[];
}>();

const state = reactive({
  showSelectShikigami: false,
  showProperty: false,
  groupIndex: 0,
  positionIndex: 0,
  currentShikigami: {},
  previewImage: null, // 用于存储预览图像的数据URL
  previewVisible: false, // 控制预览弹窗的显示状态
});

const addGroupElement = () => {
  props.groups[0].groupInfo.push({});
  editShikigami(props.groups[0].groupInfo.length - 1);
};

const editShikigami = (positionIndex) => {
  // console.log("==== 选择式神 ===", groupIndex, positionIndex);
  state.showSelectShikigami = true;
  state.positionIndex = positionIndex;
  // state.currentShikigami = props.groups[groupIndex].groupInfo[positionIndex];
};

const closeSelectShikigami = () => {
  console.log("close select ====");
  state.showSelectShikigami = false;
  state.currentShikigami = {};
};

const updateShikigami = (shikigami) => {
  state.showSelectShikigami = false;

  const oldProperties = props.groups[0].groupInfo[state.positionIndex].properties;
  props.groups[0].groupInfo[state.positionIndex] = _.cloneDeep(shikigami);
  props.groups[0].groupInfo[state.positionIndex].properties = oldProperties;

};

const closeProperty = () => {
  state.showProperty = false;
  state.currentShikigami = {};
};

const updateProperty = (property) => {
  state.showProperty = false;
  state.currentShikigami = {};
  props.groups[0].groupInfo[state.positionIndex].properties = _.cloneDeep(property);
};

const editProperty = (positionIndex) => {
  state.showProperty = true;
  state.positionIndex = positionIndex;
  state.currentShikigami = props.groups[0].groupInfo[positionIndex];
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


</script>
<style scoped>
.yys-rank {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.pvp-mindmap {
  flex: 1;
  border: 2px solid red;
  min-height: 400px;
  min-width: 500px;
  height: 50%;
  width: 80%;
}

.pvp-shikigami-editor {

  border: 2px solid black;
  height: 50%;
  width: 80%;
  min-height: 400px;
  min-width: 500px;
}

.group-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .avatar-container {
    position: relative;
    width: 100px;
    height: 100px;
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

/* 当鼠标悬停在容器上时显示按钮 */
.group-card:hover .opt-btn {
  opacity: 1;
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
</style>