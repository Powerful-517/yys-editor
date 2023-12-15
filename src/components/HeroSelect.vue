<template>
  <el-dialog v-model="show" :visable.sync="show" title="请选择侍神" @cancel="cancel">
    <span>当前选择：{{current.name}}</span>
    <li v-for="(item, index) in heroData" :key="index" @click.stop="select(item)">
      <div>
      <span>{{ item.name }}</span>
      </div>
    </li>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click.stop="cancel">Cancel</el-button>
        <el-button type="primary" @click.stop="confirm"> Confirm </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import heroData from "../data/hero.json";
import { ref } from "vue";

export default {
  props: {
    currentHero: {
      type: Object,
      default: {},
    },
    showSelectHero: {
      type: Boolean,
    },
  },

  data() {
    return {
      heroData: heroData,
      selected: null,
      current: {},
      show: false,
    };
  },
  watch: {
    showSelectHero(newVal, oldVal) {
      console.log("=======>>>> ", newVal, oldVal);
      this.show = newVal;
    },
    currentHero(newVal, oldVal) {
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
      this.$emit("closeSelectHero");
    },
    confirm() {
      console.log("confirm====");
      this.$emit("updateHero", this.current);
      this.current = {};
    },
  },
};
</script>
