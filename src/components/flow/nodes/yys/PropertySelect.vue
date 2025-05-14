<template>
  <YuhunSelect
      :showSelectYuhun="showYuhunSelect"
      :currentYuhun="currentYuhun"
      @closeSelectYuhun="closeYuhunSelect"
      @updateYuhun="updateYuhunSelect"
  />

  <el-dialog
      v-model="show"
      title="属性选择器"
      @close="cancel"
      :before-close="cancel"
      width="80%"
  >
    <el-form :model="property" label-width="120px">
      <el-tabs v-model="activeTab">
        <!-- 基础属性选项卡 -->
        <el-tab-pane label="基础属性" name="basic">
          <el-form-item label="属性类型">
            <el-select v-model="property.type" @change="handleTypeChange">
              <el-option v-for="type in propertyTypes" :key="type.value" :label="type.label" :value="type.value"/>
            </el-select>
          </el-form-item>
          
          <!-- 攻击属性 -->
          <div v-if="property.type === 'attack'">
            <el-form-item label="攻击值类型">
              <el-radio-group v-model="property.attackType">
                <el-radio label="fixed" size="large">固定值</el-radio>
                <el-radio label="percentage" size="large">百分比</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="攻击值">
              <el-input-number v-model="property.attackValue" :min="0" :precision="property.attackType === 'percentage' ? 1 : 0" />
              <span v-if="property.attackType === 'percentage'">%</span>
            </el-form-item>
          </div>
          
          <!-- 生命属性 -->
          <div v-if="property.type === 'health'">
            <el-form-item label="生命值类型">
              <el-radio-group v-model="property.healthType">
                <el-radio label="fixed" size="large">固定值</el-radio>
                <el-radio label="percentage" size="large">百分比</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="生命值">
              <el-input-number v-model="property.healthValue" :min="0" :precision="property.healthType === 'percentage' ? 1 : 0" />
              <span v-if="property.healthType === 'percentage'">%</span>
            </el-form-item>
          </div>
          
          <!-- 防御属性 -->
          <div v-if="property.type === 'defense'">
            <el-form-item label="防御值类型">
              <el-radio-group v-model="property.defenseType">
                <el-radio label="fixed" size="large">固定值</el-radio>
                <el-radio label="percentage" size="large">百分比</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="防御值">
              <el-input-number v-model="property.defenseValue" :min="0" :precision="property.defenseType === 'percentage' ? 1 : 0" />
              <span v-if="property.defenseType === 'percentage'">%</span>
            </el-form-item>
          </div>
          
          <!-- 速度属性 -->
          <div v-if="property.type === 'speed'">
            <el-form-item label="速度值">
              <el-input-number v-model="property.speedValue" :min="0" :precision="0" />
            </el-form-item>
          </div>
          
          <!-- 暴击相关属性 -->
          <div v-if="property.type === 'crit'">
            <el-form-item label="暴击率">
              <el-input-number v-model="property.critRate" :min="0" :max="100" :precision="1" />
              <span>%</span>
            </el-form-item>
          </div>
          
          <div v-if="property.type === 'critDmg'">
            <el-form-item label="暴击伤害">
              <el-input-number v-model="property.critDmg" :min="0" :precision="1" />
              <span>%</span>
            </el-form-item>
          </div>
          
          <!-- 效果命中与抵抗 -->
          <div v-if="property.type === 'effectHit'">
            <el-form-item label="效果命中">
              <el-input-number v-model="property.effectHitValue" :min="0" :precision="1" />
              <span>%</span>
            </el-form-item>
          </div>
          
          <div v-if="property.type === 'effectResist'">
            <el-form-item label="效果抵抗">
              <el-input-number v-model="property.effectResistValue" :min="0" :precision="1" />
              <span>%</span>
            </el-form-item>
          </div>
          
          <!-- 所有属性都显示的字段 -->
          <el-form-item label="优先级">
            <el-select v-model="property.priority">
              <el-option label="必须" value="required"/>
              <el-option label="推荐" value="recommended"/>
              <el-option label="可选" value="optional"/>
            </el-select>
          </el-form-item>
        </el-tab-pane>

        <!-- 式神要求选项卡 -->
        <el-tab-pane label="式神要求" name="shikigami">
          <el-form-item label="等级要求">
            <el-radio-group v-model="property.levelRequired" class="ml-4">
              <el-radio value="40" size="large">40</el-radio>
              <el-radio value="0" size="large">献祭</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="技能要求">
            <el-radio-group v-model="property.skillRequiredMode" class="ml-4">
              <el-radio value="all" size="large">全满</el-radio>
              <el-radio value="111" size="large">111</el-radio>
              <el-radio value="custom" size="large">自定义</el-radio>
            </el-radio-group>
            <div v-if="property.skillRequiredMode === 'custom'" style="display: flex; flex-direction: row; gap: 10px; width: 100%;">
              <el-select v-for="(value, index) in property.skillRequired" :key="index" :placeholder="value"
                          style="margin-bottom: 10px;" @change="updateSkillRequired(index, $event)">
                <el-option label="*" value="X"/>
                <el-option label="1" value="1"/>
                <el-option label="2" value="2"/>
                <el-option label="3" value="3"/>
                <el-option label="4" value="4"/>
                <el-option label="5" value="5"/>
              </el-select>
            </div>
          </el-form-item>
        </el-tab-pane>

        <!-- 御魂要求选项卡 -->
        <el-tab-pane label="御魂要求" name="yuhun">
          <div style="display: flex; flex-direction: row; width: 100%;">
            <div style="display: flex; flex-direction: column; width: 50%;">
              <el-form-item label="御魂套装">
                <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 5px;">
                  <img
                      v-for="(effect, index) in property.yuhun.yuhunSetEffect"
                      :key="index"
                      style="width: 50px; height: 50px;"
                      :src="effect.avatar"
                      class="image"
                      @click="openYuhunSelect(index)"
                  />
                  <el-button type="primary" @click="openYuhunSelect(-1)">
                    <el-icon :size="20">
                      <CirclePlus/>
                    </el-icon>
                  </el-button>
                </div>
              </el-form-item>
              
              <el-form-item label="御魂效果目标">
                <el-select v-model="yuhunTarget" @change="handleYuhunTargetChange">
                  <el-option v-for="option in yuhunTargetOptions" :key="option.value" :label="t(option.label)" :value="option.value"/>
                </el-select>
              </el-form-item>
            </div>
            
            <div style="display: flex; flex-direction: column; width: 50%;">
              <el-form-item label="2号位主属性">
                <el-select multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="2"
                          v-model="property.yuhun.property2">
                  <el-option label="攻击加成" value="Attack"/>
                  <el-option label="防御加成" value="Defense"/>
                  <el-option label="生命加成" value="Health"/>
                  <el-option label="速度" value="Speed"/>
                </el-select>
              </el-form-item>
              
              <el-form-item label="4号位主属性">
                <el-select multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="2"
                          v-model="property.yuhun.property4">
                  <el-option label="攻击加成" value="Attack"/>
                  <el-option label="防御加成" value="Defense"/>
                  <el-option label="生命加成" value="Health"/>
                  <el-option label="效果命中" value="ControlHit"/>
                  <el-option label="效果抵抗" value="ControlMiss"/>
                </el-select>
              </el-form-item>
              
              <el-form-item label="6号位主属性">
                <el-select multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="2"
                          v-model="property.yuhun.property6">
                  <el-option label="攻击加成" value="Attack"/>
                  <el-option label="防御加成" value="Defense"/>
                  <el-option label="生命加成" value="Health"/>
                  <el-option label="暴击" value="Crit"/>
                  <el-option label="暴击伤害" value="CritDamage"/>
                </el-select>
              </el-form-item>
            </div>
          </div>
        </el-tab-pane>

        <!-- 效果指标选项卡 -->
        <el-tab-pane label="效果指标" name="effect">
          <el-form-item label="伤害期望">
            <el-input-number v-model="property.expectedDamage" :min="0" />
          </el-form-item>
          
          <el-form-item label="生存能力">
            <el-slider v-model="property.survivalRate" :step="10" :marks="{0: '弱', 50: '中', 100: '强'}" />
          </el-form-item>
          
          <el-form-item label="输出偏向">
            <el-select v-model="property.damageType">
              <el-option label="普攻" value="normal"/>
              <el-option label="技能" value="skill"/>
              <el-option label="均衡" value="balanced"/>
            </el-select>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      
      <el-form-item label="额外描述">
        <el-input v-model="property.description" type="textarea"/>
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="confirm">确认</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { CirclePlus } from '@element-plus/icons-vue';
import YuhunSelect from "@/components/flow/nodes/yys/YuhunSelect.vue";

// 获取当前的 i18n 实例
const { t } = useI18n();

const props = defineProps({
  currentProperty: {
    type: Object,
    default: () => ({}),
  },
  showPropertySelect: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['closePropertySelect', 'updateProperty']);

// 属性类型选项
const propertyTypes = [
  { label: '攻击', value: 'attack' },
  { label: '生命', value: 'health' },
  { label: '防御', value: 'defense' },
  { label: '速度', value: 'speed' },
  { label: '暴击率', value: 'crit' },
  { label: '暴击伤害', value: 'critDmg' },
  { label: '效果命中', value: 'effectHit' },
  { label: '效果抵抗', value: 'effectResist' },
];

// 标签页控制
const activeTab = ref('basic');

// 御魂选择相关
const showYuhunSelect = ref(false);
const currentYuhun = ref({ name: '未选择御魂', avatar: '', type: '' });
const yuhunIndex = ref(-1);
const yuhunTarget = ref('1');

// 御魂目标选项
const yuhunTargetOptions = [
  { label: 'yuhun_target.fullName.0', value: '0' },
  { label: 'yuhun_target.fullName.1', value: '1' },
  { label: 'yuhun_target.fullName.2', value: '2' },
  { label: 'yuhun_target.fullName.3', value: '3' },
  { label: 'yuhun_target.fullName.4', value: '4' },
  { label: 'yuhun_target.fullName.5', value: '5' },
  { label: 'yuhun_target.fullName.6', value: '6' },
  { label: 'yuhun_target.fullName.7', value: '7' },
  { label: 'yuhun_target.fullName.8', value: '8' },
  { label: 'yuhun_target.fullName.9', value: '9' },
  { label: 'yuhun_target.fullName.10', value: '10' },
  { label: 'yuhun_target.fullName.11', value: '11' },
  { label: 'yuhun_target.fullName.12', value: '12' },
];

// 属性数据对象
const property = ref({
  // 基础属性
  type: 'attack',
  attackType: 'percentage',
  attackValue: 0,
  healthType: 'percentage',
  healthValue: 0,
  defenseType: 'percentage',
  defenseValue: 0,
  speedValue: 0,
  critRate: 0,
  critDmg: 0,
  effectHitValue: 0,
  effectResistValue: 0,
  priority: 'optional',
  
  // 式神要求
  levelRequired: "40",
  skillRequiredMode: "all",
  skillRequired: ["5", "5", "5"],
  
  // 御魂要求
  yuhun: {
    yuhunSetEffect: [],
    target: "1",
    property2: ["Attack"],
    property4: ["Attack"],
    property6: ["Crit", "CritDamage"],
  },
  
  // 效果指标
  expectedDamage: 0,
  survivalRate: 50,
  damageType: "balanced",
  
  // 附加信息
  description: '',
});

const show = ref(false);

// 监听props变化
watch(() => props.showPropertySelect, (newVal) => {
  show.value = newVal;
});

watch(() => props.currentProperty, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    // 如果传入了属性数据，则使用传入的数据
    property.value = { ...newVal };
    // 设置御魂目标
    if (newVal.yuhun && newVal.yuhun.target) {
      yuhunTarget.value = newVal.yuhun.target.toString();
    }
  }
}, { deep: true });

// 处理属性类型变更
const handleTypeChange = (type) => {
  console.log('属性类型变更为:', type);
};

// 处理技能要求变更
const updateSkillRequired = (index, value) => {
  property.value.skillRequired[index] = value;
};

// 处理御魂目标变更
const handleYuhunTargetChange = (value) => {
  switch (value) {
    case "0": {
      property.value.yuhun.target = 0;
      property.value.yuhun.property2 = ["Attack", "Defense", "Health", "Speed"];
      property.value.yuhun.property4 = ["Attack", "Defense", "Health", "ControlHit", "ControlMiss"];
      property.value.yuhun.property6 = ["Attack", "Defense", "Health", "Crit", "CritDamage"];
      break;
    }
    case "1": {
      property.value.yuhun.target = 1;
      property.value.yuhun.property2 = ["Attack"];
      property.value.yuhun.property4 = ["Attack"];
      property.value.yuhun.property6 = ["Crit", "CritDamage"];
      break;
    }
    case "2": {
      property.value.yuhun.target = 2;
      property.value.yuhun.property2 = ["Speed"];
      property.value.yuhun.property4 = ["ControlHit"];
      property.value.yuhun.property6 = ["Attack", "Defense", "Health", "Crit", "CritDamage"];
      break;
    }
    case "3": {
      property.value.yuhun.target = 3;
      property.value.yuhun.property2 = ["Speed"];
      property.value.yuhun.property4 = ["ControlMiss"];
      property.value.yuhun.property6 = ["Attack", "Defense", "Health", "Crit", "CritDamage"];
      break;
    }
    case "4": {
      property.value.yuhun.target = 4;
      property.value.yuhun.property2 = ["Health"];
      property.value.yuhun.property4 = ["Health"];
      property.value.yuhun.property6 = ["Health"];
      break;
    }
    case "5": {
      property.value.yuhun.target = 5;
      property.value.yuhun.property2 = ["Attack"];
      property.value.yuhun.property4 = ["Attack"];
      property.value.yuhun.property6 = ["Attack"];
      break;
    }
    case "6": {
      property.value.yuhun.target = 6;
      property.value.yuhun.property2 = ["Defense"];
      property.value.yuhun.property4 = ["Defense"];
      property.value.yuhun.property6 = ["Defense"];
      break;
    }
    case "7": {
      property.value.yuhun.target = 7;
      property.value.yuhun.property2 = ["Speed"];
      property.value.yuhun.property4 = ["Attack", "Defense", "Health", "ControlHit", "ControlMiss"];
      property.value.yuhun.property6 = ["Attack", "Defense", "Health", "Crit", "CritDamage"];
      break;
    }
    case "8": {
      property.value.yuhun.target = 8;
      property.value.yuhun.property2 = ["Attack", "Defense", "Health", "Speed"];
      property.value.yuhun.property4 = ["Attack", "Defense", "Health", "ControlHit", "ControlMiss"];
      property.value.yuhun.property6 = ["Crit"];
      break;
    }
    case "9": {
      property.value.yuhun.target = 9;
      property.value.yuhun.property2 = ["Attack", "Defense", "Health", "Speed"];
      property.value.yuhun.property4 = ["Attack", "Defense", "Health", "ControlHit", "ControlMiss"];
      property.value.yuhun.property6 = ["CritDamage"];
      break;
    }
    case "10": {
      property.value.yuhun.target = 10;
      property.value.yuhun.property2 = ["Speed"];
      property.value.yuhun.property4 = ["Health"];
      property.value.yuhun.property6 = ["Crit", "CritDamage"];
      break;
    }
    case "11": {
      property.value.yuhun.target = 11;
      property.value.yuhun.property2 = ["Speed"];
      property.value.yuhun.property4 = ["ControlHit", "ControlMiss"];
      property.value.yuhun.property6 = ["Attack", "Defense", "Health", "Crit", "CritDamage"];
      break;
    }
    case "12": {
      property.value.yuhun.target = 12;
      property.value.yuhun.property2 = ["Defense"];
      property.value.yuhun.property4 = ["Defense"];
      property.value.yuhun.property6 = ["Crit", "CritDamage"];
      break;
    }
  }
};

// 打开御魂选择
const openYuhunSelect = (index) => {
  yuhunIndex.value = index;
  showYuhunSelect.value = true;
};

// 关闭御魂选择
const closeYuhunSelect = () => {
  showYuhunSelect.value = false;
};

// 更新御魂选择
const updateYuhunSelect = (yuhun, operator) => {
  showYuhunSelect.value = false;
  
  if (operator === "Update") {
    if (yuhunIndex.value >= 0) {
      property.value.yuhun.yuhunSetEffect[yuhunIndex.value] = JSON.parse(JSON.stringify(yuhun));
    } else {
      property.value.yuhun.yuhunSetEffect.push(JSON.parse(JSON.stringify(yuhun)));
    }
  } else if (operator === "Remove") {
    if (yuhunIndex.value >= 0) {
      property.value.yuhun.yuhunSetEffect.splice(yuhunIndex.value, 1);
    }
  }
};

// 取消选择
const cancel = () => {
  emit('closePropertySelect');
  resetData();
};

// 确认选择
const confirm = () => {
  // 复制当前属性数据
  const result = JSON.parse(JSON.stringify(property.value));
  
  emit('updateProperty', result);
  resetData();
};

// 重置数据
const resetData = () => {
  yuhunTarget.value = '1';
  property.value = {
    // 基础属性
    type: 'attack',
    attackType: 'percentage',
    attackValue: 0,
    healthType: 'percentage',
    healthValue: 0,
    defenseType: 'percentage',
    defenseValue: 0,
    speedValue: 0,
    critRate: 0,
    critDmg: 0,
    effectHitValue: 0,
    effectResistValue: 0,
    priority: 'optional',
    
    // 式神要求
    levelRequired: "40",
    skillRequiredMode: "all",
    skillRequired: ["5", "5", "5"],
    
    // 御魂要求
    yuhun: {
      yuhunSetEffect: [],
      target: "1",
      property2: ["Attack"],
      property4: ["Attack"],
      property6: ["Crit", "CritDamage"],
    },
    
    // 效果指标
    expectedDamage: 0,
    survivalRate: 50,
    damageType: "balanced",
    
    // 附加信息
    description: '',
  };
};
</script>

<style scoped>
.el-form-item {
  margin-bottom: 18px;
}

.image {
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}
</style> 