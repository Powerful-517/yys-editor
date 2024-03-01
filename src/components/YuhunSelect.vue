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
          v-for="(yuhunType, index) in yuhunTypes"
          :key="index"
          :label="yuhunType.label"
          :name="yuhunType.name"
      >
        <div v-if="yuhunTypes.includes(yuhunType)"> <!-- 只在这些级别中显示内容 -->
          <el-space wrap size="large">
            <div v-for="i in filterShikigamiByRarity(yuhunType.name)" :key="i.name">
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
import yuhunData from "../data/Yuhun.json";
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
      yuhunData: yuhunData,
      selected: null,
      current: {},
      show: false,
      yuhunTypes: [
        {
          "label":"全部",
          "name":"ALL"
        },
        {
          "label":"攻击加成",
          "name":"Attack"
        },
        {
          "label":"暴击",
          "name":"Crit"
        },
        {
          "label":"生命加成",
          "name":"Health"
        },
        {
          "label":"防御加成",
          "name":"Defense"
        },
        {
          "label":"效果命中",
          "name":"ControlHit"
        },
        {
          "label":"效果抵抗",
          "name":"ControlMiss"
        },
        {
          "label":"首领御魂",
          "name":"PVE"
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
      this.$emit("updateYuhunSelect", JSON.parse(JSON.stringify(i)))
      // this.current = {};
    },
    filterShikigamiByRarity(yuhunType) {
      if(yuhunType.toLowerCase() == "all")
        return this.yuhunData
      // 将传入的rarity参数转换为小写
      const lowerCaseYuhunType = yuhunType.toLowerCase();
      return this.yuhunData.filter(yuhun =>
          // 将shikigami对象的rarity属性也转换为小写进行比较
          yuhun.type.toLowerCase() === lowerCaseYuhunType
      );
    },
  },
};
</script>
