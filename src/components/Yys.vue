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
  <el-row>
    <el-col v-for="(item, index) in shikigamiData" :key="index" :span="8">
      <el-card :body-style="{ padding: '0px' }">
        <img :src="item.avatar || '111'" class="image" @click="editShikigami(index, item)" />
        <div style="padding: 14px">
          <span>{{ item.name || "" }}</span>
          <div v-if="item.properties">
            <span>已配置属性：</span>
            <div v-for="(value, key, index) in item.properties">
                <span>{{key}}</span> : <span>{{value || '-'}}</span>
            </div>
          </div>
          <div class="bottom">
            <el-button @click="editProperties(index, item)">配置属性</el-button>
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <div style="margin: 20px">
    <span>配置结果</span>
  </div>
</template>

<script>
import shikigamiData from "../data/Shikigami.json";

import { ref, reactive, toRefs } from "vue";
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
      items: [{}, {}, {}],
      index: 0,
      currentShikigami: {},
    };
  },
  components: {
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
      this.items[this.index].name = shikigami.name;
      this.currentShikigami = {};
    },
    editProperties(index, item) {
      console.log("add properties", index, item);
      this.showProperty = true;
      this.currentShikigami = item;
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
