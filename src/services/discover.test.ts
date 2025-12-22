import { CategoryItem, PluginManifest } from '@lobehub/market-sdk';
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
      reportCall: {
        mutate: vi.fn(),
      },
      reportMcpInstallResult: {
        mutate: vi.fn(),
      },
    },
  },
}));

vi.mock('@/store/global/helpers', () => ({
  globalHelpers: {
    getCurrentLanguage: vi.fn(() => 'en-US'),
  },
}));

vi.mock('@/store/user', () => ({
  useUserStore: {
    getState: vi.fn(() => ({
      preference: {
        telemetry: true,
      },
    })),
  },
}));

vi.mock('@/store/user/selectors', () => ({
  preferenceSelectors: {
    userAllowTrace: vi.fn(() => true),
  },
}));

vi.mock('@/utils/object', () => ({
  cleanObject: vi.fn((obj) => obj),
}));

describe('DiscoverService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Reset localStorage mock
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    // Mock document.cookie for getTokenStatusFromCookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  describe('Assistant Market', () => {
    describe('getAssistantCategories', () => {
      it('should fetch assistant categories with locale', async () => {
        const mockCategories = [
          { name: 'Category 1', slug: 'category-1' },
          { name: 'Category 2', slug: 'category-2' },
        ] as any;

        vi.mocked(lambdaClient.market.getAssistantCategories.query).mockResolvedValue(
          mockCategories,
        );

        const result = await discoverService.getAssistantCategories();

        expect(result).toEqual(mockCategories);
        expect(lambdaClient.market.getAssistantCategories.query).toHaveBeenCalledWith({
          locale: 'en-US',
          source: undefined,
        });
      });

      it('should fetch assistant categories with custom source', async () => {
        const mockCategories: CategoryItem[] = [];

        vi.mocked(lambdaClient.market.getAssistantCategories.query).mockResolvedValue(
          mockCategories,
        );

        await discoverService.getAssistantCategories({ source: 'legacy' });

        expect(lambdaClient.market.getAssistantCategories.query).toHaveBeenCalledWith({
          locale: 'en-US',
          source: 'legacy',
        });
      });

      it('should fetch assistant categories with additional params', async () => {
        const mockCategories: CategoryItem[] = [];

        vi.mocked(lambdaClient.market.getAssistantCategories.query).mockResolvedValue(
          mockCategories,
        );

        await discoverService.getAssistantCategories({ source: 'new' });

        expect(lambdaClient.market.getAssistantCategories.query).toHaveBeenCalledWith({
          locale: 'en-US',
          source: 'new',
        });
      });
    });

    describe('getAssistantDetail', () => {
      it('should fetch assistant detail with identifier', async () => {
        const mockDetail = {
          identifier: 'test-assistant',
          meta: { title: 'Test Assistant', description: 'Test' },
        } as any;

        vi.mocked(lambdaClient.market.getAssistantDetail.query).mockResolvedValue(mockDetail);

        const result = await discoverService.getAssistantDetail({ identifier: 'test-assistant' });

        expect(result).toEqual(mockDetail);
        expect(lambdaClient.market.getAssistantDetail.query).toHaveBeenCalledWith({
          identifier: 'test-assistant',
          locale: 'en-US',
          source: undefined,
          version: undefined,
        });
      });

      it('should fetch assistant detail with custom locale and version', async () => {
        const mockDetail = {
          identifier: 'test-assistant',
          meta: { title: 'Test Assistant', description: 'Test' },
        } as any;

        vi.mocked(lambdaClient.market.getAssistantDetail.query).mockResolvedValue(mockDetail);

        await discoverService.getAssistantDetail({
          identifier: 'test-assistant',
          locale: 'zh-CN',
          version: '1.0.0',
        });

        expect(lambdaClient.market.getAssistantDetail.query).toHaveBeenCalledWith({
          identifier: 'test-assistant',
          locale: 'en-US', // Uses globalHelpers.getCurrentLanguage()
          source: undefined,
          version: '1.0.0',
        });
      });
    });

    describe('getAssistantIdentifiers', () => {
      it('should fetch assistant identifiers', async () => {
        const mockIdentifiers = [
          { identifier: 'id1', lastModified: '2024-01-01' },
          { identifier: 'id2', lastModified: '2024-01-01' },
        ];

        vi.mocked(lambdaClient.market.getAssistantIdentifiers.query).mockResolvedValue(
          mockIdentifiers,
        );

        const result = await discoverService.getAssistantIdentifiers();

        expect(result).toEqual(mockIdentifiers);
        expect(lambdaClient.market.getAssistantIdentifiers.query).toHaveBeenCalledWith({});
      });

      it('should fetch assistant identifiers with source', async () => {
        const mockIdentifiers = [{ identifier: 'id1', lastModified: '2024-01-01' }];

        vi.mocked(lambdaClient.market.getAssistantIdentifiers.query).mockResolvedValue(
          mockIdentifiers,
        );

        const result = await discoverService.getAssistantIdentifiers({ source: 'new' });

        expect(result).toEqual(mockIdentifiers);
        expect(lambdaClient.market.getAssistantIdentifiers.query).toHaveBeenCalledWith({
          source: 'new',
        });
      });
    });

    describe('getAssistantList', () => {
      it('should fetch assistant list with default pagination', async () => {
        const mockList = { items: [], total: 0 } as any;

        vi.mocked(lambdaClient.market.getAssistantList.query).mockResolvedValue(mockList);

        const result = await discoverService.getAssistantList();

        expect(result).toEqual(mockList);
        expect(lambdaClient.market.getAssistantList.query).toHaveBeenCalledWith(
          {
            locale: 'en-US',
            page: 1,
            pageSize: 20,
          },
          { context: { showNotification: false } },
        );
      });

      it('should fetch assistant list with custom pagination', async () => {
        const mockList = { items: [], total: 0 } as any;

        vi.mocked(lambdaClient.market.getAssistantList.query).mockResolvedValue(mockList);

        await discoverService.getAssistantList({ page: 3, pageSize: 50 });

        expect(lambdaClient.market.getAssistantList.query).toHaveBeenCalledWith(
          {
            locale: 'en-US',
            page: 3,
            pageSize: 50,
          },
          { context: { showNotification: false } },
        );
      });

      it('should fetch assistant list with filters', async () => {
        const mockList = { items: [], total: 0 } as any;

        vi.mocked(lambdaClient.market.getAssistantList.query).mockResolvedValue(mockList);

        await discoverService.getAssistantList({
          category: 'productivity',
          page: 1,
          pageSize: 20,
          q: 'test',
        });

        expect(lambdaClient.market.getAssistantList.query).toHaveBeenCalledWith(
          {
            category: 'productivity',
            locale: 'en-US',
            page: 1,
            pageSize: 20,
            q: 'test',
          },
          { context: { showNotification: false } },
        );
      });
    });
  });

  describe('MCP Market', () => {
    describe('getMcpCategories', () => {
      it('should fetch MCP categories with locale', async () => {
        const mockCategories = [{ name: 'MCP Category', slug: 'mcp-category' }] as any;

        vi.mocked(lambdaClient.market.getMcpCategories.query).mockResolvedValue(mockCategories);

        const result = await discoverService.getMcpCategories();

        expect(result).toEqual(mockCategories);
        expect(lambdaClient.market.getMcpCategories.query).toHaveBeenCalledWith({
          locale: 'en-US',
        });
      });
    });

    describe('getMcpDetail', () => {
      it('should fetch MCP detail with identifier', async () => {
        const mockDetail = {
          identifier: 'test-mcp',
          meta: { title: 'Test MCP', description: 'Test' },
        } as any;

        vi.mocked(lambdaClient.market.getMcpDetail.query).mockResolvedValue(mockDetail);

        const result = await discoverService.getMcpDetail({ identifier: 'test-mcp' });

        expect(result).toEqual(mockDetail);
        expect(lambdaClient.market.getMcpDetail.query).toHaveBeenCalledWith({
          identifier: 'test-mcp',
          locale: 'en-US',
          version: undefined,
        });
      });
    });

    describe('getMcpList', () => {
      it('should fetch MCP list with default pagination', async () => {
        const mockList = { items: [], total: 0 } as any;

        vi.mocked(lambdaClient.market.getMcpList.query).mockResolvedValue(mockList);

        const result = await discoverService.getMcpList();

        expect(result).toEqual(mockList);
        expect(lambdaClient.market.getMcpList.query).toHaveBeenCalledWith({
          locale: 'en-US',
          page: 1,
          pageSize: 20,
        });
      });

      it('should fetch MCP list with custom pagination', async () => {
        const mockList = { items: [], total: 0 } as any;

        vi.mocked(lambdaClient.market.getMcpList.query).mockResolvedValue(mockList);

        await discoverService.getMcpList({ page: 2, pageSize: 30 });

        expect(lambdaClient.market.getMcpList.query).toHaveBeenCalledWith({
          locale: 'en-US',
          page: 2,
          pageSize: 30,
        });
      });
    });

    describe('getMCPPluginList', () => {
      it('should inject MP token before fetching MCP plugin list', async () => {
        // Mock localStorage for token injection
        const mockClientInfo = { clientId: 'test-id', clientSecret: 'test-secret' } as any;
        const encodedData = btoa(JSON.stringify(mockClientInfo));
        localStorage.setItem('_mpc', encodedData);

        // Mock cookie to indicate active token
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        const mockList = { items: [], total: 0 } as any;
        vi.mocked(lambdaClient.market.getMcpList.query).mockResolvedValue(mockList);

        await discoverService.getMCPPluginList({ page: 1, pageSize: 21 });

        expect(lambdaClient.market.getMcpList.query).toHaveBeenCalledWith({
          locale: 'en-US',
          page: 1,
          pageSize: 21,
        });
      });
    });

    describe('getMcpManifest', () => {
      it('should fetch MCP manifest with identifier', async () => {
        const mockManifest: PluginManifest = {
          api: [],
          identifier: 'test-mcp',
          meta: { title: 'Test MCP' },
          version: '1.0.0',
        } as any;

        vi.mocked(lambdaClient.market.getMcpManifest.query).mockResolvedValue(mockManifest);

        const result = await discoverService.getMcpManifest({ identifier: 'test-mcp' });

        expect(result).toEqual(mockManifest);
        expect(lambdaClient.market.getMcpManifest.query).toHaveBeenCalledWith({
          identifier: 'test-mcp',
          locale: 'en-US',
          version: undefined,
        });
      });
    });

    describe('getMCPPluginManifest', () => {
      it('should fetch MCP plugin manifest with identifier', async () => {
        const mockManifest: PluginManifest = {
          api: [],
          identifier: 'test-plugin',
          meta: { title: 'Test Plugin' },
          version: '1.0.0',
        } as any;

        vi.mocked(lambdaClient.market.getMcpManifest.query).mockResolvedValue(mockManifest);

        const result = await discoverService.getMCPPluginManifest('test-plugin');

        expect(result).toEqual(mockManifest);
        expect(lambdaClient.market.getMcpManifest.query).toHaveBeenCalledWith({
          identifier: 'test-plugin',
          install: undefined,
          locale: 'en-US',
        });
      });

      it('should fetch MCP plugin manifest with install option', async () => {
        const mockManifest: PluginManifest = {
          api: [],
          identifier: 'test-plugin',
          meta: { title: 'Test Plugin' },
          version: '1.0.0',
        } as any;

        vi.mocked(lambdaClient.market.getMcpManifest.query).mockResolvedValue(mockManifest);

        await discoverService.getMCPPluginManifest('test-plugin', { install: true });

        expect(lambdaClient.market.getMcpManifest.query).toHaveBeenCalledWith({
          identifier: 'test-plugin',
          install: true,
          locale: 'en-US',
        });
      });
    });
  });

  describe('Models', () => {
    describe('getModelCategories', () => {
      it('should fetch model categories', async () => {
        const mockCategories = [{ name: 'Model Category', slug: 'model-category' }] as any;

        vi.mocked(lambdaClient.market.getModelCategories.query).mockResolvedValue(mockCategories);

        const result = await discoverService.getModelCategories();

        expect(result).toEqual(mockCategories);
        expect(lambdaClient.market.getModelCategories.query).toHaveBeenCalledWith({});
      });
    });

    describe('getModelDetail', () => {
      it('should fetch model detail with identifier', async () => {
        const mockDetail = {
          identifier: 'test-model',
          meta: { title: 'Test Model', description: 'Test' },
        } as any;

        vi.mocked(lambdaClient.market.getModelDetail.query).mockResolvedValue(mockDetail);

        const result = await discoverService.getModelDetail({ identifier: 'test-model' });

        expect(result).toEqual(mockDetail);
        expect(lambdaClient.market.getModelDetail.query).toHaveBeenCalledWith({
          identifier: 'test-model',
          locale: 'en-US',
        });
      });
    });

    describe('getModelIdentifiers', () => {
      it('should fetch model identifiers', async () => {
        const mockIdentifiers = [
          { identifier: 'model1', lastModified: '2024-01-01' },
          { identifier: 'model2', lastModified: '2024-01-01' },
        ];

        vi.mocked(lambdaClient.market.getModelIdentifiers.query).mockResolvedValue(mockIdentifiers);

        const result = await discoverService.getModelIdentifiers();

        expect(result).toEqual(mockIdentifiers);
        expect(lambdaClient.market.getModelIdentifiers.query).toHaveBeenCalled();
      });
    });

    describe('getModelList', () => {
      it('should fetch model list with default pagination', async () => {
        const mockList = { items: [], total: 0 } as any;

        vi.mocked(lambdaClient.market.getModelList.query).mockResolvedValue(mockList);

        const result = await discoverService.getModelList();

        expect(result).toEqual(mockList);
        expect(lambdaClient.market.getModelList.query).toHaveBeenCalledWith({
          locale: 'en-US',
          page: 1,
          pageSize: 20,
        });
      });
    });
  });

  describe('Plugin Market', () => {
    describe('getPluginCategories', () => {
      it('should fetch plugin categories with locale', async () => {
        const mockCategories = [{ name: 'Plugin Category', slug: 'plugin-category' }] as any;

        vi.mocked(lambdaClient.market.getPluginCategories.query).mockResolvedValue(mockCategories);

        const result = await discoverService.getPluginCategories();

        expect(result).toEqual(mockCategories);
        expect(lambdaClient.market.getPluginCategories.query).toHaveBeenCalledWith({
          locale: 'en-US',
        });
      });
    });

    describe('getPluginDetail', () => {
      it('should fetch plugin detail with identifier', async () => {
        const mockDetail = {
          identifier: 'test-plugin',
          meta: { title: 'Test Plugin', description: 'Test' },
        } as any;

        vi.mocked(lambdaClient.market.getPluginDetail.query).mockResolvedValue(mockDetail);

        const result = await discoverService.getPluginDetail({ identifier: 'test-plugin' });

        expect(result).toEqual(mockDetail);
        expect(lambdaClient.market.getPluginDetail.query).toHaveBeenCalledWith({
          identifier: 'test-plugin',
          locale: 'en-US',
          withManifest: undefined,
        });
      });

      it('should fetch plugin detail with manifest', async () => {
        const mockDetail = {
          identifier: 'test-plugin',
          manifest: { api: [], identifier: 'test-plugin', version: '1.0.0' },
          meta: { title: 'Test Plugin', description: 'Test' },
        } as any;

        vi.mocked(lambdaClient.market.getPluginDetail.query).mockResolvedValue(mockDetail);

        await discoverService.getPluginDetail({ identifier: 'test-plugin', withManifest: true });

        expect(lambdaClient.market.getPluginDetail.query).toHaveBeenCalledWith({
          identifier: 'test-plugin',
          locale: 'en-US',
          withManifest: true,
        });
      });
    });

    describe('getPluginIdentifiers', () => {
      it('should fetch plugin identifiers', async () => {
        const mockIdentifiers = [
          { identifier: 'plugin1', lastModified: '2024-01-01' },
          { identifier: 'plugin2', lastModified: '2024-01-01' },
        ];

        vi.mocked(lambdaClient.market.getPluginIdentifiers.query).mockResolvedValue(
          mockIdentifiers,
        );

        const result = await discoverService.getPluginIdentifiers();

        expect(result).toEqual(mockIdentifiers);
        expect(lambdaClient.market.getPluginIdentifiers.query).toHaveBeenCalled();
      });
    });

    describe('getPluginList', () => {
      it('should fetch plugin list with default pagination', async () => {
        const mockList = { items: [], total: 0 } as any;

        vi.mocked(lambdaClient.market.getPluginList.query).mockResolvedValue(mockList);

        const result = await discoverService.getPluginList();

        expect(result).toEqual(mockList);
        expect(lambdaClient.market.getPluginList.query).toHaveBeenCalledWith({
          locale: 'en-US',
          page: 1,
          pageSize: 20,
        });
      });
    });
  });

  describe('Providers', () => {
    describe('getProviderDetail', () => {
      it('should fetch provider detail with identifier', async () => {
        const mockDetail = {
          identifier: 'test-provider',
          meta: { title: 'Test Provider', description: 'Test' },
        } as any;

        vi.mocked(lambdaClient.market.getProviderDetail.query).mockResolvedValue(mockDetail);

        const result = await discoverService.getProviderDetail({ identifier: 'test-provider' });

        expect(result).toEqual(mockDetail);
        expect(lambdaClient.market.getProviderDetail.query).toHaveBeenCalledWith({
          identifier: 'test-provider',
          locale: 'en-US',
          withReadme: undefined,
        });
      });

      it('should fetch provider detail with readme', async () => {
        const mockDetail = {
          identifier: 'test-provider',
          meta: { title: 'Test Provider', description: 'Test' },
          readme: '# Provider Readme',
        } as any;

        vi.mocked(lambdaClient.market.getProviderDetail.query).mockResolvedValue(mockDetail);

        await discoverService.getProviderDetail({ identifier: 'test-provider', withReadme: true });

        expect(lambdaClient.market.getProviderDetail.query).toHaveBeenCalledWith({
          identifier: 'test-provider',
          locale: 'en-US',
          withReadme: true,
        });
      });
    });

    describe('getProviderIdentifiers', () => {
      it('should fetch provider identifiers', async () => {
        const mockIdentifiers = [
          { identifier: 'provider1', lastModified: '2024-01-01' },
          { identifier: 'provider2', lastModified: '2024-01-01' },
        ];

        vi.mocked(lambdaClient.market.getProviderIdentifiers.query).mockResolvedValue(
          mockIdentifiers,
        );

        const result = await discoverService.getProviderIdentifiers();

        expect(result).toEqual(mockIdentifiers);
        expect(lambdaClient.market.getProviderIdentifiers.query).toHaveBeenCalled();
      });
    });

    describe('getProviderList', () => {
      it('should fetch provider list with default pagination', async () => {
        const mockList = { items: [], total: 0 } as any;

        vi.mocked(lambdaClient.market.getProviderList.query).mockResolvedValue(mockList);

        const result = await discoverService.getProviderList();

        expect(result).toEqual(mockList);
        expect(lambdaClient.market.getProviderList.query).toHaveBeenCalledWith({
          locale: 'en-US',
          page: 1,
          pageSize: 20,
        });
      });
    });
  });

  describe('Registration and Reporting', () => {
    describe('registerClient', () => {
      it('should register client in marketplace', async () => {
        const mockClientInfo = { clientId: 'new-client-id', clientSecret: 'new-secret' } as any;

        vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
          mockClientInfo,
        );

        const result = await discoverService.registerClient();

        expect(result).toEqual(mockClientInfo);
        expect(lambdaClient.market.registerClientInMarketplace.mutate).toHaveBeenCalledWith({});
      });
    });

    describe('reportMcpInstallResult', () => {
      it('should report MCP installation success when user allows tracing', async () => {
        const mockManifest: PluginManifest = {
          api: [],
          identifier: 'test-mcp',
          meta: { title: 'Test MCP' },
          version: '1.0.0',
        } as any;

        // Mock active token
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
        vi.mocked(lambdaClient.market.reportMcpInstallResult.mutate).mockResolvedValue({} as any);

        await discoverService.reportMcpInstallResult({
          identifier: 'test-mcp',
          manifest: mockManifest,
          success: true,
          version: '1.0.0',
        });

        expect(lambdaClient.market.reportMcpInstallResult.mutate).toHaveBeenCalledWith({
          identifier: 'test-mcp',
          manifest: mockManifest,
          success: true,
          version: '1.0.0',
        });
      });

      it('should report MCP installation failure with error details', async () => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
        vi.mocked(lambdaClient.market.reportMcpInstallResult.mutate).mockResolvedValue({} as any);

        await discoverService.reportMcpInstallResult({
          errorCode: 'INSTALL_FAILED',
          errorMessage: 'Failed to install MCP',
          identifier: 'test-mcp',
          manifest: undefined,
          success: false,
          version: '1.0.0',
        });

        expect(lambdaClient.market.reportMcpInstallResult.mutate).toHaveBeenCalledWith({
          errorCode: 'INSTALL_FAILED',
          errorMessage: 'Failed to install MCP',
          identifier: 'test-mcp',
          manifest: undefined,
          success: false,
          version: '1.0.0',
        });
      });

      it('should not report when user does not allow tracing', async () => {
        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(false);

        await discoverService.reportMcpInstallResult({
          identifier: 'test-mcp',
          manifest: {} as PluginManifest,
          success: true,
          version: '1.0.0',
        });

        expect(lambdaClient.market.reportMcpInstallResult.mutate).not.toHaveBeenCalled();
      });

      it('should handle report errors gracefully', async () => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
        vi.mocked(lambdaClient.market.reportMcpInstallResult.mutate).mockRejectedValue(
          new Error('Report failed'),
        );

        // Should not throw error
        await expect(
          discoverService.reportMcpInstallResult({
            identifier: 'test-mcp',
            manifest: {} as PluginManifest,
            success: true,
            version: '1.0.0',
          }),
        ).resolves.not.toThrow();

        expect(console.warn).toHaveBeenCalledWith(
          'Failed to report MCP installation result:',
          expect.any(Error),
        );
      });
    });

    describe('reportPluginCall', () => {
      it('should report plugin call when user allows tracing', async () => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
        vi.mocked(lambdaClient.market.reportCall.mutate).mockResolvedValue({} as any);

        await discoverService.reportPluginCall({
          callDurationMs: 1000,
          identifier: 'test-plugin',
          isCustomPlugin: false,
          methodName: 'testMethod',
          methodType: 'tool',
          requestSizeBytes: 100,
          responseSizeBytes: 200,
          success: true,
          version: '1.0.0',
        });

        expect(lambdaClient.market.reportCall.mutate).toHaveBeenCalledWith({
          callDurationMs: 1000,
          identifier: 'test-plugin',
          isCustomPlugin: false,
          methodName: 'testMethod',
          methodType: 'tool',
          requestSizeBytes: 100,
          responseSizeBytes: 200,
          success: true,
          version: '1.0.0',
        });
      });

      it('should not report when user does not allow tracing', async () => {
        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(false);

        await discoverService.reportPluginCall({
          callDurationMs: 1000,
          identifier: 'test-plugin',
          isCustomPlugin: false,
          methodName: 'testMethod',
          methodType: 'tool',
          requestSizeBytes: 100,
          responseSizeBytes: 200,
          success: true,
          version: '1.0.0',
        });

        expect(lambdaClient.market.reportCall.mutate).not.toHaveBeenCalled();
      });

      it('should handle report errors gracefully', async () => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        vi.mocked(preferenceSelectors.userAllowTrace).mockReturnValue(true);
        vi.mocked(lambdaClient.market.reportCall.mutate).mockRejectedValue(
          new Error('Report failed'),
        );

        // Should not throw error
        await expect(
          discoverService.reportPluginCall({
            callDurationMs: 1000,
            identifier: 'test-plugin',
            isCustomPlugin: false,
            methodName: 'testMethod',
            methodType: 'tool',
            requestSizeBytes: 100,
            responseSizeBytes: 200,
            success: true,
            version: '1.0.0',
          }),
        ).resolves.not.toThrow();

        expect(console.warn).toHaveBeenCalledWith('Failed to report call:', expect.any(Error));
      });
    });
  });

  describe('Token Management', () => {
    describe('injectMPToken', () => {
      it('should skip injection if localStorage is undefined', async () => {
        const originalLocalStorage = global.localStorage;
        // @ts-expect-error testing undefined localStorage
        delete global.localStorage;

        await discoverService.injectMPToken();

        expect(lambdaClient.market.registerClientInMarketplace.mutate).not.toHaveBeenCalled();

        global.localStorage = originalLocalStorage;
      });

      it('should skip injection if token status is active', async () => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: 'mp_token_status=active',
        });

        await discoverService.injectMPToken();

        expect(lambdaClient.market.registerClientInMarketplace.mutate).not.toHaveBeenCalled();
      });

      it('should register new client if localStorage is empty', async () => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: '',
        });

        const mockClientInfo = { clientId: 'new-client-id', clientSecret: 'new-secret' } as any;
        vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
          mockClientInfo,
        );
        vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({
          success: true,
        });

        await discoverService.injectMPToken();

        expect(lambdaClient.market.registerClientInMarketplace.mutate).toHaveBeenCalled();
        expect(lambdaClient.market.registerM2MToken.query).toHaveBeenCalledWith({
          clientId: 'new-client-id',
          clientSecret: 'new-secret',
        });

        const storedData = localStorage.getItem('_mpc');
        expect(storedData).toBeTruthy();
        const decodedData = JSON.parse(atob(storedData!));
        expect(decodedData).toEqual(mockClientInfo);
      });

      it('should use existing client credentials from localStorage', async () => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: '',
        });

        const mockClientInfo = { clientId: 'existing-id', clientSecret: 'existing-secret' } as any;
        const encodedData = btoa(JSON.stringify(mockClientInfo));
        localStorage.setItem('_mpc', encodedData);

        vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({
          success: true,
        });

        await discoverService.injectMPToken();

        expect(lambdaClient.market.registerClientInMarketplace.mutate).not.toHaveBeenCalled();
        expect(lambdaClient.market.registerM2MToken.query).toHaveBeenCalledWith({
          clientId: 'existing-id',
          clientSecret: 'existing-secret',
        });
      });

      it('should re-register if credentials are invalid', async () => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: '',
        });

        const oldClientInfo = { clientId: 'old-id', clientSecret: 'old-secret' } as any;
        const encodedData = btoa(JSON.stringify(oldClientInfo));
        localStorage.setItem('_mpc', encodedData);

        const newClientInfo = { clientId: 'new-id', clientSecret: 'new-secret' } as any;

        vi.mocked(lambdaClient.market.registerM2MToken.query)
          .mockResolvedValueOnce({ success: false })
          .mockResolvedValueOnce({ success: true });

        vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
          newClientInfo,
        );

        await discoverService.injectMPToken();

        expect(lambdaClient.market.registerClientInMarketplace.mutate).toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalledWith(
          'Token registration failed, client credentials may be invalid. Clearing and retrying...',
        );

        const storedData = localStorage.getItem('_mpc');
        const decodedData = JSON.parse(atob(storedData!));
        expect(decodedData).toEqual(newClientInfo);
      });

      it('should handle decode error and re-register', async () => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: '',
        });

        localStorage.setItem('_mpc', 'invalid-base64-data');

        const newClientInfo = { clientId: 'new-id', clientSecret: 'new-secret' } as any;
        vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
          newClientInfo,
        );
        vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({
          success: true,
        });

        await discoverService.injectMPToken();

        expect(console.error).toHaveBeenCalledWith(
          'Failed to decode client data:',
          expect.any(Error),
        );
        expect(lambdaClient.market.registerClientInMarketplace.mutate).toHaveBeenCalled();
      });

      it('should handle M2M token registration error', async () => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: '',
        });

        const mockClientInfo = { clientId: 'test-id', clientSecret: 'test-secret' } as any;
        vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
          mockClientInfo,
        );
        vi.mocked(lambdaClient.market.registerM2MToken.query).mockRejectedValue(
          new Error('M2M token error'),
        );

        const result = await discoverService.injectMPToken();

        expect(result).toBeNull();
        expect(console.error).toHaveBeenCalledWith(
          'Failed to register M2M token:',
          expect.any(Error),
        );
      });

      it('should not retry more than once', async () => {
        Object.defineProperty(document, 'cookie', {
          writable: true,
          value: '',
        });

        const oldClientInfo = { clientId: 'old-id', clientSecret: 'old-secret' } as any;
        const encodedData = btoa(JSON.stringify(oldClientInfo));
        localStorage.setItem('_mpc', encodedData);

        // Both attempts fail
        vi.mocked(lambdaClient.market.registerM2MToken.query).mockResolvedValue({
          success: false,
        });

        const newClientInfo = { clientId: 'new-id', clientSecret: 'new-secret' } as any;
        vi.mocked(lambdaClient.market.registerClientInMarketplace.mutate).mockResolvedValue(
          newClientInfo,
        );

        await discoverService.injectMPToken();

        // Should only register once (no infinite loop)
        expect(lambdaClient.market.registerClientInMarketplace.mutate).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(
          'Failed to re-register after credential invalidation',
        );
      });
    });
  });
});
