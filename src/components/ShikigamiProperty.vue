<template>

  <YuhunSelect
      :showYuhunSelect="showYuhunSelect"
      :currentShikigami="currentShikigami"
      @closeYuhunSelect="closeYuhunSelect"
      @updateShikigami="updateShikigami"
  />

  <el-dialog
      v-model="show"
      :visable.sync="show"
      title="配置属性"
      @cancel="cancel"
      :before-close="cancel"
  >
    <span>当前选择式神：{{ current.name }}</span>
    <el-form :model="shikigami" label-width="120px">
      <el-form-item label="等级要求">
        <el-radio-group v-model="shikigami.levelRequired" class="ml-4">
          <el-radio label="40" size="large">40</el-radio>
          <el-radio label="0" size="large">献祭</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="技能要求">
        <el-radio-group v-model="shikigami.skillRequiredMode" class="ml-4">
          <el-radio label="all" size="large">全满</el-radio>
          <el-radio label="111" size="large">111</el-radio>
          <el-radio label="custom" size="large">自定义</el-radio>
        </el-radio-group>
        <div v-if="shikigami.skillRequiredMode === 'custom'" style="display: flex; flex-direction: row; width: 100%;">
          <el-select v-for="(value, key, index) in shikigami.skillRequired" :placeholder="value"
                     style="margin-bottom: 10px;" @change="updateSkillRequired(key, $event)">
            <el-option label="*" value="*"/>
            <el-option label="1" value="1"/>
            <el-option label="2" value="2"/>
            <el-option label="3" value="3"/>
            <el-option label="4" value="4"/>
            <el-option label="5" value="5"/>
          </el-select>
        </div>
      </el-form-item>
      <div style="display: flex; flex-direction: row; width: 100%;">
        <div style="display: flex; flex-direction: column; width: 50%;">
          <el-form-item label="御魂指定">
            <!--            <el-input v-model="shikigami.speed"/>-->
          </el-form-item>
          <el-form-item label="御魂套装">
            <el-button type="primary" @click="editShikigami()">
              <el-icon :size="20"><CirclePlus /></el-icon>
            </el-button>


          </el-form-item>
          <el-form-item label="效果指标">
            <el-select placeholder="伤害输出" v-model="shikigami.yuhun.target">
              <el-option label="伤害输出" value="1"/>
              <el-option label="效果命中" value="2"/>
              <el-option label="效果抵抗" value="3"/>
              <el-option label="生命" value="4"/>
              <el-option label="攻击" value="5"/>
              <el-option label="防御" value="6"/>
              <el-option label="速度" value="7"/>
              <el-option label="暴击" value="8"/>
              <el-option label="暴击伤害" value="9"/>
              <el-option label="治疗量" value="10"/>
              <el-option label="命抗双修" value="11"/>
              <el-option label="防御输出" value="12"/>
            </el-select>
          </el-form-item>
          <el-form-item label="2号位主属性">
            <el-select multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="2" placeholder="伤害输出"
                       v-model="shikigami.yuhun.property2">
              <el-option label="攻击加成" value="5"/>
              <el-option label="防御加成" value="6"/>
              <el-option label="生命加成" value="4"/>
              <el-option label="速度" value="7"/>
            </el-select>
          </el-form-item>
          <el-form-item label="4号位主属性">
            <el-select multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="2" placeholder="伤害输出"
                       v-model="shikigami.yuhun.property4">
              <el-option label="攻击加成" value="5"/>
              <el-option label="防御加成" value="6"/>
              <el-option label="生命加成" value="4"/>
              <el-option label="效果命中" value="7"/>
              <el-option label="效果抵抗" value="8"/>
            </el-select>
          </el-form-item>
          <el-form-item label="6号位主属性">
            <el-select multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="2" placeholder="伤害输出"
                       v-model="shikigami.yuhun.property6">
              <el-option label="攻击加成" value="5"/>
              <el-option label="防御加成" value="6"/>
              <el-option label="生命加成" value="4"/>
              <el-option label="暴击" value="7"/>
              <el-option label="暴击伤害" value="8"/>
            </el-select>
          </el-form-item>
        </div>
        <div style="display: flex; flex-direction: column; width: 50%;">
          <el-form-item label="高级定制">
            <!--            <el-input v-model="shikigami.speed"/>-->
          </el-form-item>
          <el-form-item label="属性限制">
            <!--            <el-input v-model="shikigami.speed"/>-->
          </el-form-item>
        </div>
      </div>
      <el-form-item label="Activity form">
        <el-input v-model="shikigami.desc" type="textarea"/>
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
import {ref} from "vue";
import ShikigamiSelect from "@/components/ShikigamiSelect.vue";
import YuhunSelect from "@/components/YuhunSelect.vue";
// import YuhunSelect from "./YuhunSelect.vue";

export default {
  components: {YuhunSelect, ShikigamiSelect},
  props: {
    currentShikigami: {
      type: Object,
      default: {},
    },
    showProperty: {
      type: Boolean,
    },
  },

  data() {
    return {
      showYuhunSelect:false,
      propertyData: propertyData,
      shikigami: {
        edit: false,
        yuhun: {
          target: "伤害输出",
          property2: "",
          property4: "",
          property6: "",
        },
        levelRequired: "40",
        speed: "",
        skillRequiredMode: "all",
        skillRequired: ["技能一", "技能二", "技能三"]
      },
      current: {},
      show: false,
    };
  },
  watch: {
    showProperty(newVal, oldVal) {
      console.log("==aaaaaaa=====>>>> ", newVal, oldVal);
      this.show = newVal;
    },
    currentShikigami(newVal, oldVal) {
      console.log("confirm====" + JSON.stringify(newVal))

      console.log("confirm====" + JSON.stringify(oldVal))

      console.log("===item====>>>> ", newVal, oldVal);
      if (newVal.properties != undefined && newVal.properties.edit == true) {
        this.shikigami = newVal.properties;
      }
      this.current = newVal;
    },
  },
  methods: {
    editShikigami() {
      console.log("==== 选择御魂 ===");
      // this.currentShikigami = item;
      this.showYuhunSelect = true;
      // this.index = index;
    },
    closeYuhunSelect() {
      console.log("==== 选择御魂 ===");
      // this.currentShikigami = item;
      this.showYuhunSelect = false;
      // this.index = index;
    },
    cancel() {
      console.log("cancel====");
      this.$emit("closeProperty");
    },
    confirm() {
      console.log("confirm====");
      console.log("confirm====" + JSON.stringify(this.shikigami.edit))
      // if (null == this.shikigami[this.index].properties) {
      this.shikigami.edit = true
      this.$emit("updateProperty", JSON.parse(JSON.stringify(this.shikigami)));
      Object.assign(this.$data, this.$options.data())
      console.log("confirm====" + JSON.stringify(this.shikigami.edit))

      // }
    },
    updateSkillRequired(index, value) {
      console.log(index)
      console.log(value)
      this.shikigami.skillRequired[index] = value;
      console.log(this.shikigami.skillRequired)
    },
  },
};
</script>

