import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RendererProtocolManager } from '../RendererProtocolManager';

const {
  mockApp,
  mockPathExistsSync,
  mockProtocol,
  mockReadFile,
  protocolHandlerRef,
} = vi.hoisted(() => {
  const protocolHandlerRef = { current: null as any };

  return {
    mockApp: {
      isReady: vi.fn().mockReturnValue(true),
      whenReady: vi.fn().mockResolvedValue(undefined),
    },
    mockPathExistsSync: vi.fn().mockReturnValue(true),
    mockProtocol: {
      handle: vi.fn((_scheme: string, handler: any) => {
        protocolHandlerRef.current = handler;
      }),
    },
    mockReadFile: vi.fn(),
    protocolHandlerRef,
  };
});

vi.mock('electron', () => ({
  app: mockApp,
  protocol: mockProtocol,
}));

vi.mock('fs-extra', () => ({
  pathExistsSync: mockPathExistsSync,
}));

vi.mock('node:fs/promises', () => ({
  readFile: mockReadFile,
}));

vi.mock('@/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe('RendererProtocolManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    protocolHandlerRef.current = null;
    mockApp.isReady.mockReturnValue(true);
    mockPathExistsSync.mockReturnValue(true);
  });

  afterEach(() => {
    protocolHandlerRef.current = null;
  });

  it('should fall back to entry HTML when resolve returns 404.html for non-asset routes', async () => {
    const resolveRendererFilePath = vi.fn(async (url: URL) => {
      if (url.pathname === '/missing') return '/export/404.html';
      if (url.pathname === '/') return '/export/index.html';
      return null;
    });
    const getExportMimeType = vi.fn(() => 'text/html; charset=utf-8');
    mockReadFile.mockImplementation(async (path: string) => Buffer.from(`content:${path}`));

    const manager = new RendererProtocolManager({
      getExportMimeType,
      nextExportDir: '/export',
      resolveRendererFilePath,
    });

    manager.registerHandler();
    expect(mockProtocol.handle).toHaveBeenCalled();
    const handler = protocolHandlerRef.current;

    const response = await handler({ url: 'app://next/missing' } as any);
    const body = await response.text();

    expect(resolveRendererFilePath).toHaveBeenCalledTimes(2);
    expect(resolveRendererFilePath.mock.calls[0][0].pathname).toBe('/missing');
    expect(resolveRendererFilePath.mock.calls[1][0].pathname).toBe('/');

    expect(mockReadFile).toHaveBeenCalledWith('/export/index.html');
    expect(body).toContain('/export/index.html');
    expect(response.status).toBe(200);
  });

  it('should serve 404.html when explicitly requested', async () => {
    const resolveRendererFilePath = vi.fn(async (url: URL) => {
      if (url.pathname === '/404.html') return '/export/404.html';
      if (url.pathname === '/') return '/export/index.html';
      return null;
    });
    const getExportMimeType = vi.fn(() => 'text/html; charset=utf-8');
    mockReadFile.mockImplementation(async (path: string) => Buffer.from(`content:${path}`));

    const manager = new RendererProtocolManager({
      getExportMimeType,
      nextExportDir: '/export',
      resolveRendererFilePath,
    });

    manager.registerHandler();
    const handler = protocolHandlerRef.current;

    const response = await handler({ url: 'app://next/404.html' } as any);

    expect(resolveRendererFilePath).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledWith('/export/404.html');
    expect(response.status).toBe(200);
  });

  it('should return 404 for missing asset requests without fallback', async () => {
    const resolveRendererFilePath = vi.fn(async (_url: URL) => null);
    const getExportMimeType = vi.fn();

    const manager = new RendererProtocolManager({
      getExportMimeType,
      nextExportDir: '/export',
      resolveRendererFilePath,
    });

    manager.registerHandler();
    const handler = protocolHandlerRef.current;

    const response = await handler({ url: 'app://next/logo.png' } as any);

    expect(resolveRendererFilePath).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
  });
});

