import { useI18n } from 'vue-i18n'

type TranslateFn = (key: string, ...args: any[]) => string

export function useSafeI18n(fallbackMap: Record<string, string> = {}) {
  let safeT: TranslateFn = (key) => fallbackMap[key] ?? key

  try {
    const { t } = useI18n()
    safeT = (key: string, ...args: any[]) => {
      const translated = t(key, ...args)
      if (typeof translated === 'string' && translated.length > 0) {
        return translated
      }
      return fallbackMap[key] ?? key
    }
  } catch {
    // The host app may not install vue-i18n; fallback to key/default text.
  }

  return { t: safeT }
}
