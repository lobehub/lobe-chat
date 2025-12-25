// @ts-nocheck - Disabling type checking for test mocks
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';
import { globalHelpers } from '@/store/global/helpers';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

import { discoverService } from './discover';

// Mock dependencies
vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    market: {
      getAssistantCategories: {
        query: vi.fn(),
      },
      getAssistantDetail: {
        query: vi.fn(),
      },
      getAssistantIdentifiers: {
        query: vi.fn(),
      },
      getAssistantList: {
        query: vi.fn(),
      },
      getMcpCategories: {
        query: vi.fn(),
      },
      getMcpDetail: {
        query: vi.fn(),
      },
      getMcpList: {
        query: vi.fn(),
      },
      getMcpManifest: {
        query: vi.fn(),
      },
      getModelCategories: {
        query: vi.fn(),
      },
      getModelDetail: {
        query: vi.fn(),
      },
      getModelIdentifiers: {
        query: vi.fn(),
      },
      getModelList: {
        query: vi.fn(),
      },
      getPluginCategories: {
        query: vi.fn(),
      },
      getPluginDetail: {
        query: vi.fn(),
      },
      getPluginIdentifiers: {
        query: vi.fn(),
      },
      getPluginList: {
        query: vi.fn(),
      },
      getProviderDetail: {
        query: vi.fn(),
      },
      getProviderIdentifiers: {
        query: vi.fn(),
      },
      getProviderList: {
        query: vi.fn(),
      },
      registerClientInMarketplace: {
        mutate: vi.fn(),
      },
      registerM2MToken: {
        query: vi.fn(),
      },
      reportMcpInstallResult: {
        mutate: vi.fn(),
      },
      reportCall: {
        mutate: vi.fn(),
      },
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(globalHelpers.getCurrentLanguage).mockReturnValue(mockLocale);

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as any;

    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  describe('Assistant Market', () => {
    describe('getAssistantCategories', () => {
      it('should fetch assistant categories with locale', async () => {
        const mockCategories = [
          { id: '1', name: 'Category 1' },
          { id: '2', name: 'Category 2' },
        ];
        vi.mocked(lambdaClient.market.getAssistantCategories.query).mockResolvedValue(
          mockCategories,
        );

        const result = await discoverService.getAssistantCategories();

        expect(lambdaClient.market.getAssistantCategories.query).toHaveBeenCalledWith({
          locale: mockLocale,
          source: undefined,
        });
        expect(result).toEqual(mockCategories);
      });

      it('should pass source parameter when provided', async () => {
        const mockCategories = [{ id: '1', name: 'Category 1' }];
        vi.mocked(lambdaClient.market.getAssistantCategories.query).mockResolvedValue(
          mockCategories,
        );

        await discoverService.getAssistantCategories({ source: 'official' });

        expect(lambdaClient.market.getAssistantCategories.query).toHaveBeenCalledWith({
          locale: mockLocale,
          source: 'official',
        });
      });
    });

    describe('getAssistantDetail', () => {
      it('should fetch assistant detail with identifier', async () => {
        const mockDetail = { identifier: 'test-agent', name: 'Test Agent' };
        vi.mocked(lambdaClient.market.getAssistantDetail.query).mockResolvedValue(mockDetail);

        const result = await discoverService.getAssistantDetail({ identifier: 'test-agent' });

        expect(lambdaClient.market.getAssistantDetail.query).toHaveBeenCalledWith({
          identifier: 'test-agent',
          locale: mockLocale,
          source: undefined,
          version: undefined,
        });
        expect(result).toEqual(mockDetail);
      });

      it('should pass optional parameters', async () => {
        const mockDetail = { identifier: 'test-agent', name: 'Test Agent' };
        vi.mocked(lambdaClient.market.getAssistantDetail.query).mockResolvedValue(mockDetail);

        await discoverService.getAssistantDetail({
          identifier: 'test-agent',
          source: 'community',
          version: '1.0.0',
        });

        expect(lambdaClient.market.getAssistantDetail.query).toHaveBeenCalledWith({
          identifier: 'test-agent',
          locale: mockLocale,
          source: 'community',
          version: '1.0.0',
        });
      });
    });

    describe('getAssistantIdentifiers', () => {
      it('should fetch assistant identifiers', async () => {
        const mockIdentifiers = { identifiers: ['id1', 'id2'] };
        vi.mocked(lambdaClient.market.getAssistantIdentifiers.query).mockResolvedValue(
          mockIdentifiers,
        );

        const result = await discoverService.getAssistantIdentifiers();

        expect(lambdaClient.market.getAssistantIdentifiers.query).toHaveBeenCalledWith({});
        expect(result).toEqual(mockIdentifiers);
      });

      it('should pass source parameter when provided', async () => {
        const mockIdentifiers = { identifiers: ['id1', 'id2'] };
        vi.mocked(lambdaClient.market.getAssistantIdentifiers.query).mockResolvedValue(
          mockIdentifiers,
        );

        await discoverService.getAssistantIdentifiers({ source: 'official' });

        expect(lambdaClient.market.getAssistantIdentifiers.query).toHaveBeenCalledWith({
          source: 'official',
        });
      });
    });

    describe('getAssistantList', () => {
      it('should fetch assistant list with default pagination', async () => {
        const mockList = { items: [], total: 0 };
        vi.mocked(lambdaClient.market.getAssistantList.query).mockResolvedValue(mockList);

        const result = await discoverService.getAssistantList();

        expect(lambdaClient.market.getAssistantList.query).toHaveBeenCalledWith(
          {
            locale: mockLocale,
            page: 1,
            pageSize: 20,
          },
          { context: { showNotification: false } },
        );
        expect(result).toEqual(mockList);
      });

      it('should convert page and pageSize to numbers', async () => {
        const mockList = { items: [], total: 0 };
        vi.mocked(lambdaClient.market.getAssistantList.query).mockResolvedValue(mockList);

        await discoverService.getAssistantList({ page: '2' as any, pageSize: '50' as any });

        expect(lambdaClient.market.getAssistantList.query).toHaveBeenCalledWith(
          {
            locale: mockLocale,
            page: 2,
            pageSize: 50,
          },
          { context: { showNotification: false } },
        );
      });

      it('should pass additional query parameters', async () => {
        const mockList = { items: [], total: 0 };
        vi.mocked(lambdaClient.market.getAssistantList.query).mockResolvedValue(mockList);

        await discoverService.getAssistantList({ category: 'productivity', search: 'test' });

        expect(lambdaClient.market.getAssistantList.query).toHaveBeenCalledWith(
          {
            category: 'productivity',
            locale: mockLocale,
            page: 1,
            pageSize: 20,
            search: 'test',
          },
          { context: { showNotification: false } },
        );
      });
    });
  });

  describe('MCP Market', () => {
    describe('getMcpCategories', () => {
      it('should fetch MCP categories with locale', async () => {
        const mockCategories = [{ id: '1', name: 'MCP Category' }];
        vi.mocked(lambdaClient.market.getMcpCategories.query).mockResolvedValue(mockCategories);

        const result = await discoverService.getMcpCategories();

        expect(lambdaClient.market.getMcpCategories.query).toHaveBeenCalledWith({
          locale: mockLocale,
        });
        expect(result).toEqual(mockCategories);
      });
    });

    describe('getMcpDetail', () => {
      it('should fetch MCP detail with identifier', async () => {
        const mockDetail = { identifier: 'test-mcp', name: 'Test MCP' };
        vi.mocked(lambdaClient.market.getMcpDetail.query).mockResolvedValue(mockDetail);

        const result = await discoverService.getMcpDetail({ identifier: 'test-mcp' });

        expect(lambdaClient.market.getMcpDetail.query).toHaveBeenCalledWith({
          identifier: 'test-mcp',
          locale: mockLocale,
          version: undefined,
        });
        expect(result).toEqual(mockDetail);
      });
    });

    describe('getMcpList', () => {
      it('should fetch MCP list with default pagination', async () => {
        const mockList = { items: [], total: 0 };
        vi.mocked(lambdaClient.market.getMcpList.query).mockResolvedValue(mockList);

        const result = await discoverService.getMcpList();

        expect(lambdaClient.market.getMcpList.query).toHaveBeenCalledWith({
          locale: mockLocale,
          page: 1,
          pageSize: 20,
        });
        expect(result).toEqual(mockList);
      });

      it('should convert page and pageSize to numbers', async () => {
        const mockList = { items: [], total: 0 };
        vi.mocked(lambdaClient.market.getMcpList.query).mockResolvedValue(mockList);

        await discoverService.getMcpList({ page: '3' as any, pageSize: '30' as any });

        expect(lambdaClient.market.getMcpList.query).toHaveBeenCalledWith({
          locale: mockLocale,
          page: 3,
          pageSize: 30,
        });
      });
    });

    describe('getMCPPluginList', () => {
      it('should inject MP token before fetching', async () => {
        const mockList = { items: [], total: 0 };
        vi.mocked(lambdaClient.market.getMcpList.query).mockResolvedValue(mockList);
        vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({
          success: true,
        });

        // Mock cookie to return 'active' to skip token injection
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        const result = await discoverService.getMCPPluginList({ category: 'tools' });

        expect(result).toEqual(mockList);
        expect(lambdaClient.market.getMcpList.query).toHaveBeenCalledWith({
          category: 'tools',
          locale: mockLocale,
          page: 1,
          pageSize: 21,
        });
      });
    });

    describe('getMcpManifest', () => {
      it('should fetch MCP manifest with identifier', async () => {
        const mockManifest = { identifier: 'test-mcp', manifest: {} };
        vi.mocked(lambdaClient.market.getMcpManifest.query).mockResolvedValue(mockManifest);

        const result = await discoverService.getMcpManifest({ identifier: 'test-mcp' });

        expect(lambdaClient.market.getMcpManifest.query).toHaveBeenCalledWith({
          identifier: 'test-mcp',
          locale: mockLocale,
          version: undefined,
        });
        expect(result).toEqual(mockManifest);
      });
    });

    describe('getMCPPluginManifest', () => {
      it('should fetch MCP plugin manifest', async () => {
        const mockManifest = { identifier: 'test-plugin', api: [] };
        vi.mocked(lambdaClient.market.getMcpManifest.query).mockResolvedValue(mockManifest);

        const result = await discoverService.getMCPPluginManifest('test-plugin');

        expect(lambdaClient.market.getMcpManifest.query).toHaveBeenCalledWith({
          identifier: 'test-plugin',
          install: undefined,
          locale: mockLocale,
        });
        expect(result).toEqual(mockManifest);
      });

      it('should pass install option when provided', async () => {
        const mockManifest = { identifier: 'test-plugin', api: [] };
        vi.mocked(lambdaClient.market.getMcpManifest.query).mockResolvedValue(mockManifest);

        await discoverService.getMCPPluginManifest('test-plugin', { install: true });

        expect(lambdaClient.market.getMcpManifest.query).toHaveBeenCalledWith({
          identifier: 'test-plugin',
          install: true,
          locale: mockLocale,
        });
      });
    });

    describe('registerClient', () => {
      it('should register client in marketplace', async () => {
        const mockClientInfo = { clientId: 'client-123', clientSecret: 'secret-456' };
        vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
          mockClientInfo,
        );

        const result = await discoverService.registerClient();

        expect(lambdaClient.market.registerClientInMarketplace.mutate).toHaveBeenCalledWith({});
        expect(result).toEqual(mockClientInfo);
      });
    });

    describe('reportMcpInstallResult', () => {
      it('should not report if user does not allow trace', async () => {
        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(false);

        await discoverService.reportMcpInstallResult({
          success: true,
          identifier: 'test-mcp',
          manifest: {},
        });

        expect(lambdaClient.market.reportMcpInstallResult.mutate).not.toHaveBeenCalled();
      });

      it('should report successful installation when user allows trace', async () => {
        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
        vi.mocked(lambdaClient.market.reportMcpInstallResult.mutate).mockResolvedValue(undefined);
        vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({
          success: true,
        });

        // Mock cookie to skip token injection
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        await discoverService.reportMcpInstallResult({
          success: true,
          identifier: 'test-mcp',
          manifest: { api: [] },
        });

        expect(lambdaClient.market.reportMcpInstallResult.mutate).toHaveBeenCalledWith({
          success: true,
          identifier: 'test-mcp',
          manifest: { api: [] },
        });
      });

      it('should report failed installation with error details', async () => {
        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
        vi.mocked(lambdaClient.market.reportMcpInstallResult.mutate).mockResolvedValue(undefined);

        // Mock cookie to skip token injection
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        await discoverService.reportMcpInstallResult({
          success: false,
          identifier: 'test-mcp',
          manifest: undefined,
          errorMessage: 'Installation failed',
          errorCode: 'INSTALL_ERROR',
        });

        expect(lambdaClient.market.reportMcpInstallResult.mutate).toHaveBeenCalledWith({
          success: false,
          identifier: 'test-mcp',
          errorMessage: 'Installation failed',
          errorCode: 'INSTALL_ERROR',
        });
      });

      it('should handle report errors gracefully', async () => {
        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.mocked(lambdaClient.market.reportMcpInstallResult.mutate).mockRejectedValue(
          new Error('Network error'),
        );

        // Mock cookie to skip token injection
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        await discoverService.reportMcpInstallResult({
          success: true,
          identifier: 'test-mcp',
          manifest: {},
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Failed to report MCP installation result:',
          expect.any(Error),
        );
        consoleWarnSpy.mockRestore();
      });
    });

    describe('reportPluginCall', () => {
      it('should not report if user does not allow trace', async () => {
        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(false);

        await discoverService.reportPluginCall({
          identifier: 'test-plugin',
          toolName: 'test-tool',
        });

        expect(lambdaClient.market.reportCall.mutate).not.toHaveBeenCalled();
      });

      it('should report plugin call when user allows trace', async () => {
        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
        vi.mocked(lambdaClient.market.reportCall.mutate).mockResolvedValue(undefined);

        // Mock cookie to skip token injection
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        await discoverService.reportPluginCall({
          identifier: 'test-plugin',
          toolName: 'test-tool',
        });

        expect(lambdaClient.market.reportCall.mutate).toHaveBeenCalledWith({
          identifier: 'test-plugin',
          toolName: 'test-tool',
        });
      });

      it('should handle report errors gracefully', async () => {
        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.mocked(lambdaClient.market.reportCall.mutate).mockRejectedValue(
          new Error('Network error'),
        );

        // Mock cookie to skip token injection
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        await discoverService.reportPluginCall({
          identifier: 'test-plugin',
          toolName: 'test-tool',
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to report call:', expect.any(Error));
        consoleWarnSpy.mockRestore();
      });
    });
  });

  describe('Models', () => {
    describe('getModelCategories', () => {
      it('should fetch model categories', async () => {
        const mockCategories = [{ id: '1', name: 'Model Category' }];
        vi.mocked(lambdaClient.market.getModelCategories.query).mockResolvedValue(mockCategories);

        const result = await discoverService.getModelCategories();

        expect(lambdaClient.market.getModelCategories.query).toHaveBeenCalledWith({});
        expect(result).toEqual(mockCategories);
      });
    });

    describe('getModelDetail', () => {
      it('should fetch model detail with identifier', async () => {
        const mockDetail = { identifier: 'test-model', name: 'Test Model' };
        vi.mocked(lambdaClient.market.getModelDetail.query).mockResolvedValue(mockDetail);

        const result = await discoverService.getModelDetail({ identifier: 'test-model' });

        expect(lambdaClient.market.getModelDetail.query).toHaveBeenCalledWith({
          identifier: 'test-model',
          locale: mockLocale,
        });
        expect(result).toEqual(mockDetail);
      });
    });

    describe('getModelIdentifiers', () => {
      it('should fetch model identifiers', async () => {
        const mockIdentifiers = { identifiers: ['model1', 'model2'] };
        vi.mocked(lambdaClient.market.getModelIdentifiers.query).mockResolvedValue(mockIdentifiers);

        const result = await discoverService.getModelIdentifiers();

        expect(lambdaClient.market.getModelIdentifiers.query).toHaveBeenCalled();
        expect(result).toEqual(mockIdentifiers);
      });
    });

    describe('getModelList', () => {
      it('should fetch model list with default pagination', async () => {
        const mockList = { items: [], total: 0 };
        vi.mocked(lambdaClient.market.getModelList.query).mockResolvedValue(mockList);

        const result = await discoverService.getModelList();

        expect(lambdaClient.market.getModelList.query).toHaveBeenCalledWith({
          locale: mockLocale,
          page: 1,
          pageSize: 20,
        });
        expect(result).toEqual(mockList);
      });
    });
  });

  describe('Plugin Market', () => {
    describe('getPluginCategories', () => {
      it('should fetch plugin categories with locale', async () => {
        const mockCategories = [{ id: '1', name: 'Plugin Category' }];
        vi.mocked(lambdaClient.market.getPluginCategories.query).mockResolvedValue(mockCategories);

        const result = await discoverService.getPluginCategories();

        expect(lambdaClient.market.getPluginCategories.query).toHaveBeenCalledWith({
          locale: mockLocale,
        });
        expect(result).toEqual(mockCategories);
      });
    });

    describe('getPluginDetail', () => {
      it('should fetch plugin detail with identifier', async () => {
        const mockDetail = { identifier: 'test-plugin', name: 'Test Plugin' };
        vi.mocked(lambdaClient.market.getPluginDetail.query).mockResolvedValue(mockDetail);

        const result = await discoverService.getPluginDetail({ identifier: 'test-plugin' });

        expect(lambdaClient.market.getPluginDetail.query).toHaveBeenCalledWith({
          identifier: 'test-plugin',
          locale: mockLocale,
          withManifest: undefined,
        });
        expect(result).toEqual(mockDetail);
      });

      it('should pass withManifest parameter when provided', async () => {
        const mockDetail = { identifier: 'test-plugin', name: 'Test Plugin' };
        vi.mocked(lambdaClient.market.getPluginDetail.query).mockResolvedValue(mockDetail);

        await discoverService.getPluginDetail({ identifier: 'test-plugin', withManifest: true });

        expect(lambdaClient.market.getPluginDetail.query).toHaveBeenCalledWith({
          identifier: 'test-plugin',
          locale: mockLocale,
          withManifest: true,
        });
      });
    });

    describe('getPluginIdentifiers', () => {
      it('should fetch plugin identifiers', async () => {
        const mockIdentifiers = { identifiers: ['plugin1', 'plugin2'] };
        vi.mocked(lambdaClient.market.getPluginIdentifiers.query).mockResolvedValue(
          mockIdentifiers,
        );

        const result = await discoverService.getPluginIdentifiers();

        expect(lambdaClient.market.getPluginIdentifiers.query).toHaveBeenCalled();
        expect(result).toEqual(mockIdentifiers);
      });
    });

    describe('getPluginList', () => {
      it('should fetch plugin list with default pagination', async () => {
        const mockList = { items: [], total: 0 };
        vi.mocked(lambdaClient.market.getPluginList.query).mockResolvedValue(mockList);

        const result = await discoverService.getPluginList();

        expect(lambdaClient.market.getPluginList.query).toHaveBeenCalledWith({
          locale: mockLocale,
          page: 1,
          pageSize: 20,
        });
        expect(result).toEqual(mockList);
      });
    });
  });

  describe('Providers', () => {
    describe('getProviderDetail', () => {
      it('should fetch provider detail with identifier', async () => {
        const mockDetail = { identifier: 'test-provider', name: 'Test Provider' };
        vi.mocked(lambdaClient.market.getProviderDetail.query).mockResolvedValue(mockDetail);

        const result = await discoverService.getProviderDetail({ identifier: 'test-provider' });

        expect(lambdaClient.market.getProviderDetail.query).toHaveBeenCalledWith({
          identifier: 'test-provider',
          locale: mockLocale,
          withReadme: undefined,
        });
        expect(result).toEqual(mockDetail);
      });

      it('should pass withReadme parameter when provided', async () => {
        const mockDetail = { identifier: 'test-provider', name: 'Test Provider' };
        vi.mocked(lambdaClient.market.getProviderDetail.query).mockResolvedValue(mockDetail);

        await discoverService.getProviderDetail({ identifier: 'test-provider', withReadme: true });

        expect(lambdaClient.market.getProviderDetail.query).toHaveBeenCalledWith({
          identifier: 'test-provider',
          locale: mockLocale,
          withReadme: true,
        });
      });
    });

    describe('getProviderIdentifiers', () => {
      it('should fetch provider identifiers', async () => {
        const mockIdentifiers = { identifiers: ['provider1', 'provider2'] };
        vi.mocked(lambdaClient.market.getProviderIdentifiers.query).mockResolvedValue(
          mockIdentifiers,
        );

        const result = await discoverService.getProviderIdentifiers();

        expect(lambdaClient.market.getProviderIdentifiers.query).toHaveBeenCalled();
        expect(result).toEqual(mockIdentifiers);
      });
    });

    describe('getProviderList', () => {
      it('should fetch provider list with default pagination', async () => {
        const mockList = { items: [], total: 0 };
        vi.mocked(lambdaClient.market.getProviderList.query).mockResolvedValue(mockList);

        const result = await discoverService.getProviderList();

        expect(lambdaClient.market.getProviderList.query).toHaveBeenCalledWith({
          locale: mockLocale,
          page: 1,
          pageSize: 20,
        });
        expect(result).toEqual(mockList);
      });
    });
  });

  describe('injectMPToken', () => {
    it('should return early if localStorage is undefined', async () => {
      // @ts-expect-error - testing edge case
      global.localStorage = undefined;

      await discoverService.injectMPToken();

      expect(lambdaClient.market.registerClientInMarketplace.mutate).not.toHaveBeenCalled();
    });

    it('should return early if token status is active', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'mp_token_status=active',
      });

      await discoverService.injectMPToken();

      expect(lambdaClient.market.registerClientInMarketplace.mutate).not.toHaveBeenCalled();
    });

    it('should register new client if localStorage is empty', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue({
        clientId: 'new-client-id',
        clientSecret: 'new-client-secret',
      });
      vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({ success: true });

      await discoverService.injectMPToken();

      expect(lambdaClient.market.registerClientInMarketplace.mutate).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        '_mpc',
        'eyJjbGllbnRJZCI6Im5ldy1jbGllbnQtaWQiLCJjbGllbnRTZWNyZXQiOiJuZXctY2xpZW50LXNlY3JldCJ9',
      );
      expect(lambdaClient.market.registerM2MToken.query).toHaveBeenCalledWith({
        clientId: 'new-client-id',
        clientSecret: 'new-client-secret',
      });
    });

    it('should use existing client data from localStorage', async () => {
      const clientData = JSON.stringify({
        clientId: 'existing-id',
        clientSecret: 'existing-secret',
      });
      const encodedData = btoa(clientData);
      vi.mocked(localStorage.getItem).mockReturnValue(encodedData);
      vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({ success: true });

      await discoverService.injectMPToken();

      expect(lambdaClient.market.registerClientInMarketplace.mutate).not.toHaveBeenCalled();
      expect(lambdaClient.market.registerM2MToken.query).toHaveBeenCalledWith({
        clientId: 'existing-id',
        clientSecret: 'existing-secret',
      });
    });

    it('should re-register if decoding localStorage data fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-base64-data');
      vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue({
        clientId: 'new-client-id',
        clientSecret: 'new-client-secret',
      });
      vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({ success: true });

      await discoverService.injectMPToken();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to decode client data:',
        expect.any(Error),
      );
      expect(lambdaClient.market.registerClientInMarketplace.mutate).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should retry once if token registration fails', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const clientData = JSON.stringify({ clientId: 'old-id', clientSecret: 'old-secret' });
      const encodedData = btoa(clientData);

      vi.mocked(localStorage.getItem).mockReturnValueOnce(encodedData).mockReturnValueOnce(null);

      vi.mocked(lambdaClient.market.registerM2MToken.query)
        .mockResolvedValueOnce({ success: false })
        .mockResolvedValueOnce({ success: true });

      vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue({
        clientId: 'new-id',
        clientSecret: 'new-secret',
      });

      await discoverService.injectMPToken();

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('_mpc');
      expect(lambdaClient.market.registerClientInMarketplace.mutate).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should handle errors during token registration', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const clientData = JSON.stringify({ clientId: 'test-id', clientSecret: 'test-secret' });
      const encodedData = btoa(clientData);

      vi.mocked(localStorage.getItem).mockReturnValue(encodedData);
      vi.mocked(lambdaClient.market.registerM2MToken.query).mockRejectedValue(
        new Error('Network error'),
      );

      const result = await discoverService.injectMPToken();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to register M2M token:',
        expect.any(Error),
      );
      expect(result).toBeNull();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getTokenStatusFromCookie', () => {
    it('should return token status from cookie', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'mp_token_status=active; other_cookie=value',
      });

      // Access private method through token injection
      vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({ success: true });
      const clientData = JSON.stringify({ clientId: 'test-id', clientSecret: 'test-secret' });
      vi.mocked(localStorage.getItem).mockReturnValue(btoa(clientData));

      await discoverService.injectMPToken();

      // The method should return early because token status is active
      expect(lambdaClient.market.registerM2MToken.query).not.toHaveBeenCalled();
    });

    it('should return null if cookie is not found', async () => {
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'other_cookie=value',
      });

      vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({ success: true });
      const clientData = JSON.stringify({ clientId: 'test-id', clientSecret: 'test-secret' });
      vi.mocked(localStorage.getItem).mockReturnValue(btoa(clientData));

      await discoverService.injectMPToken();

      // Should proceed with token registration since cookie is not active
      expect(lambdaClient.market.registerM2MToken.query).toHaveBeenCalled();
    });
  });
});
