import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ElectronIpcClient } from './ipcClient';

vi.mock('node:fs');
vi.mock('node:net');
vi.mock('node:os');
vi.mock('node:path');

const appId = 'lobehub';
describe('ElectronIpcClient', () => {
  const mockTempDir = '/mock/temp/dir';
  const mockSocketInfoPath = '/mock/temp/dir/lobehub-electron-ipc-info.json';
  const mockSocketInfo = { socketPath: '/mock/socket/path' };

  let mockSocket: any;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();

    mockSocket = {
      on: vi.fn(),
      write: vi.fn((data, callback) => {
        if (callback) callback();
        return true;
      }),
      end: vi.fn(),
      dataCallback: undefined,
    };

    vi.mocked(os.tmpdir).mockReturnValue(mockTempDir);
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
    vi.mocked(net.createConnection).mockImplementation((path, callback) => {
      if (callback) callback();
      return mockSocket;
    });

    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    mockSocket.write.mockImplementation((data: string, callback: any) => {
      if (callback) callback(null);
      return true;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with socket path from info file if it exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockSocketInfo));

      new ElectronIpcClient(appId);

      expect(fs.existsSync).toHaveBeenCalledWith(mockSocketInfoPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(mockSocketInfoPath, 'utf8');
    });

    it('should initialize with default socket path if info file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      new ElectronIpcClient(appId);

      expect(fs.existsSync).toHaveBeenCalledWith(mockSocketInfoPath);
      expect(fs.readFileSync).not.toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', () => {
      vi.mocked(fs.existsSync).mockImplementation(() => {
        throw new Error('Mock file system error');
      });

      new ElectronIpcClient(appId);

      expect(console.error).toHaveBeenCalledWith(
        'Failed to initialize IPC client:',
        expect.objectContaining({ message: 'Mock file system error' }),
      );
    });
  });

  describe('connection and request handling', () => {
    let client: ElectronIpcClient;

    function extractRequestId() {
      if (!mockSocket.write.mock.calls.length) {
        throw new Error('write was not called');
      }
      const call = mockSocket.write.mock.lastCall;
      if (!call) throw new Error('write was not called');
      const match = call[0].match(/"id":"([^"]+)"/);
      if (!match) throw new Error('No id found in request');
      return match[1];
    }

    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockSocketInfo));

      client = new ElectronIpcClient(appId);

      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'data') {
          mockSocket.dataCallback = callback;
        }
        return mockSocket;
      });
    });

    it('should handle error responses', async () => {
      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'data') {
          mockSocket.dataCallback = callback;
        }
        return mockSocket;
      });

      const promise = client.sendRequest('getDatabasePath');
      await Promise.resolve();
      const requestId = extractRequestId();

      mockSocket.dataCallback(
        JSON.stringify({
          id: requestId,
          error: 'test error',
        }) + '\n',
      );

      await expect(promise).rejects.toThrow('test error');
    });

    it('should handle setup phase errors', async () => {
      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'data') {
          mockSocket.dataCallback = callback;
        }
        return mockSocket;
      });
      mockSocket.write.mockImplementationOnce(() => {
        throw new Error('Setup error');
      });

      await expect(client.sendRequest('getDatabasePath')).rejects.toThrow('Setup error');
    });

    it('should handle newline characters in requests properly', async () => {
      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'data') {
          mockSocket.dataCallback = callback;
        }
        return mockSocket;
      });

      const promise = client.sendRequest('getDatabasePath', { path: 'test\npath' });
      await Promise.resolve();
      expect(mockSocket.write.mock.lastCall[0]).toContain('test\\npath');

      const requestId = extractRequestId();

      mockSocket.dataCallback(
        JSON.stringify({
          id: requestId,
          result: 'ok',
        }) + '\n',
      );

      await expect(promise).resolves.toBe('ok');
    });

    it('should handle partial data responses', async () => {
      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'data') {
          mockSocket.dataCallback = callback;
        }
        return mockSocket;
      });

      const promise = client.sendRequest('getDatabasePath');
      await Promise.resolve();
      const requestId = extractRequestId();

      const response = JSON.stringify({ id: requestId, result: 'partial data test' });
      mockSocket.dataCallback(response.slice(0, 10));
      mockSocket.dataCallback(response.slice(10) + '\n');

      await expect(promise).resolves.toBe('partial data test');
    });

    it('should handle write errors during request', async () => {
      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'data') {
          mockSocket.dataCallback = callback;
        }
        return mockSocket;
      });

      mockSocket.write.mockImplementationOnce((data: any, callback: Function) => {
        callback(new Error('Write failed'));
        return true;
      });

      await expect(client.sendRequest('getDatabasePath')).rejects.toThrow('Write failed');
    });
  });

  describe('close method', () => {
    let client: ElectronIpcClient;

    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockSocketInfo));
      client = new ElectronIpcClient(appId);
    });

    it('should close the socket connection', async () => {
      mockSocket.on.mockImplementation((event: string, callback: Function) => {
        if (event === 'data') {
          mockSocket.dataCallback = callback;
        }
        return mockSocket;
      });

      const promise = client.sendRequest('getDatabasePath').catch(() => {});
      client.close();
      expect(mockSocket.end).toHaveBeenCalled();
      await promise;
    });

    it('should handle close when not connected', () => {
      client.close();
      expect(mockSocket.end).not.toHaveBeenCalled();
    });
  });
});
