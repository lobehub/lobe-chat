import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';
import { globalHelpers } from '@/store/global/helpers';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

import { discoverService } from './discover';

// Mock dependencies
vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    market: {
      getAssistantCategories: { query: vi.fn() },
      getAssistantDetail: { query: vi.fn() },
      getAssistantIdentifiers: { query: vi.fn() },
      getAssistantList: { query: vi.fn() },
      getMcpCategories: { query: vi.fn() },
      getMcpDetail: { query: vi.fn() },
      getMcpList: { query: vi.fn() },
      getMcpManifest: { query: vi.fn() },
      getModelCategories: { query: vi.fn() },
      getModelDetail: { query: vi.fn() },
      getModelIdentifiers: { query: vi.fn() },
      getModelList: { query: vi.fn() },
      getPluginCategories: { query: vi.fn() },
      getPluginDetail: { query: vi.fn() },
      getPluginIdentifiers: { query: vi.fn() },
      getPluginList: { query: vi.fn() },
      getProviderDetail: { query: vi.fn() },
      getProviderIdentifiers: { query: vi.fn() },
      getProviderList: { query: vi.fn() },
      registerClientInMarketplace: { mutate: vi.fn() },
      registerM2MToken: { query: vi.fn() },
      reportMcpInstallResult: { mutate: vi.fn() },
      reportCall: { mutate: vi.fn() },
    },
  },
}));

vi.mock('@/store/global/helpers', () => ({
  globalHelpers: {
    getCurrentLanguage: vi.fn(),
  },
}));

vi.mock('@/store/user', () => ({
  useUserStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@/store/user/selectors', () => ({
  preferenceSelectors: {
    userAllowTrace: vi.fn(),
  },
}));

describe('DiscoverService', () => {
  const mockLocale = 'en-US';
  let localStorageMock: Record<string, string>;
  let documentCookieMock: string;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset private state
    (discoverService as any)._isRetrying = false;

    // Mock globalHelpers.getCurrentLanguage
    vi.mocked(globalHelpers.getCurrentLanguage).mockReturnValue(mockLocale);

    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
    } as any;

    // Mock document.cookie
    documentCookieMock = '';
    Object.defineProperty(document, 'cookie', {
      get: () => documentCookieMock,
      set: (value: string) => {
        documentCookieMock = value;
      },
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================== Assistant Market Tests ==============================

  describe('getAssistantCategories', () => {
    it('should fetch assistant categories with locale', async () => {
      const mockCategories: any = [{ id: 'cat1', name: 'Category 1' }];
      vi.mocked(lambdaClient.market.getAssistantCategories.query).mockResolvedValue(mockCategories);

      const result = await discoverService.getAssistantCategories();

      expect(lambdaClient.market.getAssistantCategories.query).toBeCalledWith({
        locale: mockLocale,
        source: undefined,
      });
      expect(result).toEqual(mockCategories);
    });

    it('should pass through source parameter', async () => {
      await discoverService.getAssistantCategories({ source: 'lobehub' as any });

      expect(lambdaClient.market.getAssistantCategories.query).toBeCalledWith({
        locale: mockLocale,
        source: 'lobehub',
      });
    });
  });

  describe('getAssistantDetail', () => {
    it('should fetch assistant detail with identifier and locale', async () => {
      const mockDetail: any = { identifier: 'test-assistant', title: 'Test Assistant' };
      vi.mocked(lambdaClient.market.getAssistantDetail.query).mockResolvedValue(mockDetail);

      const result = await discoverService.getAssistantDetail({ identifier: 'test-assistant' });

      expect(lambdaClient.market.getAssistantDetail.query).toBeCalledWith({
        identifier: 'test-assistant',
        locale: mockLocale,
        source: undefined,
        version: undefined,
      });
      expect(result).toEqual(mockDetail);
    });
  });

  describe('getAssistantIdentifiers', () => {
    it('should fetch assistant identifiers', async () => {
      const mockIdentifiers: any = [{ identifier: 'id1', lastModified: '2024-01-01' }];
      vi.mocked(lambdaClient.market.getAssistantIdentifiers.query).mockResolvedValue(
        mockIdentifiers,
      );

      const result = await discoverService.getAssistantIdentifiers();

      expect(lambdaClient.market.getAssistantIdentifiers.query).toBeCalledWith({});
      expect(result).toEqual(mockIdentifiers);
    });
  });

  describe('getAssistantList', () => {
    it('should fetch assistant list with default pagination', async () => {
      const mockList: any = {
        items: [],
        currentPage: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 1,
      };
      vi.mocked(lambdaClient.market.getAssistantList.query).mockResolvedValue(mockList);

      await discoverService.getAssistantList();

      expect(lambdaClient.market.getAssistantList.query).toBeCalledWith(
        {
          locale: mockLocale,
          page: 1,
          pageSize: 20,
        },
        { context: { showNotification: false } },
      );
    });

    it('should convert page and pageSize to numbers', async () => {
      const mockList: any = {
        items: [],
        currentPage: 3,
        pageSize: 50,
        totalCount: 0,
        totalPages: 1,
      };
      vi.mocked(lambdaClient.market.getAssistantList.query).mockResolvedValue(mockList);

      await discoverService.getAssistantList({ page: '3', pageSize: '50' } as any);

      expect(lambdaClient.market.getAssistantList.query).toBeCalledWith(
        {
          locale: mockLocale,
          page: 3,
          pageSize: 50,
        },
        { context: { showNotification: false } },
      );
    });
  });

  // ============================== MCP Market Tests ==============================

  describe('getMcpCategories', () => {
    it('should fetch MCP categories with locale', async () => {
      const mockCategories: any = [{ id: 'mcp1', name: 'MCP Category 1' }];
      vi.mocked(lambdaClient.market.getMcpCategories.query).mockResolvedValue(mockCategories);

      const result = await discoverService.getMcpCategories();

      expect(lambdaClient.market.getMcpCategories.query).toBeCalledWith({
        locale: mockLocale,
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getMcpDetail', () => {
    it('should fetch MCP detail with identifier', async () => {
      const mockDetail: any = { identifier: 'test-mcp', title: 'Test MCP' };
      vi.mocked(lambdaClient.market.getMcpDetail.query).mockResolvedValue(mockDetail);

      const result = await discoverService.getMcpDetail({ identifier: 'test-mcp' });

      expect(lambdaClient.market.getMcpDetail.query).toBeCalledWith({
        identifier: 'test-mcp',
        locale: mockLocale,
        version: undefined,
      });
      expect(result).toEqual(mockDetail);
    });
  });

  describe('getMcpList', () => {
    it('should fetch MCP list with default pagination', async () => {
      const mockList: any = {
        items: [],
        currentPage: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 1,
      };
      vi.mocked(lambdaClient.market.getMcpList.query).mockResolvedValue(mockList);

      await discoverService.getMcpList();

      expect(lambdaClient.market.getMcpList.query).toBeCalledWith({
        locale: mockLocale,
        page: 1,
        pageSize: 20,
      });
    });
  });

  describe('getMCPPluginList', () => {
    it('should inject token and fetch MCP plugin list', async () => {
      documentCookieMock = 'mp_token_status=active';
      const mockList: any = {
        items: [],
        currentPage: 1,
        pageSize: 21,
        totalCount: 0,
        totalPages: 1,
      };
      vi.mocked(lambdaClient.market.getMcpList.query).mockResolvedValue(mockList);

      await discoverService.getMCPPluginList({});

      expect(lambdaClient.market.getMcpList.query).toBeCalledWith({
        locale: mockLocale,
        page: 1,
        pageSize: 21,
      });
    });
  });

  describe('getMcpManifest', () => {
    it('should fetch MCP manifest with identifier', async () => {
      const mockManifest: any = { identifier: 'test-mcp', manifest: {} };
      vi.mocked(lambdaClient.market.getMcpManifest.query).mockResolvedValue(mockManifest);

      await discoverService.getMcpManifest({ identifier: 'test-mcp' });

      expect(lambdaClient.market.getMcpManifest.query).toBeCalledWith({
        identifier: 'test-mcp',
        locale: mockLocale,
        version: undefined,
      });
    });
  });

  describe('getMCPPluginManifest', () => {
    it('should fetch MCP plugin manifest with identifier', async () => {
      const mockManifest: any = { identifier: 'test-plugin' };
      vi.mocked(lambdaClient.market.getMcpManifest.query).mockResolvedValue(mockManifest);

      await discoverService.getMCPPluginManifest('test-plugin');

      expect(lambdaClient.market.getMcpManifest.query).toBeCalledWith({
        identifier: 'test-plugin',
        install: undefined,
        locale: mockLocale,
      });
    });

    it('should pass install option when provided', async () => {
      const mockManifest: any = { identifier: 'test-plugin' };
      vi.mocked(lambdaClient.market.getMcpManifest.query).mockResolvedValue(mockManifest);

      await discoverService.getMCPPluginManifest('test-plugin', { install: true });

      expect(lambdaClient.market.getMcpManifest.query).toBeCalledWith({
        identifier: 'test-plugin',
        install: true,
        locale: mockLocale,
      });
    });
  });

  describe('registerClient', () => {
    it('should register client in marketplace', async () => {
      const mockResponse = { clientId: 'client-123', clientSecret: 'secret-456' };
      vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
        mockResponse,
      );

      const result = await discoverService.registerClient();

      expect(lambdaClient.market.registerClientInMarketplace.mutate).toBeCalledWith({});
      expect(result).toEqual(mockResponse);
    });
  });

  // ============================== Model Market Tests ==============================

  describe('getModelCategories', () => {
    it('should fetch model categories', async () => {
      const mockCategories: any = [{ id: 'model1', name: 'Model Category' }];
      vi.mocked(lambdaClient.market.getModelCategories.query).mockResolvedValue(mockCategories);

      const result = await discoverService.getModelCategories();

      expect(lambdaClient.market.getModelCategories.query).toBeCalledWith({});
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getModelDetail', () => {
    it('should fetch model detail with identifier and locale', async () => {
      const mockDetail: any = { identifier: 'gpt-4', title: 'GPT-4' };
      vi.mocked(lambdaClient.market.getModelDetail.query).mockResolvedValue(mockDetail);

      const result = await discoverService.getModelDetail({ identifier: 'gpt-4' });

      expect(lambdaClient.market.getModelDetail.query).toBeCalledWith({
        identifier: 'gpt-4',
        locale: mockLocale,
      });
      expect(result).toEqual(mockDetail);
    });
  });

  describe('getModelIdentifiers', () => {
    it('should fetch model identifiers', async () => {
      const mockIdentifiers: any = [{ identifier: 'gpt-4', lastModified: '2024-01-01' }];
      vi.mocked(lambdaClient.market.getModelIdentifiers.query).mockResolvedValue(mockIdentifiers);

      const result = await discoverService.getModelIdentifiers();

      expect(lambdaClient.market.getModelIdentifiers.query).toBeCalled();
      expect(result).toEqual(mockIdentifiers);
    });
  });

  describe('getModelList', () => {
    it('should fetch model list with default pagination', async () => {
      const mockList: any = {
        items: [],
        currentPage: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 1,
      };
      vi.mocked(lambdaClient.market.getModelList.query).mockResolvedValue(mockList);

      await discoverService.getModelList();

      expect(lambdaClient.market.getModelList.query).toBeCalledWith({
        locale: mockLocale,
        page: 1,
        pageSize: 20,
      });
    });
  });

  // ============================== Plugin Market Tests ==============================

  describe('getPluginCategories', () => {
    it('should fetch plugin categories with locale', async () => {
      const mockCategories: any = [{ id: 'plugin1', name: 'Plugin Category' }];
      vi.mocked(lambdaClient.market.getPluginCategories.query).mockResolvedValue(mockCategories);

      const result = await discoverService.getPluginCategories();

      expect(lambdaClient.market.getPluginCategories.query).toBeCalledWith({
        locale: mockLocale,
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('getPluginDetail', () => {
    it('should fetch plugin detail with identifier', async () => {
      const mockDetail: any = { identifier: 'test-plugin', title: 'Test Plugin' };
      vi.mocked(lambdaClient.market.getPluginDetail.query).mockResolvedValue(mockDetail);

      const result = await discoverService.getPluginDetail({ identifier: 'test-plugin' });

      expect(lambdaClient.market.getPluginDetail.query).toBeCalledWith({
        identifier: 'test-plugin',
        locale: mockLocale,
        withManifest: undefined,
      });
      expect(result).toEqual(mockDetail);
    });
  });

  describe('getPluginIdentifiers', () => {
    it('should fetch plugin identifiers', async () => {
      const mockIdentifiers: any = [{ identifier: 'plugin1', lastModified: '2024-01-01' }];
      vi.mocked(lambdaClient.market.getPluginIdentifiers.query).mockResolvedValue(mockIdentifiers);

      const result = await discoverService.getPluginIdentifiers();

      expect(lambdaClient.market.getPluginIdentifiers.query).toBeCalled();
      expect(result).toEqual(mockIdentifiers);
    });
  });

  describe('getPluginList', () => {
    it('should fetch plugin list with default pagination', async () => {
      const mockList: any = {
        items: [],
        currentPage: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 1,
      };
      vi.mocked(lambdaClient.market.getPluginList.query).mockResolvedValue(mockList);

      await discoverService.getPluginList();

      expect(lambdaClient.market.getPluginList.query).toBeCalledWith({
        locale: mockLocale,
        page: 1,
        pageSize: 20,
      });
    });
  });

  // ============================== Provider Tests ==============================

  describe('getProviderDetail', () => {
    it('should fetch provider detail with identifier', async () => {
      const mockDetail: any = { identifier: 'openai', title: 'OpenAI' };
      vi.mocked(lambdaClient.market.getProviderDetail.query).mockResolvedValue(mockDetail);

      const result = await discoverService.getProviderDetail({ identifier: 'openai' });

      expect(lambdaClient.market.getProviderDetail.query).toBeCalledWith({
        identifier: 'openai',
        locale: mockLocale,
        withReadme: undefined,
      });
      expect(result).toEqual(mockDetail);
    });
  });

  describe('getProviderIdentifiers', () => {
    it('should fetch provider identifiers', async () => {
      const mockIdentifiers: any = [{ identifier: 'openai', lastModified: '2024-01-01' }];
      vi.mocked(lambdaClient.market.getProviderIdentifiers.query).mockResolvedValue(
        mockIdentifiers,
      );

      const result = await discoverService.getProviderIdentifiers();

      expect(lambdaClient.market.getProviderIdentifiers.query).toBeCalled();
      expect(result).toEqual(mockIdentifiers);
    });
  });

  describe('getProviderList', () => {
    it('should fetch provider list with default pagination', async () => {
      const mockList: any = {
        items: [],
        currentPage: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 1,
      };
      vi.mocked(lambdaClient.market.getProviderList.query).mockResolvedValue(mockList);

      await discoverService.getProviderList();

      expect(lambdaClient.market.getProviderList.query).toBeCalledWith({
        locale: mockLocale,
        page: 1,
        pageSize: 20,
      });
    });
  });

  // ============================== Report Tests ==============================

  describe('reportMcpInstallResult', () => {
    it('should not report when user does not allow tracing', async () => {
      vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(false);

      await discoverService.reportMcpInstallResult({
        identifier: 'test-mcp',
        version: '1.0.0',
        success: true,
        manifest: {} as any,
      });

      expect(lambdaClient.market.reportMcpInstallResult.mutate).not.toBeCalled();
    });

    it('should report successful installation when user allows tracing', async () => {
      vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
      documentCookieMock = 'mp_token_status=active';
      const mockManifest = { identifier: 'test-mcp' };

      vi.mocked(lambdaClient.market.reportMcpInstallResult.mutate).mockResolvedValue(
        undefined as any,
      );

      await discoverService.reportMcpInstallResult({
        identifier: 'test-mcp',
        version: '1.0.0',
        success: true,
        manifest: mockManifest as any,
      });

      expect(lambdaClient.market.reportMcpInstallResult.mutate).toBeCalledWith({
        identifier: 'test-mcp',
        version: '1.0.0',
        manifest: mockManifest,
        success: true,
      });
    });

    it('should report failed installation with error details', async () => {
      vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
      documentCookieMock = 'mp_token_status=active';

      vi.mocked(lambdaClient.market.reportMcpInstallResult.mutate).mockResolvedValue(
        undefined as any,
      );

      await discoverService.reportMcpInstallResult({
        identifier: 'test-mcp',
        version: '1.0.0',
        success: false,
        errorMessage: 'Installation failed',
        errorCode: 'INSTALL_ERROR',
      });

      expect(lambdaClient.market.reportMcpInstallResult.mutate).toBeCalledWith({
        identifier: 'test-mcp',
        version: '1.0.0',
        errorCode: 'INSTALL_ERROR',
        errorMessage: 'Installation failed',
        success: false,
      });
    });

    it('should handle report errors gracefully', async () => {
      vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
      documentCookieMock = 'mp_token_status=active';

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(lambdaClient.market.reportMcpInstallResult.mutate).mockRejectedValue(
        new Error('Report failed'),
      );

      await discoverService.reportMcpInstallResult({
        identifier: 'test-mcp',
        version: '1.0.0',
        success: true,
        manifest: {} as any,
      });

      expect(consoleWarnSpy).toBeCalledWith(
        'Failed to report MCP installation result:',
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('reportPluginCall', () => {
    it('should not report when user does not allow tracing', async () => {
      vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(false);

      await discoverService.reportPluginCall({
        identifier: 'test-plugin',
      } as any);

      expect(lambdaClient.market.reportCall.mutate).not.toBeCalled();
    });

    it('should report plugin call when user allows tracing', async () => {
      vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
      documentCookieMock = 'mp_token_status=active';

      vi.mocked(lambdaClient.market.reportCall.mutate).mockResolvedValue(undefined as any);

      await discoverService.reportPluginCall({
        identifier: 'test-plugin',
      } as any);

      expect(lambdaClient.market.reportCall.mutate).toBeCalledWith({
        identifier: 'test-plugin',
      });
    });

    it('should handle report errors gracefully', async () => {
      vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
      documentCookieMock = 'mp_token_status=active';

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.mocked(lambdaClient.market.reportCall.mutate).mockRejectedValue(
        new Error('Report failed'),
      );

      await discoverService.reportPluginCall({
        identifier: 'test-plugin',
      } as any);

      expect(consoleWarnSpy).toBeCalledWith('Failed to report call:', expect.any(Error));

      consoleWarnSpy.mockRestore();
    });
  });

  // ============================== Token Management Tests ==============================

  describe('getTokenStatusFromCookie', () => {
    it('should return null when document is undefined', () => {
      const originalDocument = global.document;
      // @ts-expect-error - Testing server environment
      global.document = undefined;

      const result = (discoverService as any).getTokenStatusFromCookie();

      expect(result).toBeNull();

      global.document = originalDocument;
    });

    it('should extract token status from cookie', () => {
      documentCookieMock = 'mp_token_status=active; other_cookie=value';

      const result = (discoverService as any).getTokenStatusFromCookie();

      expect(result).toBe('active');
    });

    it('should return null when cookie does not exist', () => {
      documentCookieMock = 'other_cookie=value';

      const result = (discoverService as any).getTokenStatusFromCookie();

      expect(result).toBeNull();
    });

    it('should handle cookies with spaces in values', () => {
      documentCookieMock = 'other=value; mp_token_status=active; another=test';

      const result = (discoverService as any).getTokenStatusFromCookie();

      expect(result).toBe('active');
    });
  });

  describe('injectMPToken', () => {
    it('should return early when localStorage is undefined', async () => {
      const originalLocalStorage = global.localStorage;
      // @ts-expect-error - Testing server environment
      global.localStorage = undefined;

      await (discoverService as any).injectMPToken();

      expect(lambdaClient.market.registerClientInMarketplace.mutate).not.toBeCalled();

      global.localStorage = originalLocalStorage;
    });

    it('should return early when token status is active', async () => {
      documentCookieMock = 'mp_token_status=active';

      await (discoverService as any).injectMPToken();

      expect(lambdaClient.market.registerClientInMarketplace.mutate).not.toBeCalled();
    });

    it('should register new client when localStorage is empty', async () => {
      const mockClientInfo = { clientId: 'client-123', clientSecret: 'secret-456' };
      vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
        mockClientInfo,
      );
      vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({ success: true });

      await (discoverService as any).injectMPToken();

      expect(lambdaClient.market.registerClientInMarketplace.mutate).toBeCalled();
      expect(localStorage.setItem).toBeCalledWith(
        '_mpc',
        expect.stringMatching(/^[A-Za-z0-9+/=]+$/),
      );
      expect(lambdaClient.market.registerM2MToken.query).toBeCalledWith({
        clientId: 'client-123',
        clientSecret: 'secret-456',
      });
    });

    it('should use existing client credentials from localStorage', async () => {
      const clientData = { clientId: 'existing-123', clientSecret: 'existing-secret' };
      const encodedData = btoa(JSON.stringify(clientData));
      localStorageMock._mpc = encodedData;

      vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({ success: true });

      await (discoverService as any).injectMPToken();

      expect(lambdaClient.market.registerClientInMarketplace.mutate).not.toBeCalled();
      expect(lambdaClient.market.registerM2MToken.query).toBeCalledWith({
        clientId: 'existing-123',
        clientSecret: 'existing-secret',
      });
    });

    it('should re-register when localStorage data is corrupted', async () => {
      localStorageMock._mpc = 'corrupted-data!!!';
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockClientInfo = { clientId: 'new-client', clientSecret: 'new-secret' };
      vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
        mockClientInfo,
      );
      vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({ success: true });

      await (discoverService as any).injectMPToken();

      expect(consoleErrorSpy).toBeCalledWith('Failed to decode client data:', expect.any(Error));
      expect(lambdaClient.market.registerClientInMarketplace.mutate).toBeCalled();
      expect(lambdaClient.market.registerM2MToken.query).toBeCalledWith({
        clientId: 'new-client',
        clientSecret: 'new-secret',
      });

      consoleErrorSpy.mockRestore();
    });

    it('should clear localStorage and retry when token registration fails', async () => {
      const clientData = { clientId: 'old-client', clientSecret: 'old-secret' };
      localStorageMock._mpc = btoa(JSON.stringify(clientData));

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockNewClient = { clientId: 'new-client', clientSecret: 'new-secret' };
      vi.mocked(lambdaClient.market.registerM2MToken.query)
        .mockResolvedValueOnce({ success: false })
        .mockResolvedValueOnce({ success: true });
      vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
        mockNewClient,
      );

      await (discoverService as any).injectMPToken();

      expect(consoleWarnSpy).toBeCalledWith(
        'Token registration failed, client credentials may be invalid. Clearing and retrying...',
      );
      expect(localStorage.removeItem).toBeCalledWith('_mpc');
      expect(lambdaClient.market.registerClientInMarketplace.mutate).toBeCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should not retry more than once when token registration fails', async () => {
      const clientData = { clientId: 'old-client', clientSecret: 'old-secret' };
      localStorageMock._mpc = btoa(JSON.stringify(clientData));

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({ success: false });
      vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue({
        clientId: 'new',
        clientSecret: 'new',
      });

      await (discoverService as any).injectMPToken();

      expect(consoleErrorSpy).toBeCalledWith('Failed to re-register after credential invalidation');
      expect(lambdaClient.market.registerClientInMarketplace.mutate).toBeCalledTimes(1);

      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should handle token registration errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const mockClientInfo = { clientId: 'client-123', clientSecret: 'secret-456' };
      vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
        mockClientInfo,
      );
      vi.mocked(lambdaClient.market.registerM2MToken.query).mockRejectedValue(
        new Error('Token registration failed'),
      );

      const result = await (discoverService as any).injectMPToken();

      expect(consoleErrorSpy).toBeCalledWith('Failed to register M2M token:', expect.any(Error));
      expect(result).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });
});
