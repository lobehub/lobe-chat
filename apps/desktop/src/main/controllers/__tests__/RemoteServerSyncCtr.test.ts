import { ProxyTRPCRequestParams } from '@lobechat/electron-client-ipc';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { App } from '@/core/App';

import RemoteServerSyncCtr from '../RemoteServerSyncCtr';

// Mock logger
vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}));

// Mock electron
vi.mock('electron', () => ({
  app: {
    getAppPath: vi.fn(() => '/mock/app/path'),
    getPath: vi.fn(() => '/mock/user/data'),
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
}));

// Mock electron-is
vi.mock('electron-is', () => ({
  dev: vi.fn(() => false),
  linux: vi.fn(() => false),
  macOS: vi.fn(() => false),
  windows: vi.fn(() => false),
}));

// Mock http and https modules
vi.mock('node:http', () => ({
  default: {
    request: vi.fn(),
  },
}));

vi.mock('node:https', () => ({
  default: {
    request: vi.fn(),
  },
}));

// Mock proxy agents
vi.mock('http-proxy-agent', () => ({
  HttpProxyAgent: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('https-proxy-agent', () => ({
  HttpsProxyAgent: vi.fn().mockImplementation(() => ({})),
}));

// Mock RemoteServerConfigCtr
const mockRemoteServerConfigCtr = {
  getRemoteServerConfig: vi.fn(),
  getRemoteServerUrl: vi.fn(),
  getAccessToken: vi.fn(),
  refreshAccessToken: vi.fn(),
};

const mockStoreManager = {
  get: vi.fn().mockReturnValue({
    enableProxy: false,
    proxyServer: '',
    proxyPort: '',
    proxyType: 'http',
  }),
};

const mockApp = {
  getController: vi.fn(() => mockRemoteServerConfigCtr),
  storeManager: mockStoreManager,
} as unknown as App;

describe('RemoteServerSyncCtr', () => {
  let controller: RemoteServerSyncCtr;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new RemoteServerSyncCtr(mockApp);
  });

  describe('proxyTRPCRequest', () => {
    const baseParams: ProxyTRPCRequestParams = {
      urlPath: '/trpc/test.query',
      method: 'GET',
      headers: { 'content-type': 'application/json' },
    };

    it('should return 503 when remote server sync is not active', async () => {
      mockRemoteServerConfigCtr.getRemoteServerConfig.mockResolvedValue({
        active: false,
        storageMode: 'cloud',
      });

      const result = await controller.proxyTRPCRequest(baseParams);

      expect(result.status).toBe(503);
      expect(result.statusText).toBe('Remote server sync not active or configured');
    });

    it('should return 503 when selfHost mode without remoteServerUrl', async () => {
      mockRemoteServerConfigCtr.getRemoteServerConfig.mockResolvedValue({
        active: true,
        storageMode: 'selfHost',
        remoteServerUrl: '',
      });

      const result = await controller.proxyTRPCRequest(baseParams);

      expect(result.status).toBe(503);
      expect(result.statusText).toBe('Remote server sync not active or configured');
    });

    it('should return 401 when no access token is available', async () => {
      mockRemoteServerConfigCtr.getRemoteServerConfig.mockResolvedValue({
        active: true,
        storageMode: 'cloud',
      });
      mockRemoteServerConfigCtr.getRemoteServerUrl.mockResolvedValue('https://api.example.com');
      mockRemoteServerConfigCtr.getAccessToken.mockResolvedValue(null);

      // Mock https.request to simulate the forwardRequest behavior
      const https = await import('node:https');
      const mockRequest = vi.fn().mockImplementation((options, callback) => {
        // Simulate response
        const mockResponse = {
          statusCode: 401,
          statusMessage: 'Authentication required, missing token',
          headers: {},
          on: vi.fn((event, handler) => {
            if (event === 'data') {
              handler(Buffer.from(''));
            }
            if (event === 'end') {
              handler();
            }
          }),
        };
        callback(mockResponse);
        return {
          on: vi.fn(),
          write: vi.fn(),
          end: vi.fn(),
        };
      });
      vi.mocked(https.default.request).mockImplementation(mockRequest);

      const result = await controller.proxyTRPCRequest(baseParams);

      expect(result.status).toBe(401);
    });

    it('should forward request successfully when configured properly', async () => {
      mockRemoteServerConfigCtr.getRemoteServerConfig.mockResolvedValue({
        active: true,
        storageMode: 'cloud',
      });
      mockRemoteServerConfigCtr.getRemoteServerUrl.mockResolvedValue('https://api.example.com');
      mockRemoteServerConfigCtr.getAccessToken.mockResolvedValue('valid-token');

      const https = await import('node:https');
      const mockRequest = vi.fn().mockImplementation((options, callback) => {
        const mockResponse = {
          statusCode: 200,
          statusMessage: 'OK',
          headers: { 'content-type': 'application/json' },
          on: vi.fn((event, handler) => {
            if (event === 'data') {
              handler(Buffer.from('{"success":true}'));
            }
            if (event === 'end') {
              handler();
            }
          }),
        };
        callback(mockResponse);
        return {
          on: vi.fn(),
          write: vi.fn(),
          end: vi.fn(),
        };
      });
      vi.mocked(https.default.request).mockImplementation(mockRequest);

      const result = await controller.proxyTRPCRequest(baseParams);

      expect(result.status).toBe(200);
      expect(result.statusText).toBe('OK');
    });

    it('should retry request after token refresh on 401', async () => {
      mockRemoteServerConfigCtr.getRemoteServerConfig.mockResolvedValue({
        active: true,
        storageMode: 'cloud',
      });
      mockRemoteServerConfigCtr.getRemoteServerUrl.mockResolvedValue('https://api.example.com');
      mockRemoteServerConfigCtr.getAccessToken
        .mockResolvedValueOnce('expired-token')
        .mockResolvedValueOnce('new-valid-token');
      mockRemoteServerConfigCtr.refreshAccessToken.mockResolvedValue({ success: true });

      const https = await import('node:https');
      let callCount = 0;
      const mockRequest = vi.fn().mockImplementation((options, callback) => {
        callCount++;
        const mockResponse = {
          statusCode: callCount === 1 ? 401 : 200,
          statusMessage: callCount === 1 ? 'Unauthorized' : 'OK',
          headers: { 'content-type': 'application/json' },
          on: vi.fn((event, handler) => {
            if (event === 'data') {
              handler(Buffer.from(callCount === 1 ? '' : '{"success":true}'));
            }
            if (event === 'end') {
              handler();
            }
          }),
        };
        callback(mockResponse);
        return {
          on: vi.fn(),
          write: vi.fn(),
          end: vi.fn(),
        };
      });
      vi.mocked(https.default.request).mockImplementation(mockRequest);

      const result = await controller.proxyTRPCRequest(baseParams);

      expect(mockRemoteServerConfigCtr.refreshAccessToken).toHaveBeenCalled();
      expect(result.status).toBe(200);
    });

    it('should keep 401 response when token refresh fails', async () => {
      mockRemoteServerConfigCtr.getRemoteServerConfig.mockResolvedValue({
        active: true,
        storageMode: 'cloud',
      });
      mockRemoteServerConfigCtr.getRemoteServerUrl.mockResolvedValue('https://api.example.com');
      mockRemoteServerConfigCtr.getAccessToken.mockResolvedValue('expired-token');
      mockRemoteServerConfigCtr.refreshAccessToken.mockResolvedValue({
        success: false,
        error: 'Refresh failed',
      });

      const https = await import('node:https');
      const mockRequest = vi.fn().mockImplementation((options, callback) => {
        const mockResponse = {
          statusCode: 401,
          statusMessage: 'Unauthorized',
          headers: {},
          on: vi.fn((event, handler) => {
            if (event === 'data') {
              handler(Buffer.from(''));
            }
            if (event === 'end') {
              handler();
            }
          }),
        };
        callback(mockResponse);
        return {
          on: vi.fn(),
          write: vi.fn(),
          end: vi.fn(),
        };
      });
      vi.mocked(https.default.request).mockImplementation(mockRequest);

      const result = await controller.proxyTRPCRequest(baseParams);

      expect(mockRemoteServerConfigCtr.refreshAccessToken).toHaveBeenCalled();
      expect(result.status).toBe(401);
    });

    it('should handle request error gracefully', async () => {
      mockRemoteServerConfigCtr.getRemoteServerConfig.mockResolvedValue({
        active: true,
        storageMode: 'cloud',
      });
      mockRemoteServerConfigCtr.getRemoteServerUrl.mockResolvedValue('https://api.example.com');
      mockRemoteServerConfigCtr.getAccessToken.mockResolvedValue('valid-token');

      const https = await import('node:https');
      const mockRequest = vi.fn().mockImplementation((options, callback) => {
        return {
          on: vi.fn((event, handler) => {
            if (event === 'error') {
              handler(new Error('Network error'));
            }
          }),
          write: vi.fn(),
          end: vi.fn(),
        };
      });
      vi.mocked(https.default.request).mockImplementation(mockRequest);

      const result = await controller.proxyTRPCRequest(baseParams);

      expect(result.status).toBe(502);
      expect(result.statusText).toBe('Error forwarding request');
    });

    it('should include request body when provided', async () => {
      mockRemoteServerConfigCtr.getRemoteServerConfig.mockResolvedValue({
        active: true,
        storageMode: 'cloud',
      });
      mockRemoteServerConfigCtr.getRemoteServerUrl.mockResolvedValue('https://api.example.com');
      mockRemoteServerConfigCtr.getAccessToken.mockResolvedValue('valid-token');

      const https = await import('node:https');
      const mockWrite = vi.fn();
      const mockRequest = vi.fn().mockImplementation((options, callback) => {
        const mockResponse = {
          statusCode: 200,
          statusMessage: 'OK',
          headers: {},
          on: vi.fn((event, handler) => {
            if (event === 'data') {
              handler(Buffer.from('{"success":true}'));
            }
            if (event === 'end') {
              handler();
            }
          }),
        };
        callback(mockResponse);
        return {
          on: vi.fn(),
          write: mockWrite,
          end: vi.fn(),
        };
      });
      vi.mocked(https.default.request).mockImplementation(mockRequest);

      const paramsWithBody: ProxyTRPCRequestParams = {
        ...baseParams,
        method: 'POST',
        body: '{"data":"test"}',
      };

      await controller.proxyTRPCRequest(paramsWithBody);

      expect(mockWrite).toHaveBeenCalledWith('{"data":"test"}', 'utf8');
    });
  });

  describe('afterAppReady', () => {
    it('should register stream:start IPC handler', async () => {
      const { ipcMain } = await import('electron');

      controller.afterAppReady();

      expect(ipcMain.on).toHaveBeenCalledWith('stream:start', expect.any(Function));
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      // destroy method doesn't throw
      expect(() => controller.destroy()).not.toThrow();
    });
  });
});
