import { InterceptRouteParams } from '@lobechat/electron-client-ipc';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppBrowsersIdentifiers, BrowsersIdentifiers } from '@/appBrowsers';
import type { App } from '@/core/App';
import type { IpcClientEventSender } from '@/types/ipcClientEvent';

import BrowserWindowsCtr from '../BrowserWindowsCtr';

// 模拟 App 及其依赖项
const mockToggleVisible = vi.fn();
const mockLoadUrl = vi.fn();
const mockShow = vi.fn();
const mockRedirectToPage = vi.fn();
const mockCloseWindow = vi.fn();
const mockMinimizeWindow = vi.fn();
const mockMaximizeWindow = vi.fn();
const mockRetrieveByIdentifier = vi.fn();
const mockGetMainWindow = vi.fn(() => ({
  toggleVisible: mockToggleVisible,
  loadUrl: mockLoadUrl,
  show: mockShow,
}));
const mockShowOther = vi.fn();

// mock findMatchingRoute and extractSubPath
vi.mock('~common/routes', async () => ({
  findMatchingRoute: vi.fn(),
  extractSubPath: vi.fn(),
}));
const { findMatchingRoute } = await import('~common/routes');

const mockApp = {
  browserManager: {
    getMainWindow: mockGetMainWindow,
    redirectToPage: mockRedirectToPage,
    closeWindow: mockCloseWindow,
    minimizeWindow: mockMinimizeWindow,
    maximizeWindow: mockMaximizeWindow,
    retrieveByIdentifier: mockRetrieveByIdentifier.mockImplementation(
      (identifier: AppBrowsersIdentifiers | string) => {
        if (identifier === 'some-other-window') {
          return { show: mockShowOther };
        }
        return { show: mockShowOther }; // Default mock for other identifiers
      },
    ),
  },
} as unknown as App;

describe('BrowserWindowsCtr', () => {
  let browserWindowsCtr: BrowserWindowsCtr;

  beforeEach(() => {
    vi.clearAllMocks();
    browserWindowsCtr = new BrowserWindowsCtr(mockApp);
  });

  describe('toggleMainWindow', () => {
    it('should get the main window and toggle its visibility', async () => {
      await browserWindowsCtr.toggleMainWindow();
      expect(mockGetMainWindow).toHaveBeenCalled();
      expect(mockToggleVisible).toHaveBeenCalled();
    });
  });

  describe('openSettingsWindow', () => {
    it('should navigate to settings in main window with the specified tab', async () => {
      const tab = 'appearance';
      const result = await browserWindowsCtr.openSettingsWindow(tab);
      expect(mockGetMainWindow).toHaveBeenCalled();
      expect(mockLoadUrl).toHaveBeenCalledWith('/settings?active=appearance');
      expect(mockShow).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    it('should return error if navigation fails', async () => {
      const errorMessage = 'Failed to navigate';
      mockLoadUrl.mockRejectedValueOnce(new Error(errorMessage));
      const result = await browserWindowsCtr.openSettingsWindow('display');
      expect(result).toEqual({ error: errorMessage, success: false });
    });
  });

  const testSenderIdentifierString: string = 'test-window-event-id';
  const sender: IpcClientEventSender = {
    identifier: testSenderIdentifierString,
  };

  describe('closeWindow', () => {
    it('should close the window with the given sender identifier', () => {
      browserWindowsCtr.closeWindow(undefined, sender);
      expect(mockCloseWindow).toHaveBeenCalledWith(testSenderIdentifierString);
    });
  });

  describe('minimizeWindow', () => {
    it('should minimize the window with the given sender identifier', () => {
      browserWindowsCtr.minimizeWindow(undefined, sender);
      expect(mockMinimizeWindow).toHaveBeenCalledWith(testSenderIdentifierString);
    });
  });

  describe('maximizeWindow', () => {
    it('should maximize the window with the given sender identifier', () => {
      browserWindowsCtr.maximizeWindow(undefined, sender);
      expect(mockMaximizeWindow).toHaveBeenCalledWith(testSenderIdentifierString);
    });
  });

  describe('interceptRoute', () => {
    const baseParams = { source: 'link-click' as const };

    it('should not intercept if no matching route is found', async () => {
      const params: InterceptRouteParams = {
        ...baseParams,
        path: '/unknown/route',
        url: 'app://host/unknown/route',
      };
      (findMatchingRoute as Mock).mockReturnValue(undefined);
      const result = await browserWindowsCtr.interceptRoute(params);
      expect(findMatchingRoute).toHaveBeenCalledWith(params.path);
      expect(result).toEqual({ intercepted: false, path: params.path, source: params.source });
    });

    it('should open target window if matched route is found', async () => {
      const params: InterceptRouteParams = {
        ...baseParams,
        path: '/other/page',
        url: 'app://host/other/page',
      };
      const targetWindowIdentifier = 'some-other-window' as AppBrowsersIdentifiers;
      const matchedRoute = { targetWindow: targetWindowIdentifier, pathPrefix: '/other' };
      (findMatchingRoute as Mock).mockReturnValue(matchedRoute);

      const result = await browserWindowsCtr.interceptRoute(params);

      expect(findMatchingRoute).toHaveBeenCalledWith(params.path);
      expect(mockRetrieveByIdentifier).toHaveBeenCalledWith(targetWindowIdentifier);
      expect(mockShowOther).toHaveBeenCalled();
      expect(result).toEqual({
        intercepted: true,
        path: params.path,
        source: params.source,
        targetWindow: matchedRoute.targetWindow,
      });
    });

    it('should return error if processing route interception fails', async () => {
      const params: InterceptRouteParams = {
        ...baseParams,
        path: '/another/custom',
        url: 'app://host/another/custom',
      };
      const targetWindowIdentifier = 'another-custom-window' as AppBrowsersIdentifiers;
      const matchedRoute = { targetWindow: targetWindowIdentifier, pathPrefix: '/another' };
      const errorMessage = 'Processing error for other window';
      (findMatchingRoute as Mock).mockReturnValue(matchedRoute);
      mockRetrieveByIdentifier.mockImplementationOnce(() => {
        throw new Error(errorMessage);
      });

      const result = await browserWindowsCtr.interceptRoute(params);

      expect(result).toEqual({
        error: errorMessage,
        intercepted: false,
        path: params.path,
        source: params.source,
      });
    });
  });
});
