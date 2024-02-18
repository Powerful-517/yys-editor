<template>
  <el-dialog v-model="show" :visable.sync="show" title="请选择式神" @cancel="cancel" :before-close="cancel">
    <span>当前选择：{{current.name}}</span>
    <el-tabs
        v-model="activeName"
        type="card"
        class="demo-tabs"
        @tab-click="handleClick"
    >
      <el-tab-pane label="SP" name="first">
        <div>
          <el-space wrap>
            <div v-for="i in 20" :key="i">
              <el-button text> Text button </el-button>
            </div>
          </el-space>
          <li v-for="(item, index) in shikigamiData" :key="index" @click.stop="select(item)">
            <div>
              <span>{{ item.name }}</span>
            </div>
          </li>
        </div>
      </el-tab-pane>
      <el-tab-pane label="SSR" name="second">Config</el-tab-pane>
      <el-tab-pane label="SR" name="third">Role</el-tab-pane>
      <el-tab-pane label="R" name="fourth">Task</el-tab-pane>
      <el-tab-pane label="N" name="fifth">Task</el-tab-pane>
    </el-tabs>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click.stop="cancel">Cancel</el-button>
        <el-button type="primary" @click.stop="confirm"> Confirm </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script  lang="ts">
import shikigamiData from "../data/Shikigami.json";
import { ref } from "vue";
import type { TabsPaneContext } from 'element-plus'


const activeName = ref('first')

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
    confirm() {
      console.log("confirm====");
      this.$emit("updateShikigami", this.current);
      this.current = {};
    },
  },
};
</script>
