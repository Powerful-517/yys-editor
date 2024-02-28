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

<!--  <el-row :span="10">-->
    <draggable :list="items" item-key="name" style="display: flex;flex-direction: row">
      <template #item="{element, index}">
        <div>
          <el-col>
            <el-card :body-style="{ padding: '0px' }">
              <img :src="element.avatar || '/assets/Shikigami/default.png'" class="image" @click="editShikigami(index, element)"/>
              <div style="padding: 14px">
                <span>{{ element.name || "" }}</span>
                <div v-if="element.properties">
                  <span>已配置属性：</span>
                  <div v-for="(value, key, index) in element.properties">
                    <span>{{ key }}</span> : <span>{{ value || '-' }}</span>
                  </div>
                </div>
                <div class="bottom">
                  <el-button @click="editProperties(index, element)">配置属性</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </div>

      </template>
    </draggable>
<!--  </el-row>-->

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
      shikigamiData: shikigamiData,
      showSelectShikigami: false,
      showProperty: false,
      items: [{}, {}, {}, {}, {}],
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
      index: 0,
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
    editShikigami(index, item) {
      console.log("==== 选择式神 ===", index, item);
      this.currentShikigami = item;
      this.showSelectShikigami = true;
      this.index = index;
    },
    updateShikigami(shikigami) {
      console.log("parent====> ", shikigami);
      this.showSelectShikigami = false;
      this.items[this.index] = shikigami;
      // this.items[this.index].name = shikigami.name;
      // this.currentShikigami = {};
    },
    editProperties(index, item) {
      console.log("add properties", index, item);
      this.showProperty = true;
      this.currentShikigami = item;
      this.index = index;
    },
    closeProperty() {
      console.log("close property ===");
      this.showProperty = false;
      this.currentShikigami = {};
    },
    updateProperty(property) {
      console.log("parent property====> ", property);
      this.showProperty = false;
      this.currentShikigami = {};
      this.items[this.index].properties = property;
    },
  },
};
</script>
