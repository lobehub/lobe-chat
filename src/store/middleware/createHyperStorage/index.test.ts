import { afterEach, describe, expect, it, vi } from 'vitest';

import { createHyperStorage } from './index';
import { createIndexedDB } from './indexedDB';
import { createKeyMapper } from './keyMapper';
import { createLocalStorage } from './localStorage';
import { creatUrlStorage } from './urlStorage';

// Mock the dependent modules
vi.mock('./indexedDB', () => {
  return {
    createIndexedDB: vi.fn(),
  };
});

vi.mock('./localStorage', () => ({
  createLocalStorage: vi.fn(),
}));

vi.mock('./urlStorage', () => ({
  creatUrlStorage: vi.fn(),
}));

vi.mock('./keyMapper', () => ({
  createKeyMapper: vi.fn().mockReturnValue({
    mapStateKeyToStorageKey: vi.fn((k) => k),
    getStateKeyFromStorageKey: vi.fn((k) => k),
  }),
}));

afterEach(() => {
  vi.mocked(createKeyMapper).mockClear();
});

describe('createHyperStorage', () => {
  it('should create storage with default configuration if no options provided', async () => {
    const storage = createHyperStorage({});
    expect(storage).toBeDefined();
    // Add more assertions to verify default behavior
  });

  it('should skip local storage if explicitly disabled', async () => {
    const storage = createHyperStorage({ localStorage: false });
    await storage.setItem('key', { state: {}, version: 1 });

    // The setItem should not call the local storage functions
    const indexDBSetItemMock = vi.fn();

    vi.mocked(createIndexedDB).mockImplementation(() => ({
      getItem: vi.fn(),
      removeItem: vi.fn(),
      setItem: indexDBSetItemMock,
    }));

    const localStorageSetItemMock = vi.fn();

    vi.mocked(createLocalStorage).mockImplementation(() => ({
      getItem: vi.fn(),
      removeItem: vi.fn(),
      setItem: localStorageSetItemMock,
    }));

    expect(indexDBSetItemMock).not.toHaveBeenCalled();
    expect(localStorageSetItemMock).not.toHaveBeenCalled();
  });

  it('should use indexedDB mode if set in local storage options', async () => {
    // The setItem should call the indexedDB functions
    // The setItem should not call the local storage functions
    const indexDBSetItemMock = vi.fn();

    vi.mocked(createIndexedDB).mockImplementation(() => ({
      getItem: vi.fn(),
      removeItem: vi.fn(),
      setItem: indexDBSetItemMock,
    }));

    const storage = createHyperStorage({
      localStorage: { mode: 'indexedDB', dbName: 'testDB', selectors: [] },
    });

    await storage.setItem('key', { state: {}, version: 1 });

    expect(indexDBSetItemMock).toHaveBeenCalled();
  });

  it('should use the provided dbName for indexedDB', async () => {
    const dbName = 'customDB';
    createHyperStorage({ localStorage: { mode: 'indexedDB', dbName, selectors: [] } });

    expect(vi.mocked(createIndexedDB)).toHaveBeenCalledWith(dbName);
  });

  it('should handle URL storage if URL options are provided', async () => {
    const urlMode = 'hash';
    const setItemMock = vi.fn();

    vi.mocked(creatUrlStorage).mockImplementation(() => ({
      getItem: vi.fn(),
      removeItem: vi.fn(),
      setItem: setItemMock,
    }));

    const storage = createHyperStorage({ url: { mode: urlMode, selectors: [] } });

    await storage.setItem('key', { state: {}, version: 1 });

    expect(creatUrlStorage).toHaveBeenCalledWith(urlMode);
    // The setItem should call the urlStorage functions
    expect(setItemMock).toHaveBeenCalled();
  });

  describe('getItem method', () => {
    it('should retrieve item from indexedDB when useIndexedDB is true', async () => {
      const indexedDBGetItemMock = vi
        .fn()
        .mockResolvedValue({ state: { key: 'value' }, version: 1 });
      vi.mocked(createIndexedDB).mockImplementation(() => ({
        getItem: indexedDBGetItemMock,
        removeItem: vi.fn(),
        setItem: vi.fn(),
      }));

      const storage = createHyperStorage({ localStorage: { mode: 'indexedDB', selectors: [] } });
      const item = await storage.getItem('key');

      expect(indexedDBGetItemMock).toHaveBeenCalledWith('key');
      expect(item).toEqual({ state: { key: 'value' }, version: 1 });
    });

    it('should fallback to localStorage if item not found in indexedDB', async () => {
      const indexedDBGetItemMock = vi.fn().mockResolvedValue(undefined);
      const localStorageGetItemMock = vi
        .fn()
        .mockReturnValue({ state: { key: 'value' }, version: 1 });

      vi.mocked(createIndexedDB).mockImplementation(() => ({
        getItem: indexedDBGetItemMock,
        removeItem: vi.fn(),
        setItem: vi.fn(),
      }));

      vi.mocked(createLocalStorage).mockImplementation(() => ({
        getItem: localStorageGetItemMock,
        removeItem: vi.fn(),
        setItem: vi.fn(),
      }));

      const storage = createHyperStorage({ localStorage: { mode: 'indexedDB', selectors: [] } });
      const item = await storage.getItem('key');

      expect(indexedDBGetItemMock).toHaveBeenCalledWith('key');
      expect(localStorageGetItemMock).toHaveBeenCalledWith('key');
      expect(item).toEqual({ state: { key: 'value' }, version: 1 });
    });

    it('should not attempt to retrieve from any storage if skipLocalStorage is true', async () => {
      const storage = createHyperStorage({ localStorage: false });
      const item = await storage.getItem('key');

      const indexedDBGetItemMock = vi.fn().mockResolvedValue(undefined);
      const localStorageGetItemMock = vi
        .fn()
        .mockReturnValue({ state: { key: 'value' }, version: 1 });

      vi.mocked(createIndexedDB).mockImplementation(() => ({
        getItem: indexedDBGetItemMock,
        removeItem: vi.fn(),
        setItem: vi.fn(),
      }));

      vi.mocked(createLocalStorage).mockImplementation(() => ({
        getItem: localStorageGetItemMock,
        removeItem: vi.fn(),
        setItem: vi.fn(),
      }));

      expect(indexedDBGetItemMock).not.toHaveBeenCalled();
      expect(localStorageGetItemMock).not.toHaveBeenCalled();
      expect(item).toEqual({ state: {}, version: undefined });
    });

    describe('getItem method with URL storage', () => {
      it('should override state from URL storage if hasUrl is true', async () => {
        const urlStorageGetItemMock = vi.fn().mockReturnValue({ state: { urlKey: 'urlValue' } });
        vi.mocked(creatUrlStorage).mockImplementation(() => ({
          getItem: urlStorageGetItemMock,
          removeItem: vi.fn(),
          setItem: vi.fn(),
        }));

        // Mock createKeyMapper to simulate state key mapping from URL storage keys
        vi.mocked(createKeyMapper).mockReturnValue({
          mapStateKeyToStorageKey: vi.fn((k) => k),
          getStateKeyFromStorageKey: vi.fn((k) => (k === 'urlKey' ? 'mappedKey' : undefined)),
        });

        const storage = createHyperStorage({
          url: { mode: 'hash', selectors: [] },
          localStorage: false,
        });
        const item = await storage.getItem('key');

        expect(urlStorageGetItemMock).toHaveBeenCalled();
        expect(item?.state).toEqual({ mappedKey: 'urlValue' });
      });

      it('should not include URL storage state if key mapping is undefined', async () => {
        const urlStorageGetItemMock = vi.fn().mockReturnValue({ state: { urlKey: 'urlValue' } });
        vi.mocked(creatUrlStorage).mockImplementation(() => ({
          getItem: urlStorageGetItemMock,
          removeItem: vi.fn(),
          setItem: vi.fn(),
        }));

        // Mock createKeyMapper to simulate state key mapping from URL storage keys
        vi.mocked(createKeyMapper).mockReturnValue({
          mapStateKeyToStorageKey: vi.fn((k) => k),
          getStateKeyFromStorageKey: vi.fn(() => undefined), // No key will be mapped
        });

        const storage = createHyperStorage({
          url: { mode: 'hash', selectors: [] },
          localStorage: false,
        });
        const item = await storage.getItem('key');

        expect(urlStorageGetItemMock).toHaveBeenCalled();
        expect(item?.state).toEqual({}); // No state from URL storage should be included
      });

      it('should not attempt to retrieve from URL storage if hasUrl is false', async () => {
        const urlStorageGetItemMock = vi.fn();
        vi.mocked(creatUrlStorage).mockImplementation(() => ({
          getItem: urlStorageGetItemMock,
          removeItem: vi.fn(),
          setItem: vi.fn(),
        }));

        const storage = createHyperStorage({ localStorage: false }); // No URL options provided
        await storage.getItem('key');

        expect(urlStorageGetItemMock).not.toHaveBeenCalled();
      });
    });
  });

  describe('removeItem method', () => {
    it('should remove item from indexedDB when useIndexedDB is true', async () => {
      const indexedDBRemoveItemMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(createIndexedDB).mockImplementation(() => ({
        getItem: vi.fn(),
        removeItem: indexedDBRemoveItemMock,
        setItem: vi.fn(),
      }));

      const storage = createHyperStorage({ localStorage: { mode: 'indexedDB', selectors: [] } });
      await storage.removeItem('key');

      expect(indexedDBRemoveItemMock).toHaveBeenCalledWith('key');
    });

    it('should remove item from localStorage when useIndexedDB is false', async () => {
      const localStorageRemoveItemMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(createLocalStorage).mockImplementation(() => ({
        getItem: vi.fn(),
        removeItem: localStorageRemoveItemMock,
        setItem: vi.fn(),
      }));

      const storage = createHyperStorage({});
      await storage.removeItem('key');

      expect(localStorageRemoveItemMock).toHaveBeenCalledWith('key');
    });

    it('should remove item from URL storage if URL options provided', async () => {
      const urlStorageRemoveItemMock = vi.fn();

      vi.mocked(creatUrlStorage).mockImplementation(() => ({
        getItem: vi.fn(),
        removeItem: urlStorageRemoveItemMock,
        setItem: vi.fn(),
      }));
      // Mock createKeyMapper to simulate state key mapping from URL storage keys
      vi.mocked(createKeyMapper).mockReturnValue({
        mapStateKeyToStorageKey: vi.fn((k) => k),
        getStateKeyFromStorageKey: vi.fn((k) => k), // No key will be mapped
      });

      const storage = createHyperStorage({ url: { mode: 'hash', selectors: ['key'] } });
      await storage.removeItem('key');

      expect(urlStorageRemoveItemMock).toHaveBeenCalledWith('key');
    });
  });

  describe('setItem method', () => {
    it('should save item to indexedDB when useIndexedDB is true', async () => {
      const indexedDBSetItemMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(createIndexedDB).mockImplementation(() => ({
        getItem: vi.fn(),
        removeItem: vi.fn(),
        setItem: indexedDBSetItemMock,
      }));

      const storage = createHyperStorage({ localStorage: { mode: 'indexedDB', selectors: [] } });
      await storage.setItem('key', { state: { key: 'value' }, version: 1 });

      expect(indexedDBSetItemMock).toHaveBeenCalledWith('key', { key: 'value' }, 1);
    });

    it('should save item to localStorage when useIndexedDB is false', async () => {
      const localStorageSetItemMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(createLocalStorage).mockImplementation(() => ({
        getItem: vi.fn(),
        removeItem: vi.fn(),
        setItem: localStorageSetItemMock,
      }));

      const storage = createHyperStorage({});
      await storage.setItem('key', { state: { key: 'value' }, version: 1 });

      expect(localStorageSetItemMock).toHaveBeenCalledWith('key', { key: 'value' }, 1);
    });

    it('should save state to URL storage if URL options provided', async () => {
      const urlStorageSetItemMock = vi.fn().mockResolvedValue(undefined);
      vi.mocked(creatUrlStorage).mockImplementation(() => ({
        getItem: vi.fn(),
        removeItem: vi.fn(),
        setItem: urlStorageSetItemMock,
      }));

      const storage = createHyperStorage({ url: { mode: 'hash', selectors: [] } });
      await storage.setItem('key', { state: { key: 'value' }, version: 1 });

      expect(urlStorageSetItemMock).toHaveBeenCalled();
    });
  });
});
