<template>
  <el-dialog
      v-model="show"
      title="请选择式神"
      @close="cancel"
      :before-close="cancel"
  >
    <span>当前选择式神：{{ current.name }}</span>
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
import { ref, watch, computed } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import shikigamiData from "../data/Shikigami.json"

interface Shikigami {
  name: string
  avatar: string
  rarity: string
}

const props = defineProps({
  currentShikigami: {
    type: Object as () => Shikigami,
    default: () => ({ name: '' })
  },
  showSelectShikigami: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['closeSelectShikigami', 'updateShikigami'])

const searchText = ref('') // 新增搜索文本
const activeName = ref('ALL')
let current = ref({name:''})
const show = ref(false)

const rarityLevels = [
  { label: "全部", name: "ALL" },
  { label: "UR", name: "UR" },
  { label: "SP", name: "SP" },
  { label: "SSR", name: "SSR" },
  { label: "SR", name: "SR" },
  { label: "R", name: "R" },
  { label: "N", name: "N" },
  { label: "联动", name: "L" },
  { label: "呱太", name: "G" },
]

watch(() => props.showSelectShikigami, (newVal) => {
  show.value = newVal
})

watch(() => props.currentShikigami, (newVal) => {
  console.log("ShikigamiSelect.vue" + current.value.name)
  current.value = newVal
  console.log("ShikigamiSelect.vue" + current.value.name)
}, {deep: true})


const handleClick = (tab: TabsPaneContext) => {
  console.log('Tab clicked:', tab)
}

const cancel = () => {
  emit('closeSelectShikigami')
  show.value = false
}

const confirm = (shikigami: Shikigami) => {
  emit('updateShikigami', shikigami)
  searchText.value=''
  activeName.value='ALL'
  // cancel()
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