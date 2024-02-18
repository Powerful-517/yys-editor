<template>
  <el-dialog
    v-model="show"
    :visable.sync="show"
    title="配置属性"
    @cancel="cancel"
  >
    <span>当前选择侍神：{{current.name}}</span>
    <el-form :model="form" label-width="120px">
      <el-form-item label="速度">
        <el-input v-model="form.speed" />
      </el-form-item>
      <el-form-item label="天赋">
        <el-select v-model="form.region" placeholder="please select your zone">
          <el-option label="Zone one" value="shanghai" />
          <el-option label="Zone two" value="beijing" />
        </el-select>
      </el-form-item>

      <el-form-item label="Activity form">
        <el-input v-model="form.desc" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="confirm">Confirm</el-button>
        <el-button @click="cancel">Cancel</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import propertyData from "../data/property.json";
import { ref } from "vue";

export default {
  props: {
    currentHero: {
      type: Object,
      default: {},
    },
    showProperty: {
      type: Boolean,
    },
  },

  data() {
    return {
      propertyData: propertyData,
      form: {
        speed: ""
      },
      current: {},
      show: false,
    };
  },
  watch: {
    showProperty(newVal, oldVal) {
      console.log("=======>>>> ", newVal, oldVal);
      this.show = newVal;
    },
    currentHero(newVal, oldVal) {
        console.log("===item====>>>> ", newVal, oldVal);
        if (newVal.property != undefined) {
          this.form = newVal.property;
        }
        this.current = newVal;
    },
  },
  methods: {
    cancel() {
      console.log("cancel====");
      this.$emit("closeProperty");
    },
    confirm() {
      console.log("confirm====");
      this.$emit("updateProperty", this.form);
    },
  },
};
</script>
