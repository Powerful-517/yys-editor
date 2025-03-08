<template>

  <YuhunSelect
      :showYuhunSelect="showYuhunSelect"
      :currentShikigami="currentShikigami"
      @closeYuhunSelect="closeYuhunSelect"
      @updateYuhunSelect="updateYuhunSelect"
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
          <el-radio value="40" size="large">40</el-radio>
          <el-radio value="0" size="large">献祭</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="技能要求">
        <el-radio-group v-model="shikigami.skillRequiredMode" class="ml-4">
          <el-radio value="all" size="large">全满</el-radio>
          <el-radio value="111" size="large">111</el-radio>
          <el-radio value="custom" size="large">自定义</el-radio>
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
            <img
                v-for="(effect, index) in shikigami.yuhun.yuhunSetEffect"
                :key="index"
                style="width: 50px; height: 50px;"
                :src="effect.avatar"
                class="image"
                @click="openYuhunSelect(index)"
            />
            <!--            <img style="width: 50px;height: 50px" v-if="shikigami.yuhun.yuhunSetEffect.length>0"-->
            <!--                 :src="shikigami.yuhun.yuhunSetEffect[0].avatar" class="image"/>-->
            <!--            <img style="width: 50px;height: 50px" v-if="shikigami.yuhun.yuhunSetEffect.length>1"-->
            <!--                 :src="shikigami.yuhun.yuhunSetEffect[1].avatar" class="image"/>-->

            <el-button type="primary" @click="openYuhunSelect(-1)">
              <el-icon :size="20">
                <CirclePlus/>
              </el-icon>
            </el-button>


          </el-form-item>
          <el-form-item label="效果指标">
            <el-select placeholder="1" v-model="shikigami.yuhun.target">
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
            <el-select multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="2"
                       v-model="shikigami.yuhun.property2">
              <el-option label="攻击加成" value="Attack"/>
              <el-option label="防御加成" value="Defense"/>
              <el-option label="生命加成" value="Health"/>
              <el-option label="速度" value="Speed"/>
            </el-select>
          </el-form-item>
          <el-form-item label="4号位主属性">
            <el-select multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="2"
                       v-model="shikigami.yuhun.property4">
              <el-option label="攻击加成" value="Attack"/>
              <el-option label="防御加成" value="Defense"/>
              <el-option label="生命加成" value="Health"/>
              <el-option label="效果命中" value="ControlHit"/>
              <el-option label="效果抵抗" value="ControlMiss"/>
            </el-select>
          </el-form-item>
          <el-form-item label="6号位主属性">
            <el-select multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="2"
                       v-model="shikigami.yuhun.property6">
              <el-option label="攻击加成" value="Attack"/>
              <el-option label="防御加成" value="Defense"/>
              <el-option label="生命加成" value="Health"/>
              <el-option label="暴击" value="Crit"/>
              <el-option label="暴击伤害" value="CritDamage"/>
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

<script setup>
import propertyData from "../data/property.json";
import {ref, watch, computed} from 'vue'
import ShikigamiSelect from "@/components/ShikigamiSelect.vue";
import YuhunSelect from "@/components/YuhunSelect.vue";
// import YuhunSelect from "./YuhunSelect.vue";

const props = defineProps({
  currentShikigami: {
    type: Object,
    default: {},
  },
  showProperty: {
    type: Boolean,
  },
});

const emit = defineEmits(['closeProperty', 'updateProperty'])

let showYuhunSelect = ref(false)
let shikigami = ref({
  edit: false,
  yuhun: {
    yuhunSetEffect: [],
    target: "1",
    property2: ["Attack"],
    property4: ["Attack"],
    property6: ["Crit", "CritDamage"],
  },
  levelRequired: "40",
  speed: "",
  skillRequiredMode: "all",
  skillRequired: ["技能一", "技能二", "技能三"]
})
let yuhunIndex = ref(-1)
let current = ref({})
let show = ref(props.showProperty)

watch(() => props.currentShikigami, (newVal) => {
  if (newVal.properties != undefined && newVal.properties.edit == true) {
    shikigami.value = newVal.properties
  }
  console.log("ShikigamiProperty.vue" + current.value.name)
  current.value = newVal
  console.log("ShikigamiProperty.vue" + current.value.name)
}, {deep: true})

watch(() => props.showProperty, (newVal) => {
  show.value = newVal;
})

watch(() => shikigami.value.yuhun.target, (newVal) => {
      switch (newVal) {
          //<el-option label="伤害输出" value="1"/>
        case "1": {
          shikigami.value.yuhun.property2 = ["Attack"];
          shikigami.value.yuhun.property4 = ["Attack"];
          shikigami.value.yuhun.property6 = ["Crit", "CritDamage"];
          break;
        }
          //<el-option label="效果命中" value="2"/>
        case "2": {
          shikigami.value.yuhun.property2 = ["Speed"];
          shikigami.value.yuhun.property4 = ["ControlHit"];
          shikigami.value.yuhun.property6 = ["Attack", "Defense", "Health", "Crit", "CritDamage"];
          break;
        }
          //<el-option label="效果抵抗" value="3"/>
        case "3": {
          shikigami.value.yuhun.property2 = ["Speed"];
          shikigami.value.yuhun.property4 = ["ControlMiss"];
          shikigami.value.yuhun.property6 = ["Attack", "Defense", "Health", "Crit", "CritDamage"];
          break;
        }
          //<el-option label="生命" value="4"/>
        case "4": {
          shikigami.value.yuhun.property2 = ["Health"];
          shikigami.value.yuhun.property4 = ["Health"];
          shikigami.value.yuhun.property6 = ["Health"];
          break;
        }
          //<el-option label="攻击" value="5"/>
        case "5": {
          shikigami.value.yuhun.property2 = ["Attack"];
          shikigami.value.yuhun.property4 = ["Attack"];
          shikigami.value.yuhun.property6 = ["Attack"];
          break;
        }
          //<el-option label="防御" value="6"/>
        case "6": {
          shikigami.value.yuhun.property2 = ["Defense"];
          shikigami.value.yuhun.property4 = ["Defense"];
          shikigami.value.yuhun.property6 = ["Defense"];
          break;
        }
          //<el-option label="速度" value="7"/>
        case "7": {
          shikigami.value.yuhun.property2 = ["Speed"];
          shikigami.value.yuhun.property4 = ["Attack", "Defense", "Health", "ControlHit", "ControlMiss"];
          shikigami.value.yuhun.property6 = ["Attack", "Defense", "Health", "Crit", "CritDamage"];
          break;
        }
          //<el-option label="暴击" value="8"/>
        case "8": {
          shikigami.value.yuhun.property2 = ["Attack", "Defense", "Health", "Speed"];
          shikigami.value.yuhun.property4 = ["Attack", "Defense", "Health", "ControlHit", "ControlMiss"];
          shikigami.value.yuhun.property6 = ["Crit"];
          break;
        }
          //<el-option label="暴击伤害" value="9"/>
        case "9": {
          shikigami.value.yuhun.property2 = ["Attack", "Defense", "Health", "Speed"];
          shikigami.value.yuhun.property4 = ["Attack", "Defense", "Health", "ControlHit", "ControlMiss"];
          shikigami.value.yuhun.property6 = ["CritDamage"];
          break;
        }
          //<el-option label="治疗量" value="10"/>
        case "10": {
          shikigami.value.yuhun.property2 = ["Speed"];
          shikigami.value.yuhun.property4 = ["Health"];
          shikigami.value.yuhun.property6 = ["Crit", "CritDamage"];
          break;
        }
          //<el-option label="命抗双修" value="11"/>
        case "11": {
          shikigami.value.yuhun.property2 = ["Speed"];
          shikigami.value.yuhun.property4 = ["ControlHit", "ControlMiss"];
          shikigami.value.yuhun.property6 = ["Attack", "Defense", "Health", "Crit", "CritDamage"];
          break;
        }
          //<el-option label="防御输出" value="12"/>
        case "12": {
          shikigami.value.yuhun.property2 = ["Defense"];
          shikigami.value.yuhun.property4 = ["Defense"];
          shikigami.value.yuhun.property6 = ["Crit", "CritDamage"];
          break;
        }
      }
    }, {deep: true}
)


const openYuhunSelect = (index) => {
  yuhunIndex.value = index
  showYuhunSelect.value = true
}

const closeYuhunSelect = () => showYuhunSelect.value = false


const updateYuhunSelect = (yuhun, operator) => {
  showYuhunSelect.value = false
  //Update
  if (operator == "Update") {
    if (yuhunIndex.value >= 0)
      shikigami.value.yuhun.yuhunSetEffect[yuhunIndex.value] = (JSON.parse(JSON.stringify(yuhun)))
    else
      shikigami.value.yuhun.yuhunSetEffect.push(JSON.parse(JSON.stringify(yuhun)))
  }
  //Delete
  else if (operator == "Remove") {
    if (yuhunIndex.value >= 0) {
      // 使用splice方法移除指定位置的御魂
      shikigami.value.yuhun.yuhunSetEffect.splice(yuhunIndex.value, 1);
    }
  }
}

const cancel = () => {
  emit('closeProperty')
  resetData()
}

const confirm = () => {
  shikigami.value.edit = true
  emit('updateProperty', JSON.parse(JSON.stringify(shikigami.value)))
  resetData()
}

const resetData = () => {
  shikigami.value = {
    edit: false,
    yuhun: {
      yuhunSetEffect: [],
      target: "伤害输出",
      property2: ["Attack"],
      property4: ["Attack"],
      property6: ["Crit", "CritDamage"],
    },
    levelRequired: "40",
    speed: "",
    skillRequiredMode: "all",
    skillRequired: ["技能一", "技能二", "技能三"]
  }
}
</script>