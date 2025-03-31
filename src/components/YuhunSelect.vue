<template>
  <el-dialog v-model="show" :title="t('yuhunSelect')" @close="cancel">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span>当前选择：{{ current.name }}</span>
      <el-button type="danger" icon="Delete" round @click="remove()"></el-button>
    </div>
    <div style="display: flex; align-items: center;">
      <el-input
          placeholder="请输入内容"
          v-model="searchText"
          style="width: 200px; margin-right: 10px;"
      />
    </div>
    <el-tabs v-model="activeName" type="card" class="demo-tabs" @tab-click="handleTabClick">
      <el-tab-pane v-for="type in yuhunTypes" :key="type.name" :label="type.label" :name="type.name">
        <div style="max-height: 500px; overflow-y: auto;">
        <el-space wrap size="large" style="">
          <div v-for="yuhun in filterYuhunByTypeAndSearch(activeName,searchText)" :key="yuhun.name">
            <el-button style="width: 100px; height: 100px;" @click="confirm(yuhun)">
              <img :src="yuhun.avatar" style="width: 99px; height: 99px;">
            </el-button>
            <span style="text-align: center; display: block;">{{yuhun.name}}</span>
          </div>
        </el-space>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import {ref, watch, computed} from 'vue';
import shikigamiData from '../data/Shikigami.json';
import yuhunData from '../data/Yuhun.json';
import {useI18n} from 'vue-i18n'

// 获取当前的 i18n 实例
const {t} = useI18n()

const props = defineProps({
  currentShikigami: {
    type: Object,
    default: () => ({})
  },
  showYuhunSelect: Boolean
});

const emit = defineEmits(['updateYuhunSelect', 'closeYuhunSelect']);

const searchText = ref('') // 新增搜索文本
const show = ref(false);
const activeName = ref('ALL');
const current = ref(props.currentShikigami);
const yuhunTypes = [
  {label: '全部', name: 'ALL'},
  {label: '攻击加成', name: 'Attack'},
  {label: '暴击', name: 'Crit'},
  {label: '生命加成', name: 'Health'},
  {label: '防御加成', name: 'Defense'},
  {label: '效果命中', name: 'ControlHit'},
  {label: '效果抵抗', name: 'ControlMiss'},
  {label: '暴击伤害', name: 'CritDamage'},
  {label: '首领御魂', name: 'PVE'}
];

watch(() => props.showYuhunSelect, (newVal) => {
  show.value = newVal;
});

watch(() => props.currentShikigami, (newVal) => {
  current.value = newVal;
});

const handleTabClick = (tab) => {
  console.log(tab.paneName);
};

const filterYuhunByTypeAndSearch = (type: string, search: string) => {
  let filteredList = yuhunData;

  // 按类型过滤
  if (type.toLowerCase() !== 'all') {
    filteredList = filteredList.filter(item =>
        item.type.toLowerCase() === type.toLowerCase()
    );
  }

  // 按搜索关键字过滤
  if (search.trim() !== '') {
    filteredList = filteredList.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  return filteredList;
};

const cancel = () => {
  emit('closeYuhunSelect');
};

const confirm = (item) => {
  emit('updateYuhunSelect', JSON.parse(JSON.stringify(item)), 'Update');
  searchText.value=''
  activeName.value = 'ALL'
};

const remove = () => {
  emit('updateYuhunSelect',undefined,'Remove')
}
</script>