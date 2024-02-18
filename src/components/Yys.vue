<template>
  <HeroSelect
    :showSelectHero="showSelectHero"
    :currentHero="currentHero"
    @closeSelectHero="closeSelectHero"
    @updateHero="updateHero"
  />

  <HeroProperty
    :showProperty="showProperty"
    :currentHero="currentHero"
    @closeProperty="closeProperty"
    @updateProperty="updateProperty"
  />
  <el-row>
    <el-col v-for="(item, index) in heroData" :key="index" :span="8">
      <el-card :body-style="{ padding: '0px' }">
        <img :src="item.avatar || '111'" class="image" @click="editHero(index, item)" />
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
import heroData from "../data/shishen.json";

import { ref, reactive, toRefs } from "vue";
import HeroSelect from "./ShishenSelect.vue";
import HeroProperty from "./ShishenProperty.vue";

const showSelectHero = ref(false)

export default {
  data() {
    return {
      heroData: heroData,
      showSelectHero: false,
      showProperty: false,
      items: [{}, {}, {}],
      index: 0,
      currentHero: {},
    };
  },
  components: {
    HeroSelect,
    HeroProperty,
  },

  methods: {
    closeSelectHero() {
      console.log("close select ====");
      this.showSelectHero = false;
      this.currentHero = {};
    },
    editHero(index, item) {
      console.log("==== edit hero ===", index, item);
      this.currentHero = item;
      this.showSelectHero = true;
      this.index = index;
    },
    updateHero(hero) {
      console.log("parent====> ", hero);
      this.showSelectHero = false;
      this.items[this.index].name = hero.name;
      this.currentHero = {};
    },
    editProperties(index, item) {
      console.log("add properties", index, item);
      this.showProperty = true;
      this.currentHero = item;
    },
    closeProperty() {
      console.log("close property ===");
      this.showProperty = false;
      this.currentHero = {};
    },
    updateProperty(property) {
      console.log("parent property====> ", property);
      this.showProperty = false;
      this.currentHero = {};
      this.items[this.index].properties = property;
    },
  },
};
</script>
