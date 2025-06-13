import { createStore, del, get, set } from 'idb-keyval';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BrowserS3Storage } from './index';

// Mock idb-keyval
vi.mock('idb-keyval', () => ({
  createStore: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
}));

let storage: BrowserS3Storage;
let mockStore = {};

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();
  mockStore = {};
  (createStore as any).mockReturnValue(mockStore);
  storage = new BrowserS3Storage();
});

describe('BrowserS3Storage', () => {
  describe('constructor', () => {
    it('should create store when in browser environment', () => {
      expect(createStore).toHaveBeenCalledWith('lobechat-local-s3', 'objects');
    });
  });

  describe('putObject', () => {
    it('should successfully put a file object', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockArrayBuffer = new ArrayBuffer(8);
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(mockArrayBuffer);
      (set as any).mockResolvedValue(undefined);

      await storage.putObject('1-test-key', mockFile);

      expect(set).toHaveBeenCalledWith(
        '1-test-key',
        {
          data: mockArrayBuffer,
          name: 'test.txt',
          type: 'text/plain',
        },
        mockStore,
      );
    });

    it('should throw error when put operation fails', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockError = new Error('Storage error');
      (set as any).mockRejectedValue(mockError);

      await expect(storage.putObject('test-key', mockFile)).rejects.toThrow(
        'Failed to put file test.txt: Storage error',
      );
    });
  });

  describe('getObject', () => {
    it('should successfully get a file object', async () => {
      const mockData = {
        data: new ArrayBuffer(8),
        name: 'test.txt',
        type: 'text/plain',
      };
      (get as any).mockResolvedValue(mockData);

      const result = await storage.getObject('test-key');

      expect(result).toBeInstanceOf(File);
      expect(result?.name).toBe('test.txt');
      expect(result?.type).toBe('text/plain');
    });

    it('should return undefined when file not found', async () => {
      (get as any).mockResolvedValue(undefined);

      const result = await storage.getObject('test-key');

      expect(result).toBeUndefined();
    });

    // it('should throw error when get operation fails', async () => {
    //   const mockError = new Error('Storage error');
    //   (get as any).mockRejectedValue(mockError);
    //
    //   await expect(storage.getObject('test-key')).rejects.toThrow(
    //     'Failed to get object (key=test-key): Storage error',
    //   );
    // });
  });

  describe('deleteObject', () => {
    it('should successfully delete a file object', async () => {
      (del as any).mockResolvedValue(undefined);

      await storage.deleteObject('test-key2');

      expect(del).toHaveBeenCalledWith('test-key2', {});
    });

    it('should throw error when delete operation fails', async () => {
      const mockError = new Error('Storage error');
      (del as any).mockRejectedValue(mockError);

      await expect(storage.deleteObject('test-key')).rejects.toThrow(
        'Failed to delete object (key=test-key): Storage error',
      );
    });
  });
});
