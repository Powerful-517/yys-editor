<template>
  <el-dialog
      v-model="show"
      title="请选择御魂"
      @close="cancel"
      :before-close="cancel"
  >
    <span>当前选择御魂：{{ current.name }}</span>
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
          v-for="(type, index) in yuhunTypes"
          :key="index"
          :label="type.label"
          :name="type.name"
      >
        <div style="max-height: 600px; overflow-y: auto;">
          <el-space wrap size="large">
            <div style="display: flex;flex-direction: column;justify-content: center" v-for="i in filterYuhunByTypeAndSearch(type.name, searchText)" :key="i.name">
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
import yuhunData from "../../../../data/Yuhun.json"

interface Yuhun {
  name: string
  shortName?: string
  type: string
  avatar: string
}

const props = defineProps({
  currentYuhun: {
    type: Object as () => Yuhun,
    default: () => ({ name: '' })
  },
  showSelectYuhun: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['closeSelectYuhun', 'updateYuhun'])

const searchText = ref('') // 搜索文本
const activeName = ref('ALL')
let current = ref({name:''})
const show = ref(false)

const yuhunTypes = [
  { label: "全部", name: "ALL" },
  { label: "攻击类", name: "attack" },
  { label: "暴击类", name: "Crit" },
  { label: "生命类", name: "Health" },
  { label: "防御类", name: "Defense" },
  { label: "效果命中", name: "Effect" },
  { label: "效果抵抗", name: "EffectResist" },
  { label: "特殊类", name: "Special" }
]

watch(() => props.showSelectYuhun, (newVal) => {
  show.value = newVal
})

watch(() => props.currentYuhun, (newVal) => {
  console.log("YuhunSelect.vue" + current.value.name)
  current.value = newVal
  console.log("YuhunSelect.vue" + current.value.name)
}, {deep: true})

const handleClick = (tab: TabsPaneContext) => {
  console.log('Tab clicked:', tab)
}

const cancel = () => {
  emit('closeSelectYuhun')
  show.value = false
}

const confirm = (yuhun: Yuhun) => {
  emit('updateYuhun', yuhun)
  searchText.value=''
  activeName.value='ALL'
  // cancel()
}

// 过滤函数
const filterYuhunByTypeAndSearch = (type: string, search: string) => {
  let filteredList = yuhunData;
  if (type.toLowerCase() !== 'all') {
    filteredList = filteredList.filter(item =>
        item.type.toLowerCase() === type.toLowerCase()
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