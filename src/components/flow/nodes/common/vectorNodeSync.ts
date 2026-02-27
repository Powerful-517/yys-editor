export interface VectorConfig {
  kind: string;
  svgContent: string;
  path: string;
  tileWidth: number;
  tileHeight: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export const DEFAULT_VECTOR_CONFIG: VectorConfig = {
  kind: 'rect',
  svgContent: '',
  path: '',
  tileWidth: 50,
  tileHeight: 50,
  fill: '#409EFF',
  stroke: '#303133',
  strokeWidth: 1
};

const VECTOR_CONFIG_KEYS: Array<keyof VectorConfig> = [
  'kind',
  'svgContent',
  'path',
  'tileWidth',
  'tileHeight',
  'fill',
  'stroke',
  'strokeWidth'
];

type FrameRequest = (callback: FrameRequestCallback) => number;
type FrameCancel = (handle: number) => void;

const getDefaultRequestFrame = (): FrameRequest | undefined =>
  typeof globalThis.requestAnimationFrame === 'function'
    ? globalThis.requestAnimationFrame.bind(globalThis)
    : undefined;

const getDefaultCancelFrame = (): FrameCancel | undefined =>
  typeof globalThis.cancelAnimationFrame === 'function'
    ? globalThis.cancelAnimationFrame.bind(globalThis)
    : undefined;

export function buildNextVectorConfig(
  current: VectorConfig,
  incoming?: Record<string, any> | null
): VectorConfig | null {
  if (!incoming || typeof incoming !== 'object') {
    return null;
  }

  let changed = false;
  const next = { ...current };

  for (const key of VECTOR_CONFIG_KEYS) {
    if (!(key in incoming)) {
      continue;
    }
    const incomingValue = incoming[key];
    if (incomingValue === undefined || incomingValue === current[key]) {
      continue;
    }
    (next as Record<string, any>)[key] = incomingValue;
    changed = true;
  }

  return changed ? next : null;
}

export function createRafLatestScheduler<T>(
  apply: (payload: T) => void,
  options?: {
    requestFrame?: FrameRequest;
    cancelFrame?: FrameCancel;
  }
) {
  const requestFrame = options?.requestFrame ?? getDefaultRequestFrame();
  const cancelFrame = options?.cancelFrame ?? getDefaultCancelFrame();

  let rafId: number | null = null;
  let pendingPayload: T | null = null;

  const flush = () => {
    if (pendingPayload === null) {
      return;
    }
    const latestPayload = pendingPayload;
    pendingPayload = null;
    apply(latestPayload);
  };

  const schedule = () => {
    if (!requestFrame) {
      flush();
      return;
    }
    if (rafId !== null) {
      return;
    }
    rafId = requestFrame(() => {
      rafId = null;
      flush();
    });
  };

  return {
    enqueue(payload: T) {
      pendingPayload = payload;
      schedule();
    },
    flush,
    cancel() {
      if (rafId !== null && cancelFrame) {
        cancelFrame(rafId);
      }
      rafId = null;
      pendingPayload = null;
    }
  };
}
