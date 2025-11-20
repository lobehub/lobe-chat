import { ClientDBLoadingProgress, DatabaseLoadingState } from '@lobechat/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DatabaseManager } from './db';

// Mock 所有外部依赖
vi.mock('@electric-sql/pglite', () => ({
  default: vi.fn(),
  IdbFs: vi.fn(),
  PGlite: vi.fn(),
  MemoryFS: vi.fn(),
}));

vi.mock('@electric-sql/pglite/vector', () => ({
  default: vi.fn(),
  vector: vi.fn(),
}));

vi.mock('drizzle-orm/pglite', () => ({
  drizzle: vi.fn(() => ({
    dialect: {
      migrate: vi.fn().mockResolvedValue(undefined),
    },
  })),
}));

let manager: DatabaseManager;
let progressEvents: ClientDBLoadingProgress[] = [];
let stateChanges: DatabaseLoadingState[] = [];

let callbacks = {
  onProgress: vi.fn((progress: ClientDBLoadingProgress) => {
    progressEvents.push(progress);
  }),
  onStateChange: vi.fn((state: DatabaseLoadingState) => {
    stateChanges.push(state);
  }),
};

beforeEach(() => {
  vi.clearAllMocks();
  progressEvents = [];
  stateChanges = [];

  callbacks = {
    onProgress: vi.fn((progress: ClientDBLoadingProgress) => {
      progressEvents.push(progress);
    }),
    onStateChange: vi.fn((state: DatabaseLoadingState) => {
      stateChanges.push(state);
    }),
  };
  // @ts-expect-error
  DatabaseManager['instance'] = undefined;
  manager = DatabaseManager.getInstance();
});

describe('DatabaseManager', () => {
  describe('Callback Handling', () => {
    it(
      'should properly track loading states',
      async () => {
        await manager.initialize(callbacks);

        // 验证状态转换顺序
        expect(stateChanges).toEqual([
          DatabaseLoadingState.Initializing,
          DatabaseLoadingState.LoadingDependencies,
          DatabaseLoadingState.LoadingWasm,
          DatabaseLoadingState.Migrating,
          DatabaseLoadingState.Finished,
          DatabaseLoadingState.Ready,
        ]);
      },
      {
        timeout: 15000,
      },
    );

    it('should report dependencies loading progress', async () => {
      await manager.initialize(callbacks);

      // 验证依赖加载进度回调
      const dependencyProgress = progressEvents.filter((e) => e.phase === 'dependencies');
      expect(dependencyProgress.length).toBeGreaterThan(0);
      expect(dependencyProgress[dependencyProgress.length - 1]).toEqual(
        expect.objectContaining({
          phase: 'dependencies',
          progress: 100,
          costTime: expect.any(Number),
        }),
      );
    });

    it('should report WASM loading progress', async () => {
      await manager.initialize(callbacks);

      // 验证 WASM 加载进度回调
      const wasmProgress = progressEvents.filter((e) => e.phase === 'wasm');
      // expect(wasmProgress.length).toBeGreaterThan(0);
      expect(wasmProgress[wasmProgress.length - 1]).toEqual(
        expect.objectContaining({
          phase: 'wasm',
          progress: 100,
          costTime: expect.any(Number),
        }),
      );
    });

    it('should handle initialization errors', async () => {
      // 模拟加载失败
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      await expect(manager.initialize(callbacks)).rejects.toThrow();
      expect(stateChanges).toContain(DatabaseLoadingState.Error);
    });

    it('should only initialize once when called multiple times', async () => {
      const firstInit = manager.initialize(callbacks);
      const secondInit = manager.initialize(callbacks);

      await Promise.all([firstInit, secondInit]);

      // 验证回调只被调用一次
      const readyStateCount = stateChanges.filter(
        (state) => state === DatabaseLoadingState.Ready,
      ).length;
      expect(readyStateCount).toBe(1);
    });
  });

  describe('Progress Calculation', () => {
    it('should report progress between 0 and 100', async () => {
      await manager.initialize(callbacks);

      // 验证所有进度值都在有效范围内
      progressEvents.forEach((event) => {
        expect(event.progress).toBeGreaterThanOrEqual(0);
        expect(event.progress).toBeLessThanOrEqual(100);
      });
    });

    it('should include timing information', async () => {
      await manager.initialize(callbacks);

      // 验证最终进度回调包含耗时信息
      const finalProgress = progressEvents[progressEvents.length - 1];
      expect(finalProgress.costTime).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing callbacks gracefully', async () => {
      // 测试没有提供回调的情况
      await expect(manager.initialize()).resolves.toBeDefined();
    });

    it('should handle partial callbacks', async () => {
      // 只提供部分回调
      await expect(manager.initialize({ onProgress: callbacks.onProgress })).resolves.toBeDefined();
      await expect(
        manager.initialize({ onStateChange: callbacks.onStateChange }),
      ).resolves.toBeDefined();
    });
  });

  describe('Database Access', () => {
    it('should throw error when accessing database before initialization', () => {
      expect(() => manager.db).toThrow('Database not initialized');
    });

    it('should provide access to database after initialization', async () => {
      await manager.initialize();
      expect(() => manager.db).not.toThrow();
    });
  });
});
