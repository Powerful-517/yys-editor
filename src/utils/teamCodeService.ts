import jsQR from 'jsqr'

const DEFAULT_TEAM_CODE_SERVICE_URL = 'http://127.0.0.1:8788/api/team-code/convert'

export const TEAM_CODE_SERVICE_URL = (
  import.meta.env.VITE_TEAM_CODE_SERVICE_URL as string | undefined
)?.trim() || DEFAULT_TEAM_CODE_SERVICE_URL

type UnknownRecord = Record<string, unknown>

const normalizeText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

const readErrorMessageFromPayload = (payload: unknown): string => {
  if (!payload || typeof payload !== 'object') return ''
  const record = payload as UnknownRecord
  return normalizeText(record.error) || normalizeText(record.message)
}

const pickRootDocument = (payload: unknown): UnknownRecord | null => {
  if (!payload || typeof payload !== 'object') return null
  const root = payload as UnknownRecord
  if (Array.isArray(root.fileList)) return root

  const candidates = [root.data, root.root, root.payload]
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue
    if (Array.isArray((candidate as UnknownRecord).fileList)) {
      return candidate as UnknownRecord
    }
  }
  return null
}

const createImageElementFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法读取二维码图片，请确认图片格式正确'))
    }
    image.src = url
  })
}

const extractImageData = (image: HTMLImageElement, scale = 1): ImageData => {
  const width = Math.max(1, Math.floor(image.naturalWidth * scale))
  const height = Math.max(1, Math.floor(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('浏览器无法创建 Canvas 2D 上下文')
  }
  context.drawImage(image, 0, 0, width, height)
  return context.getImageData(0, 0, width, height)
}

// 前端仅负责二维码图片识别为字符串，不做阵容码协议解析
export const decodeTeamCodeFromQrImage = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('请选择二维码图片')
  }

  const image = await createImageElementFromFile(file)
  const scales = [1, 0.75, 0.5, 1.5, 2]

  for (const scale of scales) {
    const imageData = extractImageData(image, scale)
    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    })
    const rawValue = normalizeText(result?.data)
    if (rawValue) return rawValue
  }

  throw new Error('未识别到有效二维码，请确认图片清晰且仅包含一个阵容码二维码')
}

// 阵容码字符串 -> RootDocument 由后端服务完成
export const convertTeamCodeToRootDocument = async (
  teamCode: string,
  serviceUrl = TEAM_CODE_SERVICE_URL,
): Promise<UnknownRecord> => {
  const normalizedTeamCode = normalizeText(teamCode)
  if (!normalizedTeamCode) {
    throw new Error('请输入阵容码')
  }

  const response = await fetch(serviceUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ teamCode: normalizedTeamCode }),
  })

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch (error) {
    console.error('解析后端响应失败:', error)
    throw new Error('阵容码服务返回了非 JSON 响应')
  }

  if (!response.ok) {
    const errorMessage = readErrorMessageFromPayload(payload)
    throw new Error(errorMessage || '阵容码解析失败')
  }

  const root = pickRootDocument(payload)
  if (!root) {
    throw new Error('阵容码解析成功，但响应不包含可导入的 fileList')
  }
  return root
}

