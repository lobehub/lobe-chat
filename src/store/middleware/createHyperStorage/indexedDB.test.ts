import { delMany, getMany, setMany } from 'idb-keyval';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createIndexedDB } from './indexedDB';

// Mock idb-keyval methods
vi.mock('idb-keyval', () => ({
  createStore: vi.fn().mockImplementation(() => 'abc'),
  getMany: vi.fn(),
  setMany: vi.fn(),
  delMany: vi.fn(),
}));

describe('createIndexedDB', () => {
  const dbName = 'testDB';
  const storeName = 'testStore';
  const indexedDB = createIndexedDB(dbName);

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();
  });

  it('getItem should return the correct state and version', async () => {
    const mockState = { key: 'value' };
    const mockVersion = 1;

    // Setup mock behavior for getMany
    vi.mocked(getMany).mockResolvedValue([mockVersion, mockState]);

    const result = await indexedDB.getItem(storeName);

    expect(vi.mocked(getMany).mock.calls[0][0]).toEqual(['version', 'state']);
    expect(result).toEqual({ state: mockState, version: mockVersion });
  });

  it('getItem should return undefined if state does not exist', async () => {
    // Setup mock behavior for getMany
    vi.mocked(getMany).mockResolvedValue([undefined, undefined]);

    const result = await indexedDB.getItem(storeName);

    expect(vi.mocked(getMany).mock.calls[0][0]).toEqual(['version', 'state']);
    expect(result).toBeUndefined();
  });

  it('removeItem should call delMany with the correct keys', async () => {
    await indexedDB.removeItem(storeName);

    expect(vi.mocked(delMany).mock.calls[0][0]).toEqual(['version', 'state']);
  });

  it('setItem should call setMany with the correct keys and values', async () => {
    const mockState = { key: 'value' };
    const mockVersion = 1;

    await indexedDB.setItem(storeName, mockState, mockVersion);

    expect(vi.mocked(setMany).mock.calls[0][0]).toEqual([
      ['version', mockVersion],
      ['state', mockState],
    ]);
  });
});
