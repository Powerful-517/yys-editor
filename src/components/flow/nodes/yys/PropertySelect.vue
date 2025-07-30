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
        <el-button @click="emit('closePropertySelect')">取消</el-button>
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
    default: () => ({ type: '未选择属性', priority: 'optional', description: '' })
  },
  showPropertySelect: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['closePropertySelect', 'updateProperty']);

const show = computed({
  get() {
    return props.showPropertySelect
  },
  set(value) {
    if (!value) {
      emit('closePropertySelect')
    }
  }
})

const property = ref({});
const activeTab = ref('basic');
const yuhunTarget = ref('');
const yuhunTargetOptions = ref([]);
const showYuhunSelect = ref(false);
const currentYuhun = ref({});
const yuhunSelectIndex = ref(-1);

const propertyTypes = ref([
  { label: '攻击', value: 'attack' },
  { label: '生命', value: 'health' },
  { label: '防御', value: 'defense' },
  { label: '速度', value: 'speed' },
  { label: '暴击', value: 'crit' },
  { label: '暴击伤害', value: 'critDmg' },
  { label: '效果命中', value: 'effectHit' },
  { label: '效果抵抗', value: 'effectResist' }
]);

watch(() => props.currentProperty, (newVal) => {
  if (newVal) {
    property.value = JSON.parse(JSON.stringify(newVal));
  }
}, { deep: true, immediate: true });

const handleTypeChange = (newType) => {
  // Reset related fields when type changes
};

const updateSkillRequired = (index, value) => {
  property.value.skillRequired[index] = value;
};

const openYuhunSelect = (index) => {
  yuhunSelectIndex.value = index;
  showYuhunSelect.value = true;
};

const closeYuhunSelect = () => {
  showYuhunSelect.value = false;
};

const updateYuhunSelect = (yuhun) => {
  if (yuhunSelectIndex.value === -1) {
    property.value.yuhun.yuhunSetEffect.push(yuhun);
  } else {
    property.value.yuhun.yuhunSetEffect[yuhunSelectIndex.value] = yuhun;
  }
  closeYuhunSelect();
};

const handleYuhunTargetChange = (value) => {
  // Handle change
};

const confirm = () => {
  emit('updateProperty', property.value);
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