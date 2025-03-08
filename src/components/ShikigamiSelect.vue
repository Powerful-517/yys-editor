<template>
  <el-dialog
      v-model="show"
      title="请选择式神"
      @close="cancel"
      :before-close="cancel"
  >
    <span>当前选择式神：{{ current.name }}</span>
    <el-tabs
        v-model="activeName"
        type="card"
        class="demo-tabs"
        @tab-click="handleClick"
    >
      <el-tab-pane
          v-for="(rarity, index) in rarityLevels"
          :key="index"
          :label="rarity.label"
          :name="rarity.name"
      >
        <div style="max-height: 600px; overflow-y: auto;">
          <el-space wrap size="large">
            <div v-for="i in filterShikigamiByRarity(rarity.name)" :key="i.name">
              <el-button
                  style="width: 100px; height: 100px;"
                  @click.stop="confirm(i)"
              >
                <img :src="i.avatar" style="width: 99px; height: 99px;">
              </el-button>
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

const activeName = ref('ALL')
let current = ref({name:''})
const show = ref(false)

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
  // cancel()
}

const filterShikigamiByRarity = (rarity: string) => {
  if (rarity.toLowerCase() === 'all') return shikigamiData
  return shikigamiData.filter(item =>
      item.rarity.toLowerCase() === rarity.toLowerCase()
  )
}
</script>