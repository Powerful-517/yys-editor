<template>
  <el-dialog
      v-model="show"
      title="请选择式神"
  >
    <span>当前选择式神：{{ props.currentShikigami.name }}</span>
    <div style="display: flex; align-items: center;">
      <el-input
          placeholder="请输入内容"
          v-model="searchText"
          style="width: 200px; margin-right: 10px;"
      />
    </div>
    <el-tabs
        v-model="activeName"
        type="card"
        class="demo-tabs"
        @tab-click="handleClick"
        editable
    >
      <el-tab-pane
          v-for="(rarity, index) in rarityLevels"
          :key="index"
          :label="rarity.label"
          :name="rarity.name"
      >
        <div style="max-height: 600px; overflow-y: auto;">
          <el-space wrap size="large">
            <div style="display: flex;flex-direction: column;justify-content: center" v-for="i in filterShikigamiByRarityAndSearch(rarity.name,searchText)" :key="i.name">
              <el-button
                  style="width: 100px; height: 100px;"
                  @click.stop="confirm(i)"
              >
                <img :src="i.avatar" style="width: 99px; height: 99px;">
              </el-button>
              <span style="text-align: center; display: block;">{{i.name}}</span>
            </div>
          </el-space>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import shikigamiData from "../../../../data/Shikigami.json"

interface Shikigami {
  name: string
  avatar: string
  rarity: string
}

const props = defineProps({
  currentShikigami: {
    type: Object as () => Shikigami,
    default: () => ({ name: '未选择式神', avatar: '', rarity: '' })
  },
  showSelectShikigami: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['closeSelectShikigami', 'updateShikigami'])

const show = computed({
  get() {
    return props.showSelectShikigami
  },
  set(value) {
    if (!value) {
      emit('closeSelectShikigami')
    }
  }
})

const searchText = ref('')
const activeName = ref('ALL')

const rarityLevels = [
  { label: "全部", name: "ALL" },
  { label: "SP", name: "SP" },
  { label: "SSR", name: "SSR" },
  { label: "SR", name: "SR" },
  { label: "R", name: "R" },
  { label: "N", name: "N" },
  { label: "联动", name: "L" },
  { label: "呱太", name: "G" },
]

const handleClick = (tab: TabsPaneContext) => {
  console.log('Tab clicked:', tab)
}

const confirm = (shikigami: Shikigami) => {
  emit('updateShikigami', shikigami)
  searchText.value = ''
  activeName.value = 'ALL'
}

// 修改后的过滤函数
const filterShikigamiByRarityAndSearch = (rarity: string, search: string) => {
  let filteredList = shikigamiData;
  if (rarity.toLowerCase() !== 'all') {
    filteredList = filteredList.filter(item =>
        item.rarity.toLowerCase() === rarity.toLowerCase()
    );
  }
  if (search.trim() !== '') {
    return filteredList.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  return filteredList;
}
</script>