import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ClientDBLoadingProgress, DatabaseLoadingState } from '@/types/clientDB';

import { DatabaseManager } from './db';

// Mock external dependencies
vi.mock('@electric-sql/pglite', () => ({
  IdbFs: vi.fn(),
  MemoryFS: vi.fn(),
  PGlite: vi.fn(() => ({
    dialect: {
      migrate: vi.fn(),
    },
    rows: [],
  })),
  drizzle: vi.fn(),
}));

vi.mock('@electric-sql/pglite/vector', () => ({
  vector: vi.fn(),
}));

vi.mock('drizzle-orm/pglite', () => ({
  drizzle: vi.fn(() => ({
    dialect: {
      migrate: vi.fn(),
    },
    execute: vi.fn(),
    session: {
      client: {
        close: vi.fn(),
      },
    },
  })),
}));

// Mock WebAssembly.compile to avoid empty buffer errors
globalThis.WebAssembly = {
  ...globalThis.WebAssembly,
  compile: vi.fn().mockResolvedValue({}),
} as any;

let manager: DatabaseManager;
let progressEvents: ClientDBLoadingProgress[] = [];
let stateChanges: DatabaseLoadingState[] = [];

const mockFsBundle = new Blob(['mock fs bundle']);

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

  // Mock fetch
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      blob: () => Promise.resolve(mockFsBundle),
      body: {
        getReader: () =>
          ({
            read: () =>
              Promise.resolve({
                done: true,
                value: new Uint8Array([1, 2, 3]), // non-empty buffer for wasm
              }),
          }) as any,
      },
      headers: new Headers({
        'Content-Length': '1000',
      }),
    } as Response),
  );

  callbacks = {
    onProgress: vi.fn((progress: ClientDBLoadingProgress) => {
      progressEvents.push(progress);
    }),
    onStateChange: vi.fn((state: DatabaseLoadingState) => {
      stateChanges.push(state);
    }),
  };

  // @ts-expect-error Reset singleton instance
  DatabaseManager['instance'] = undefined;
  manager = DatabaseManager.getInstance();

  // Reset localStorage and indexedDB
  // @ts-expect-error
  global.localStorage = undefined;
  // @ts-expect-error
  global.indexedDB = undefined;
});

describe('DatabaseManager', () => {
  describe('Callback Handling', () => {
    it('should properly track loading states', async () => {
      await manager.initialize(callbacks);

      expect(stateChanges).toEqual([
        DatabaseLoadingState.Initializing,
        DatabaseLoadingState.LoadingDependencies,
        DatabaseLoadingState.LoadingWasm,
        DatabaseLoadingState.Migrating,
        DatabaseLoadingState.Finished,
        DatabaseLoadingState.Ready,
      ]);
    });

    it('should report dependencies loading progress', async () => {
      await manager.initialize(callbacks);

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

      const wasmProgress = progressEvents.filter((e) => e.phase === 'wasm');
      expect(wasmProgress[wasmProgress.length - 1]).toEqual(
        expect.objectContaining({
          phase: 'wasm',
          progress: 100,
          costTime: expect.any(Number),
        }),
      );
    });

    it('should handle initialization errors', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

      await expect(manager.initialize(callbacks)).rejects.toThrow();
      expect(stateChanges).toContain(DatabaseLoadingState.Error);
    });

    it('should only initialize once when called multiple times', async () => {
      const firstInit = manager.initialize(callbacks);
      const secondInit = manager.initialize(callbacks);

      await Promise.all([firstInit, secondInit]);

      const readyStateCount = stateChanges.filter(
        (state) => state === DatabaseLoadingState.Ready,
      ).length;
      expect(readyStateCount).toBe(1);
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

  describe('resetDatabase', () => {
    beforeEach(async () => {
      // Mock indexedDB.deleteDatabase
      global.indexedDB = {
        deleteDatabase: vi.fn().mockImplementation((name: string) => ({
          onblocked: null,
          onerror: null,
          onsuccess: null,
        })),
      } as any;

      await manager.initialize();
    });

    it('should properly close PGlite connection before reset', async () => {
      const mockClose = vi.fn().mockResolvedValue(undefined);
      // @ts-expect-error
      manager.dbInstance = {
        session: {
          client: { close: mockClose },
        },
      } as any;

      // Patch indexedDB.deleteDatabase to immediately call onsuccess
      (global.indexedDB.deleteDatabase as any).mockImplementation((name: string) => {
        const req: any = {
          onblocked: null,
          onerror: null,
          onsuccess: null,
        };
        setTimeout(() => req.onsuccess && req.onsuccess(), 0);
        return req;
      });

      await manager.resetDatabase();

      expect(mockClose).toHaveBeenCalled();
      expect(global.indexedDB.deleteDatabase).toHaveBeenCalledWith('/pglite/lobechat');
    });

    it('should reset database instance and state', async () => {
      const mockClose = vi.fn().mockResolvedValue(undefined);
      // @ts-expect-error
      manager.dbInstance = {
        session: {
          client: { close: mockClose },
        },
      } as any;

      (global.indexedDB.deleteDatabase as any).mockImplementation((name: string) => {
        const req: any = {
          onblocked: null,
          onerror: null,
          onsuccess: null,
        };
        setTimeout(() => req.onsuccess && req.onsuccess(), 0);
        return req;
      });

      await manager.resetDatabase();

      // @ts-expect-error Check internal state
      expect(manager.dbInstance).toBeNull();
      // @ts-expect-error Check internal state
      expect(manager.initPromise).toBeNull();
      // @ts-expect-error Check internal state
      expect(manager.isLocalDBSchemaSynced).toBe(false);
    });

    it('should handle connection close errors gracefully', async () => {
      const mockClose = vi.fn().mockRejectedValue(new Error('Close failed'));
      // @ts-expect-error
      manager.dbInstance = {
        session: {
          client: { close: mockClose },
        },
      } as any;

      (global.indexedDB.deleteDatabase as any).mockImplementation((name: string) => {
        const req: any = {
          onblocked: null,
          onerror: null,
          onsuccess: null,
        };
        setTimeout(() => req.onsuccess && req.onsuccess(), 0);
        return req;
      });

      await expect(manager.resetDatabase()).resolves.not.toThrow();
      expect(mockClose).toHaveBeenCalled();
    });

    it('should handle blocked database deletion', async () => {
      (global.indexedDB.deleteDatabase as any).mockImplementation((name: string) => {
        const request: any = {
          onblocked: null,
          onerror: null,
          onsuccess: null,
        };
        setTimeout(() => {
          if (request.onblocked) {
            request.onblocked({});
          }
        }, 0);
        return request;
      });

      await expect(manager.resetDatabase()).rejects.toThrow(/blocked by other open connections/);
    });

    it('should handle database deletion errors', async () => {
      (global.indexedDB.deleteDatabase as any).mockImplementation((name: string) => {
        const request: any = {
          onblocked: null,
          onerror: null,
          onsuccess: null,
        };
        setTimeout(() => {
          if (request.onerror) {
            // Simulate an error event with a target that has an error property
            request.onerror({ target: { error: { message: 'IDB error' } } });
          }
        }, 0);
        return request;
      });

      await expect(manager.resetDatabase()).rejects.toThrow(/Failed to reset database/);
    });

    it('should clear local storage schema hash', async () => {
      const mockLocalStorage = {
        removeItem: vi.fn(),
      };
      // @ts-expect-error
      global.localStorage = mockLocalStorage;
      const mockClose = vi.fn().mockResolvedValue(undefined);
      // @ts-expect-error
      manager.dbInstance = {
        session: {
          client: { close: mockClose },
        },
      } as any;

      (global.indexedDB.deleteDatabase as any).mockImplementation((name: string) => {
        const req: any = {
          onblocked: null,
          onerror: null,
          onsuccess: null,
        };
        setTimeout(() => req.onsuccess && req.onsuccess(), 0);
        return req;
      });

      await manager.resetDatabase();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('LOBE_CHAT_PGLITE_SCHEMA_HASH');
    });

    it('should resolve if indexedDB is not available', async () => {
      // @ts-expect-error
      global.indexedDB = undefined;
      // Should not throw, should resolve
      await expect(manager.resetDatabase()).resolves.not.toThrow();
    });
  });
});
