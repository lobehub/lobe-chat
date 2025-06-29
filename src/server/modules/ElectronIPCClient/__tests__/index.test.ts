import { beforeEach, describe, expect, it, vi } from 'vitest';

import { electronIpcClient } from '../index';

vi.mock('@lobechat/electron-server-ipc', () => ({
  ElectronIpcClient: class {
    sendRequest = vi.fn();
  },
}));

describe('LobeHubElectronIpcClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call getDatabasePath correctly', async () => {
    const mockSendRequest = vi.mocked(electronIpcClient['sendRequest']);
    mockSendRequest.mockResolvedValueOnce('/path/to/db');

    const result = await electronIpcClient.getDatabasePath();

    expect(result).toBe('/path/to/db');
    expect(mockSendRequest).toHaveBeenCalledWith('getDatabasePath');
  });

  it('should call getUserDataPath correctly', async () => {
    const mockSendRequest = vi.mocked(electronIpcClient['sendRequest']);
    mockSendRequest.mockResolvedValueOnce('/user/data/path');

    const result = await electronIpcClient.getUserDataPath();

    expect(result).toBe('/user/data/path');
    expect(mockSendRequest).toHaveBeenCalledWith('getUserDataPath');
  });

  it('should call getDatabaseSchemaHash correctly', async () => {
    const mockSendRequest = vi.mocked(electronIpcClient['sendRequest']);
    mockSendRequest.mockResolvedValueOnce('hash123');

    const result = await electronIpcClient.getDatabaseSchemaHash();

    expect(result).toBe('hash123');
    expect(mockSendRequest).toHaveBeenCalledWith('setDatabaseSchemaHash');
  });

  describe('setDatabaseSchemaHash', () => {
    it('should call setDatabaseSchemaHash with hash', async () => {
      const mockSendRequest = vi.mocked(electronIpcClient['sendRequest']);

      await electronIpcClient.setDatabaseSchemaHash('hash123');

      expect(mockSendRequest).toHaveBeenCalledWith('setDatabaseSchemaHash', {
        hash: 'hash123',
      });
    });

    it('should not call sendRequest if hash is undefined', async () => {
      const mockSendRequest = vi.mocked(electronIpcClient['sendRequest']);

      await electronIpcClient.setDatabaseSchemaHash(undefined);

      expect(mockSendRequest).not.toHaveBeenCalled();
    });
  });

  it('should call getFilePathById correctly', async () => {
    const mockSendRequest = vi.mocked(electronIpcClient['sendRequest']);
    mockSendRequest.mockResolvedValueOnce('/path/to/file');

    const result = await electronIpcClient.getFilePathById('file123');

    expect(result).toBe('/path/to/file');
    expect(mockSendRequest).toHaveBeenCalledWith('getStaticFilePath', {
      id: 'file123',
    });
  });

  it('should call deleteFiles correctly', async () => {
    const mockSendRequest = vi.mocked(electronIpcClient['sendRequest']);
    const mockResponse = { success: true };
    mockSendRequest.mockResolvedValueOnce(mockResponse);

    const paths = ['/path1', '/path2'];
    const result = await electronIpcClient.deleteFiles(paths);

    expect(result).toEqual(mockResponse);
    expect(mockSendRequest).toHaveBeenCalledWith('deleteFiles', paths);
  });
});
