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


const activeName = ref('ALL')

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
export default {
  props: {
    currentShikigami: {
      type: Object,
      default: {},
    },
    showYuhunSelect: {
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
          "label":"全部",
          "name":"ALL"
        },
        {
          "label":"攻击加成",
          "name":"SP"
        },
        {
          "label":"暴击",
          "name":"SSR"
        },
        {
          "label":"生命加成",
          "name":"SR"
        },
        {
          "label":"防御加成",
          "name":"R"
        },
        {
          "label":"效果命中",
          "name":"N"
        },
        {
          "label":"效果抵抗",
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
    showYuhunSelect(newVal, oldVal) {
      console.log("=======aaaaaaa>>>> ", newVal, oldVal);
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
      this.$emit("closeYuhunSelect");
    },
    confirm(i) {
      console.log("confirm====");
      this.$emit("updateShikigami", JSON.parse(JSON.stringify(i)))
      // this.current = {};
    },
    filterShikigamiByRarity(rarity) {
      if(rarity.toLowerCase() == "all")
        return this.shikigamiData
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
