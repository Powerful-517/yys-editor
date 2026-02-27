import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_VECTOR_CONFIG,
  buildNextVectorConfig,
  createRafLatestScheduler,
  type VectorConfig
} from '@/components/flow/nodes/common/vectorNodeSync';

function createFakeRaf() {
  let id = 0;
  const callbacks = new Map<number, FrameRequestCallback>();

  const requestFrame = vi.fn((cb: FrameRequestCallback) => {
    id += 1;
    callbacks.set(id, cb);
    return id;
  });

  const cancelFrame = vi.fn((handle: number) => {
    callbacks.delete(handle);
  });

  const runFrame = () => {
    const pending = Array.from(callbacks.values());
    callbacks.clear();
    pending.forEach((cb) => cb(Date.now()));
  };

  return {
    requestFrame,
    cancelFrame,
    runFrame
  };
}

describe('vectorNodeSync', () => {
  it('只在 vector 配置变化时生成下一次提交配置', () => {
    const current: VectorConfig = { ...DEFAULT_VECTOR_CONFIG };

    expect(buildNextVectorConfig(current, { ...current })).toBeNull();

    const next = buildNextVectorConfig(current, {
      fill: '#000000',
      tileWidth: 64
    });

    expect(next).toMatchObject({
      fill: '#000000',
      tileWidth: 64
    });
    expect(next?.tileHeight).toBe(current.tileHeight);
  });

  it('同一帧连续缩放事件只提交最后一次更新，避免重复抖动', () => {
    const fakeRaf = createFakeRaf();
    const commits: VectorConfig[] = [];
    const scheduler = createRafLatestScheduler<VectorConfig>(
      (payload) => {
        commits.push(payload);
      },
      {
        requestFrame: fakeRaf.requestFrame,
        cancelFrame: fakeRaf.cancelFrame
      }
    );

    scheduler.enqueue({ ...DEFAULT_VECTOR_CONFIG, strokeWidth: 1 });
    scheduler.enqueue({ ...DEFAULT_VECTOR_CONFIG, strokeWidth: 2 });
    scheduler.enqueue({ ...DEFAULT_VECTOR_CONFIG, strokeWidth: 3 });

    expect(fakeRaf.requestFrame).toHaveBeenCalledTimes(1);
    expect(commits).toHaveLength(0);

    fakeRaf.runFrame();

    expect(commits).toHaveLength(1);
    expect(commits[0].strokeWidth).toBe(3);
  });

  it('连续缩放仅变化尺寸时不会触发矢量配置重复提交', () => {
    const fakeRaf = createFakeRaf();
    const commits: VectorConfig[] = [];
    const scheduler = createRafLatestScheduler<VectorConfig>(
      (payload) => {
        commits.push(payload);
      },
      {
        requestFrame: fakeRaf.requestFrame,
        cancelFrame: fakeRaf.cancelFrame
      }
    );

    const current = { ...DEFAULT_VECTOR_CONFIG };
    for (let i = 0; i < 40; i += 1) {
      const next = buildNextVectorConfig(current, { ...current });
      if (next) {
        scheduler.enqueue(next);
      }
    }

    expect(fakeRaf.requestFrame).not.toHaveBeenCalled();
    expect(commits).toHaveLength(0);
  });
});
