<template>
  <el-dialog v-model="show" :title="config.title">
    <span v-if="config.currentItem">
      当前选择：{{ config.currentItem[config.itemRender.labelField] }}
    </span>

    <!-- 搜索框 -->
    <div v-if="config.searchable !== false" style="display: flex; align-items: center;">
      <el-input
        v-model="searchText"
        placeholder="请输入内容"
        style="width: 200px; margin-right: 10px;"
      />
    </div>

    <!-- Tab分组 -->
    <el-tabs
      v-model="activeTab"
      type="card"
      class="demo-tabs"
    >
      <el-tab-pane
        v-for="group in config.groups"
        :key="group.name"
        :label="group.label"
        :name="group.name"
      >
        <div style="max-height: 600px; overflow-y: auto;">
          <el-space wrap size="large">
            <div
              v-for="item in filteredItems(group)"
              :key="item[config.itemRender.labelField]"
              style="display: flex; flex-direction: column; justify-content: center"
            >
              <el-button
                class="selector-button"
                :style="`width: ${imageSize}px; height: ${imageSize}px;`"
                @click="handleSelect(item)"
              >
                <span
                  class="selector-image-frame"
                  :style="`width: ${imageSize - 1}px; height: ${imageSize - 1}px; background-image: url('${getItemImageUrl(item)}');`"
                />
              </el-button>
              <span style="text-align: center; display: block;">
                {{ item[config.itemRender.labelField] }}
              </span>
            </div>
          </el-space>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SelectorConfig, GroupConfig } from '@/types/selector'
import { resolveAssetUrl } from '@/utils/assetUrl'

const props = defineProps<{
  config: SelectorConfig
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'select': [item: any]
}>()

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const searchText = ref('')
const activeTab = ref('ALL')
const imageSize = computed(() => props.config.itemRender.imageSize || 100)
const imageField = computed(() => props.config.itemRender.imageField)

// 过滤逻辑
const filteredItems = (group: GroupConfig) => {
  let items = props.config.dataSource

  // 分组过滤
  if (group.name !== 'ALL') {
    if (group.filter) {
      items = items.filter(group.filter)
    } else if (!props.config.groupField) {
      items = []
    } else {
      items = items.filter(item =>
        item[props.config.groupField]?.toLowerCase() === group.name.toLowerCase()
      )
    }
  }

  // 搜索过滤
  if (searchText.value.trim()) {
    const searchFields = props.config.searchFields || [props.config.itemRender.labelField]
    items = items.filter(item =>
      searchFields.some(field =>
        item[field]?.toLowerCase().includes(searchText.value.toLowerCase())
      )
    )
  }

  return items
}

const handleSelect = (item: any) => {
  const field = imageField.value
  const normalizedItem = {
    ...item,
    [field]: resolveAssetUrl(item?.[field])
  }
  emit('select', normalizedItem)
  searchText.value = ''
  activeTab.value = 'ALL'
}

const getItemImageUrl = (item: any) => resolveAssetUrl(item?.[imageField.value]) as string
</script>

<style scoped>
.selector-button {
  padding: 0;
}

.selector-image-frame {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}
</style>
