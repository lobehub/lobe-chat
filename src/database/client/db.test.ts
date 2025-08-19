import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientDBLoadingProgress, DatabaseLoadingState } from '@/types/clientDB';

import { DatabaseManager } from './db';

// Mock fetch globally
global.fetch = vi.fn();

// Mock WebAssembly
global.WebAssembly = {
  compile: vi.fn().mockResolvedValue({}),
} as any;

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  writable: true,
});

// Mock indexedDB
Object.defineProperty(global, 'indexedDB', {
  value: {
    deleteDatabase: vi.fn().mockReturnValue({
      onsuccess: null,
      onerror: null,
      onblocked: null,
    }),
  },
  writable: true,
});

// Mock PGlite and related modules
vi.mock('@electric-sql/pglite', () => {
  const mockPGlite = vi.fn().mockImplementation(() => ({
    close: vi.fn().mockResolvedValue(undefined),
  }));

  return {
    default: mockPGlite,
    IdbFs: vi.fn(),
    PGlite: mockPGlite,
    MemoryFS: vi.fn(),
  };
});

vi.mock('@electric-sql/pglite/vector', () => ({
  default: vi.fn(),
  vector: vi.fn(),
}));

vi.mock('drizzle-orm/pglite', () => ({
  drizzle: vi.fn(() => ({
    dialect: {
      migrate: vi.fn().mockResolvedValue(undefined),
    },
    execute: vi.fn().mockResolvedValue([]),
  })),
}));

vi.mock('./pglite', () => ({
  initPgliteWorker: vi.fn().mockResolvedValue({
    close: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('@/database/models/drizzleMigration', () => ({
  DrizzleMigrationModel: vi.fn().mockImplementation(() => ({
    getTableCounts: vi.fn().mockResolvedValue(1),
    getMigrationList: vi.fn().mockResolvedValue([]),
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
    it('should properly track loading states', async () => {
      // Mock successful fetch responses
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('postgres.wasm')) {
          return Promise.resolve({
            headers: { get: () => '1000' },
            body: {
              getReader: () => ({
                read: vi
                  .fn()
                  .mockResolvedValueOnce({ done: false, value: new Uint8Array(500) })
                  .mockResolvedValueOnce({ done: false, value: new Uint8Array(500) })
                  .mockResolvedValueOnce({ done: true }),
              }),
            },
          });
        }
        return Promise.resolve({
          blob: () => Promise.resolve(new Blob()),
        });
      });

      await manager.initialize(callbacks);

      // 验证状态转换包含必要的状态
      expect(stateChanges).toContain(DatabaseLoadingState.Initializing);
      expect(stateChanges).toContain(DatabaseLoadingState.LoadingDependencies);
      expect(stateChanges).toContain(DatabaseLoadingState.Ready);
    }, 10000);

    it('should report dependencies loading progress', async () => {
      // Mock successful responses
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('postgres.wasm')) {
          return Promise.resolve({
            headers: { get: () => '1000' },
            body: {
              getReader: () => ({
                read: vi
                  .fn()
                  .mockResolvedValueOnce({ done: false, value: new Uint8Array(1000) })
                  .mockResolvedValueOnce({ done: true }),
              }),
            },
          });
        }
        return Promise.resolve({
          blob: () => Promise.resolve(new Blob()),
        });
      });

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
    }, 10000);

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
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(manager.initialize(callbacks)).rejects.toThrow('Network error');
      expect(stateChanges).toContain(DatabaseLoadingState.Error);
    }, 5000);

    it('should only initialize once when called multiple times', async () => {
      // Mock successful responses
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('postgres.wasm')) {
          return Promise.resolve({
            headers: { get: () => '1000' },
            body: {
              getReader: () => ({
                read: vi
                  .fn()
                  .mockResolvedValueOnce({ done: false, value: new Uint8Array(1000) })
                  .mockResolvedValueOnce({ done: true }),
              }),
            },
          });
        }
        return Promise.resolve({
          blob: () => Promise.resolve(new Blob()),
        });
      });

      const firstInit = manager.initialize(callbacks);
      const secondInit = manager.initialize(callbacks);

      const [first, second] = await Promise.all([firstInit, secondInit]);

      // 验证返回的是同一个实例
      expect(first).toBe(second);
    }, 10000);
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
      // Mock successful responses
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('postgres.wasm')) {
          return Promise.resolve({
            headers: { get: () => '1000' },
            body: {
              getReader: () => ({
                read: vi
                  .fn()
                  .mockResolvedValueOnce({ done: false, value: new Uint8Array(1000) })
                  .mockResolvedValueOnce({ done: true }),
              }),
            },
          });
        }
        return Promise.resolve({
          blob: () => Promise.resolve(new Blob()),
        });
      });

      // 测试没有提供回调的情况
      await expect(manager.initialize()).resolves.toBeDefined();
    }, 10000);

    it('should handle partial callbacks', async () => {
      // Mock successful responses
      (global.fetch as any).mockImplementation((url: string) => {
        if (url.includes('postgres.wasm')) {
          return Promise.resolve({
            headers: { get: () => '1000' },
            body: {
              getReader: () => ({
                read: vi
                  .fn()
                  .mockResolvedValueOnce({ done: false, value: new Uint8Array(1000) })
                  .mockResolvedValueOnce({ done: true }),
              }),
            },
          });
        }
        return Promise.resolve({
          blob: () => Promise.resolve(new Blob()),
        });
      });

      // 只提供部分回调
      await expect(manager.initialize({ onProgress: callbacks.onProgress })).resolves.toBeDefined();
    }, 10000);
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
