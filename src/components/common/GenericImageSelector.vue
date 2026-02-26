<template>
  <el-dialog v-model="show" :title="config.title">
    <span v-if="config.currentItem">
      当前选择：{{ config.currentItem[config.itemRender.labelField] }}
    </span>

    <div v-if="config.allowUserAssetUpload" class="user-asset-actions">
      <input
        ref="uploadInputRef"
        type="file"
        accept="image/*"
        class="hidden-input"
        @change="handleUploadAsset"
      />
      <el-button size="small" type="primary" @click="triggerUpload">上传我的素材</el-button>
    </div>

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
              :key="item.id || item[config.itemRender.labelField]"
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
              <el-button
                v-if="item.__userAsset"
                type="danger"
                text
                size="small"
                @click.stop="removeUserAsset(item)"
              >
                删除
              </el-button>
            </div>
          </el-space>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SelectorConfig, GroupConfig } from '@/types/selector'
import { resolveAssetUrl } from '@/utils/assetUrl'
import { createCustomAssetFromFile } from '@/utils/customAssets'

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
const uploadInputRef = ref<HTMLInputElement | null>(null)
const dataSource = ref<any[]>([])

watch(
  () => props.config.dataSource,
  (value) => {
    dataSource.value = Array.isArray(value) ? [...value] : []
  },
  { immediate: true, deep: true }
)

// 过滤逻辑
const filteredItems = (group: GroupConfig) => {
  let items = dataSource.value

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

const triggerUpload = () => {
  uploadInputRef.value?.click()
}

const handleUploadAsset = async (event: Event) => {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file || !props.config.assetLibrary) {
    if (target) {
      target.value = ''
    }
    return
  }

  try {
    const createdAsset = await createCustomAssetFromFile(props.config.assetLibrary, file)
    dataSource.value = [createdAsset, ...dataSource.value]
    props.config.onUserAssetUploaded?.(createdAsset)
  } finally {
    if (target) {
      target.value = ''
    }
  }
}

const removeUserAsset = (item: any) => {
  if (!item?.id) {
    return
  }
  props.config.onDeleteUserAsset?.(item)
  dataSource.value = dataSource.value.filter((entry) => entry.id !== item.id)
}
</script>

<style scoped>
.user-asset-actions {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.hidden-input {
  display: none;
}

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
