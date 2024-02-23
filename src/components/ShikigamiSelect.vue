<template>
  <el-dialog v-model="show" :visable.sync="show" title="请选择式神" @cancel="cancel" :before-close="cancel">
    <span>当前选择：{{current.name}}</span>
    <el-tabs
        v-model="activeName"
        type="card"
        class="demo-tabs"
        @tab-click="handleClick"
    >
      <el-tab-pane
          v-for="(rarity, index) in rarityLevels"
          :key="index"
          :label="rarity.label"
          :name="rarity.name"
      >
        <div v-if="rarityLevels.includes(rarity)"> <!-- 只在这些级别中显示内容 -->
          <el-space wrap size="large">
            <div v-for="i in filterShikigamiByRarity(rarity.name)" :key="i.name">
              <el-button style="width: 100px; height: 100px;" @click.stop="confirm(i)">
                <img :src="i.avatar" style="width: 99px; height: 99px;">
              </el-button>
            </div>
          </el-space>
        </div>

      </el-tab-pane>
    </el-tabs>

<!--    <template #footer>-->
<!--      <span class="dialog-footer">-->
<!--        <el-button @click.stop="cancel">Cancel</el-button>-->
<!--        <el-button type="primary" @click.stop="confirm"> Confirm </el-button>-->
<!--      </span>-->
<!--    </template>-->
  </el-dialog>
</template>

<script  lang="ts">
import shikigamiData from "../data/Shikigami.json";
import { ref } from "vue";
import type { TabsPaneContext } from 'element-plus'


const activeName = ref('SP')

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
export default {
  props: {
    currentShikigami: {
      type: Object,
      default: {},
    },
    showSelectShikigami: {
      type: Boolean,
    },
  },

  data() {
    return {
      activeName:activeName,
      shikigamiData: shikigamiData,
      selected: null,
      current: {},
      show: false,
      rarityLevels: [
        {
          "label":"SP",
          "name":"SP"
        },
        {
          "label":"SSR",
          "name":"SSR"
        },
        {
          "label":"SR",
          "name":"SR"
        },
        {
          "label":"R",
          "name":"R"
        },
        {
          "label":"N",
          "name":"N"
        },
        {
          "label":"联动",
          "name":"L"
        },
        {
          "label":"呱太",
          "name":"G"
        },
      ],
    };
  },
  watch: {
    showSelectShikigami(newVal, oldVal) {
      console.log("=======>>>> ", newVal, oldVal);
      this.show = newVal;
    },
    currentShikigami(newVal, oldVal) {
        console.log("===item====>>>> ", newVal, oldVal);
      this.current = newVal;
    },

  },
  methods: {
    select(item) {
        this.current = item;
    },
    cancel() {
      console.log("cancel====");
      this.$emit("closeSelectShikigami");
    },
    confirm(i) {
      console.log("confirm====");
      this.$emit("updateShikigami", i);
      // this.current = {};
    },
    filterShikigamiByRarity(rarity) {
      // 将传入的rarity参数转换为小写
      const lowerCaseRarity = rarity.toLowerCase();
      return this.shikigamiData.filter(shikigami =>
          // 将shikigami对象的rarity属性也转换为小写进行比较
          shikigami.rarity.toLowerCase() === lowerCaseRarity
      );
    },
  },
};
</script>
