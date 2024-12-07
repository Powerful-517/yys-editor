<template>
  <ShikigamiSelect
      :showSelectShikigami="showSelectShikigami"
      :currentShikigami="currentShikigami"
      @closeSelectShikigami="closeSelectShikigami"
      @updateShikigami="updateShikigami"
  />

  <ShikigamiProperty
      :showProperty="showProperty"
      :currentShikigami="currentShikigami"
      @closeProperty="closeProperty"
      @updateProperty="updateProperty"
  />
  <draggable :list="groups" item-key="group" style="display: flex; flex-direction: column; width: 100%;"
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
    <span>配置结果</span>
  </div>
</template>

<script>
import shikigamiData from "../data/Shikigami.json";

import {ref, reactive, toRefs} from "vue";
import draggable from 'vuedraggable';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import ShikigamiSelect from "./ShikigamiSelect.vue";
import ShikigamiProperty from "./ShikigamiProperty.vue";

const showSelectShikigami = ref(false)
const activeName = ref('first')


export default {
  data() {
    return {
      showSelectShikigami: false,
      showProperty: false,
      groups: [
        [{}, {}, {}, {}, {}],
        [{}, {}, {}, {}, {}]
      ],
      // items: [
      //   {
      //     "name": "妖刀姬",
      //     "rarity": "SSR",
      //     "avatar":"/assets/Shikigami/ssr/Yoto Hime.png"
      //   },
      //   {
      //     "name": "妖刀姬",
      //     "rarity": "SSR",
      //     "avatar":"/assets/Shikigami/ssr/Yoto Hime.png"
      //   },
      //   {
      //     "name": "妖刀姬",
      //     "rarity": "SSR",
      //     "avatar":"/assets/Shikigami/ssr/Yoto Hime.png"
      //   }
      // ],
      groupIndex: 0,
      positionIndex: 0,
      currentShikigami: {},
      drag: false,
    };
  },
  components: {
    draggable,
    ShikigamiSelect,
    ShikigamiProperty,

  },

  methods: {
    closeSelectShikigami() {
      console.log("close select ====");
      this.showSelectShikigami = false;
      this.currentShikigami = {};
    },
    editShikigami(groupIndex, positionIndex) {
      console.log("==== 选择式神 ===", groupIndex, positionIndex);
      this.showSelectShikigami = true;
      this.groupIndex = groupIndex;
      this.positionIndex = positionIndex;
    },
    updateShikigami(shikigami) {
      console.log("parent====> ", shikigami);
      this.showSelectShikigami = false;

      const oldProperties = this.groups[this.groupIndex][this.positionIndex].properties;
      this.groups[this.groupIndex][this.positionIndex] = shikigami;
      this.groups[this.groupIndex][this.positionIndex].properties = oldProperties;
      // this.items[this.index].name = shikigami.name;
      // this.currentShikigami = {};
    },
    editProperties(groupIndex, positionIndex) {

      this.showProperty = true;
      this.groupIndex = groupIndex;
      this.positionIndex = positionIndex;
      this.currentShikigami = this.groups[this.groupIndex][this.positionIndex];
      console.log("currentShikigami", JSON.stringify(this.currentShikigami));
    },
    closeProperty() {
      this.showProperty = false;
      this.currentShikigami = this.groups[this.groupIndex][this.positionIndex];
    },
    updateProperty(property) {
      this.showProperty = false;
      this.currentShikigami = {};
      this.groups[this.groupIndex][this.positionIndex].properties = property;
    },
    removeGroupElement(groupIndex, positionIndex) {
      this.groups[groupIndex].splice(positionIndex, 1);
    },
    removeGroup(groupIndex) {
      this.groups.splice(groupIndex, 1);
    },
    addGroup() {
      this.groups.push([{}, {}, {}, {}, {}]);
    },
    addGroupElement(groupIndex) {
      this.groups[groupIndex].push({});
    },
  },
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
