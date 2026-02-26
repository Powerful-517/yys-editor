const STORAGE_KEY = 'yys-editor.custom-assets.v1'

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

const readStore = (): CustomAssetStore => {
  if (!isClient()) {
    return {}
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return {}
  }
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return parsed as CustomAssetStore
    }
  } catch {
    // ignore
  }
  return {}
}

const writeStore = (store: CustomAssetStore) => {
  if (!isClient()) {
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
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
  const store = readStore()
  return Array.isArray(store[library]) ? store[library] : []
}

export const saveCustomAsset = (library: string, asset: CustomAssetItem) => {
  const store = readStore()
  const assets = Array.isArray(store[library]) ? store[library] : []
  store[library] = [asset, ...assets]
  writeStore(store)
}

export const deleteCustomAsset = (library: string, assetId: string) => {
  const store = readStore()
  const assets = Array.isArray(store[library]) ? store[library] : []
  store[library] = assets.filter((item) => item.id !== assetId)
  writeStore(store)
}

export const createCustomAssetFromFile = async (library: string, file: File): Promise<CustomAssetItem> => {
  const avatar = await readFileAsDataUrl(file)
  const now = new Date().toISOString()
  const id = `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
  const asset: CustomAssetItem = {
    id,
    name: normalizeFileName(file.name),
    avatar,
    library,
    __userAsset: true,
    createdAt: now
  }
  saveCustomAsset(library, asset)
  return asset
}

