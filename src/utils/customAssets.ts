export const CUSTOM_ASSET_STORAGE_KEY = 'yys-editor.custom-assets.v1'
const CUSTOM_ASSET_UPDATED_EVENT = 'yys-editor.custom-assets.updated'

export type CustomAssetItem = {
  id: string
  name: string
  avatar: string
  library: string
  __userAsset: true
  createdAt: string
}

type CustomAssetStore = Record<string, CustomAssetItem[]>

const isClient = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined'
const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')
const normalizeLibraryKey = (library: string): string => normalizeText(library).toLowerCase()

const createLegacyAssetId = (library: string, name: string, avatar: string): string => {
  const seed = `${library}|${name}|${avatar}`
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(index)
    hash |= 0
  }
  return `custom_legacy_${Math.abs(hash).toString(36)}`
}

const buildCustomAssetId = (): string => {
  return `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

const normalizeAssetItem = (library: string, input: unknown): CustomAssetItem | null => {
  if (!input || typeof input !== 'object') {
    return null
  }

  const raw = input as Record<string, unknown>
  const name = normalizeText(raw.name) || '用户素材'
  const avatar = normalizeText(raw.avatar)
  if (!avatar) {
    return null
  }

  const normalizedLibrary = normalizeLibraryKey(library)
  const id = normalizeText(raw.id) || createLegacyAssetId(normalizedLibrary, name, avatar)
  const createdAt = normalizeText(raw.createdAt) || '1970-01-01T00:00:00.000Z'

  return {
    id,
    name,
    avatar,
    library: normalizedLibrary,
    __userAsset: true,
    createdAt
  }
}

const normalizeStore = (input: unknown): CustomAssetStore => {
  if (!input || typeof input !== 'object') {
    return {}
  }

  const parsed = input as Record<string, unknown>
  const normalizedStore: CustomAssetStore = {}
  Object.entries(parsed).forEach(([library, assets]) => {
    const normalizedLibrary = normalizeLibraryKey(library)
    if (!normalizedLibrary || !Array.isArray(assets)) {
      return
    }
    const normalizedAssets = assets
      .map((item) => normalizeAssetItem(normalizedLibrary, item))
      .filter((item): item is CustomAssetItem => !!item)
    if (normalizedAssets.length > 0) {
      normalizedStore[normalizedLibrary] = normalizedAssets
    }
  })

  return normalizedStore
}

const notifyStoreUpdated = () => {
  if (!isClient()) {
    return
  }
  window.dispatchEvent(new CustomEvent(CUSTOM_ASSET_UPDATED_EVENT))
}

const readStore = (): CustomAssetStore => {
  if (!isClient()) {
    return {}
  }
  const raw = localStorage.getItem(CUSTOM_ASSET_STORAGE_KEY)
  if (!raw) {
    return {}
  }
  try {
    const parsed = JSON.parse(raw)
    const normalized = normalizeStore(parsed)
    const normalizedRaw = JSON.stringify(normalized)
    if (normalizedRaw !== raw) {
      localStorage.setItem(CUSTOM_ASSET_STORAGE_KEY, normalizedRaw)
    }
    return normalized
  } catch {
    // ignore
  }
  return {}
}

const writeStore = (store: CustomAssetStore) => {
  if (!isClient()) {
    return
  }
  localStorage.setItem(CUSTOM_ASSET_STORAGE_KEY, JSON.stringify(store))
  notifyStoreUpdated()
}

const normalizeFileName = (fileName: string): string => {
  const stripped = fileName.replace(/\.[a-z0-9]+$/i, '')
  return stripped.trim() || '用户素材'
}

const readFileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(file)
})

export const listCustomAssets = (library: string): CustomAssetItem[] => {
  const normalizedLibrary = normalizeLibraryKey(library)
  if (!normalizedLibrary) {
    return []
  }
  const store = readStore()
  return Array.isArray(store[normalizedLibrary]) ? store[normalizedLibrary] : []
}

export const saveCustomAsset = (library: string, asset: CustomAssetItem) => {
  const normalizedLibrary = normalizeLibraryKey(library)
  if (!normalizedLibrary) {
    return
  }
  const store = readStore()
  const normalizedAsset = normalizeAssetItem(normalizedLibrary, asset)
  if (!normalizedAsset) {
    return
  }
  const assets = Array.isArray(store[normalizedLibrary]) ? store[normalizedLibrary] : []
  const dedupedAssets = assets.filter((item) => (
    item.id !== normalizedAsset.id
      && !(item.avatar === normalizedAsset.avatar && item.name === normalizedAsset.name)
  ))
  store[normalizedLibrary] = [normalizedAsset, ...dedupedAssets]
  writeStore(store)
}

export const deleteCustomAsset = (
  library: string,
  assetRef: string | Pick<Partial<CustomAssetItem>, 'id' | 'name' | 'avatar'>
) => {
  const normalizedLibrary = normalizeLibraryKey(library)
  if (!normalizedLibrary) {
    return
  }
  const store = readStore()
  const assets = Array.isArray(store[normalizedLibrary]) ? store[normalizedLibrary] : []
  const targetId = typeof assetRef === 'string' ? normalizeText(assetRef) : normalizeText(assetRef?.id)
  const targetAvatar = typeof assetRef === 'string' ? '' : normalizeText(assetRef?.avatar)
  const targetName = typeof assetRef === 'string' ? '' : normalizeText(assetRef?.name)

  store[normalizedLibrary] = assets.filter((item) => {
    if (targetId && item.id === targetId) {
      return false
    }
    if (!targetAvatar) {
      return true
    }
    if (item.avatar !== targetAvatar) {
      return true
    }
    if (!targetName) {
      return false
    }
    return item.name !== targetName
  })
  writeStore(store)
}

export const createCustomAssetFromFile = async (library: string, file: File): Promise<CustomAssetItem> => {
  const avatar = await readFileAsDataUrl(file)
  const now = new Date().toISOString()
  const normalizedLibrary = normalizeLibraryKey(library)
  const id = buildCustomAssetId()
  const asset: CustomAssetItem = {
    id,
    name: normalizeFileName(file.name),
    avatar,
    library: normalizedLibrary,
    __userAsset: true,
    createdAt: now
  }
  saveCustomAsset(normalizedLibrary, asset)
  return asset
}

export const subscribeCustomAssetStore = (listener: () => void): (() => void) => {
  if (!isClient()) {
    return () => {}
  }
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CUSTOM_ASSET_STORAGE_KEY) {
      listener()
    }
  }
  const handleLocalUpdate = () => {
    listener()
  }
  window.addEventListener('storage', handleStorage)
  window.addEventListener(CUSTOM_ASSET_UPDATED_EVENT, handleLocalUpdate)
  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(CUSTOM_ASSET_UPDATED_EVENT, handleLocalUpdate)
  }
}
