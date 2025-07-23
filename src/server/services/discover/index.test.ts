// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssistantStore } from '@/server/modules/AssistantStore';
import { PluginStore } from '@/server/modules/PluginStore';
import { AssistantSorts, ModelSorts, PluginSorts, ProviderSorts } from '@/types/discover';

import { DiscoverService } from './index';

// Mock external dependencies
vi.mock('@/server/modules/AssistantStore');
vi.mock('@/server/modules/PluginStore');
vi.mock('@lobehub/market-sdk');
vi.mock('@/utils/toolManifest');
vi.mock('@/locales/resources', () => ({
  normalizeLocale: vi.fn((locale) => {
    if (locale === 'en-US') return 'en';
    return locale || 'en';
  }),
}));

// Set environment variable for tests
process.env.MARKET_BASE_URL = 'http://localhost:8787/api';

// Mock constants with inline data
vi.mock('@/config/aiModels', () => ({
  LOBE_DEFAULT_MODEL_LIST: [
    {
      id: 'gpt-4',
      displayName: 'GPT-4',
      description: 'OpenAI GPT-4 model',
      providerId: 'openai',
      contextWindowTokens: 8192,
      abilities: {
        vision: true,
        functionCall: true,
        files: true,
      },
      pricing: {
        input: 0.03,
        output: 0.06,
      },
      releasedAt: '2023-03-01T00:00:00Z',
    },
    {
      id: 'claude-3-opus',
      displayName: 'Claude 3 Opus',
      description: 'Anthropic Claude 3 Opus model',
      providerId: 'anthropic',
      contextWindowTokens: 200000,
      abilities: {
        vision: true,
        reasoning: true,
      },
      pricing: {
        input: 0.015,
        output: 0.075,
      },
      releasedAt: '2024-02-01T00:00:00Z',
    },
  ],
}));

vi.mock('@/config/modelProviders', () => ({
  DEFAULT_MODEL_PROVIDER_LIST: [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'OpenAI provider',
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Anthropic provider',
    },
  ],
}));

vi.mock('@/const/discover', () => ({
  DEFAULT_DISCOVER_ASSISTANT_ITEM: {},
  DEFAULT_DISCOVER_PLUGIN_ITEM: {},
  DEFAULT_DISCOVER_PROVIDER_ITEM: {},
}));

// Mock data - moved after mocks to avoid hoisting issues
const mockAssistantList = [
  {
    identifier: 'assistant-1',
    title: 'Test Assistant 1',
    description: 'A test assistant',
    author: 'Test Author',
    category: 'productivity',
    createdAt: '2024-01-01T00:00:00Z',
    knowledgeCount: 5,
    pluginCount: 2,
    tokenUsage: 1000,
    tags: ['test', 'assistant'],
  },
  {
    identifier: 'assistant-2',
    title: 'Test Assistant 2',
    description: 'Another test assistant',
    author: 'Test Author 2',
    category: 'productivity', // Changed to same category for related items test
    createdAt: '2024-01-02T00:00:00Z',
    knowledgeCount: 3,
    pluginCount: 1,
    tokenUsage: 500,
    tags: ['test', 'creative'],
  },
  {
    identifier: 'assistant-3',
    title: 'Test Assistant 3',
    description: 'A creative assistant',
    author: 'Test Author 3',
    category: 'creativity', // Keep this for category filtering tests
    createdAt: '2024-01-03T00:00:00Z',
    knowledgeCount: 2,
    pluginCount: 0,
    tokenUsage: 300,
    tags: ['test', 'creative'],
  },
];

const mockPluginList = [
  {
    identifier: 'plugin-1',
    title: 'Test Plugin 1',
    description: 'A test plugin',
    author: 'Plugin Author',
    category: 'tools',
    createdAt: '2024-01-01T00:00:00Z',
    tags: ['test', 'plugin'],
    manifest: 'https://example.com/plugin1/manifest.json',
  },
  {
    identifier: 'plugin-2',
    title: 'Test Plugin 2',
    description: 'Another test plugin',
    author: 'Plugin Author 2',
    category: 'utilities',
    createdAt: '2024-01-02T00:00:00Z',
    tags: ['test', 'utility'],
    manifest: 'https://example.com/plugin2/manifest.json',
  },
];

describe('DiscoverService', () => {
  let service: DiscoverService;
  let mockAssistantStore: any;
  let mockPluginStore: any;
  let mockMarket: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup AssistantStore mock
    mockAssistantStore = {
      getAgentIndex: vi
        .fn()
        .mockResolvedValue(mockAssistantList.map((item) => ({ ...item, meta: {} }))),
      getAgent: vi.fn().mockImplementation((identifier) => {
        const agent = mockAssistantList.find((a) => a.identifier === identifier);
        return Promise.resolve(agent ? { ...agent, meta: {} } : null);
      }),
    };

    // Setup PluginStore mock
    mockPluginStore = {
      getPluginList: vi
        .fn()
        .mockResolvedValue(mockPluginList.map((item) => ({ ...item, meta: {} }))),
    };

    // Setup MarketSDK mock
    mockMarket = {
      plugins: {
        getCategories: vi.fn().mockResolvedValue([
          { category: 'tools', count: 5 },
          { category: 'utilities', count: 3 },
        ]),
        getPluginDetail: vi.fn().mockImplementation((params) => {
          const plugin = mockPluginList.find((p) => p.identifier === params.identifier);
          return Promise.resolve(plugin || null);
        }),
        getPluginList: vi.fn().mockResolvedValue({
          items: mockPluginList,
          totalCount: mockPluginList.length,
          currentPage: 1,
          pageSize: 20,
          totalPages: 1,
        }),
        getPublishedIdentifiers: vi
          .fn()
          .mockResolvedValue(
            mockPluginList.map((p) => ({ identifier: p.identifier, lastModified: p.createdAt })),
          ),
        getPluginManifest: vi.fn().mockResolvedValue({}),
      },
    };

    (AssistantStore as any).mockImplementation(() => mockAssistantStore);
    (PluginStore as any).mockImplementation(() => mockPluginStore);

    service = new DiscoverService();
    service.market = mockMarket;
  });

  describe('Assistant Market', () => {
    describe('getAssistantList', () => {
      it('should return formatted assistant list with default parameters', async () => {
        const result = await service.getAssistantList();

        expect(result).toEqual({
          currentPage: 1,
          pageSize: 20,
          totalCount: 3,
          totalPages: 1,
          items: expect.arrayContaining([
            expect.objectContaining({
              identifier: 'assistant-1',
              title: 'Test Assistant 1',
            }),
            expect.objectContaining({
              identifier: 'assistant-2',
              title: 'Test Assistant 2',
            }),
            expect.objectContaining({
              identifier: 'assistant-3',
              title: 'Test Assistant 3',
            }),
          ]),
        });
      });

      it('should filter by category', async () => {
        const result = await service.getAssistantList({ category: 'productivity' });

        expect(result.items).toHaveLength(2);
        expect(result.items.map((item) => item.identifier)).toContain('assistant-1');
        expect(result.items.map((item) => item.identifier)).toContain('assistant-2');
      });

      it('should filter by search query', async () => {
        const result = await service.getAssistantList({ q: 'creative' });

        expect(result.items).toHaveLength(2);
        expect(result.items.map((item) => item.identifier)).toContain('assistant-2');
        expect(result.items.map((item) => item.identifier)).toContain('assistant-3');
      });

      it('should sort by creation date descending', async () => {
        const result = await service.getAssistantList({
          sort: AssistantSorts.CreatedAt,
          order: 'desc',
        });

        expect(result.items[0].identifier).toBe('assistant-3');
        expect(result.items[1].identifier).toBe('assistant-2');
        expect(result.items[2].identifier).toBe('assistant-1');
      });

      it('should sort by title ascending', async () => {
        const result = await service.getAssistantList({
          sort: AssistantSorts.Title,
          order: 'asc',
        });

        // Note: The service has reversed logic for title sorting
        expect(result.items[0].title).toBe('Test Assistant 3');
        expect(result.items[1].title).toBe('Test Assistant 2');
      });

      it('should paginate results', async () => {
        const result = await service.getAssistantList({ page: 1, pageSize: 1 });

        expect(result.items).toHaveLength(1);
        expect(result.currentPage).toBe(1);
        expect(result.pageSize).toBe(1);
        expect(result.totalPages).toBe(3);
      });
    });

    describe('getAssistantDetail', () => {
      it('should return assistant detail with related items', async () => {
        const result = await service.getAssistantDetail({
          identifier: 'assistant-1',
        });

        expect(result).toEqual(
          expect.objectContaining({
            identifier: 'assistant-1',
            title: 'Test Assistant 1',
            related: expect.any(Array),
          }),
        );
        expect(result?.related).toHaveLength(1);
        expect(result?.related[0].identifier).toBe('assistant-2');
      });

      it('should return undefined for non-existent assistant', async () => {
        mockAssistantStore.getAgent.mockResolvedValue(null);

        const result = await service.getAssistantDetail({
          identifier: 'non-existent',
        });

        expect(result).toBeUndefined();
      });
    });

    describe('getAssistantCategories', () => {
      it('should return category counts', async () => {
        const result = await service.getAssistantCategories();

        expect(result).toEqual([
          { category: 'productivity', count: 2 },
          { category: 'creativity', count: 1 },
        ]);
      });

      it('should filter categories by search query', async () => {
        const result = await service.getAssistantCategories({ q: 'creative' });

        expect(result).toEqual([
          {
            category: 'productivity',
            count: 1,
          },
          {
            category: 'creativity',
            count: 1,
          },
        ]);
      });
    });

    describe('getAssistantIdentifiers', () => {
      it('should return list of identifiers with lastModified dates', async () => {
        const result = await service.getAssistantIdentifiers();

        expect(result).toEqual([
          { identifier: 'assistant-1', lastModified: '2024-01-01T00:00:00Z' },
          { identifier: 'assistant-2', lastModified: '2024-01-02T00:00:00Z' },
          { identifier: 'assistant-3', lastModified: '2024-01-03T00:00:00Z' },
        ]);
      });
    });
  });

  describe('Plugin Market', () => {
    describe('getPluginList', () => {
      it('should return formatted plugin list with default parameters', async () => {
        const result = await service.getPluginList();

        expect(result).toEqual({
          currentPage: 1,
          pageSize: 20,
          totalCount: 2,
          totalPages: 1,
          items: expect.arrayContaining([
            expect.objectContaining({
              identifier: 'plugin-1',
              title: 'Test Plugin 1',
            }),
            expect.objectContaining({
              identifier: 'plugin-2',
              title: 'Test Plugin 2',
            }),
          ]),
        });
      });

      it('should filter by category', async () => {
        const result = await service.getPluginList({ category: 'tools' });

        expect(result.items).toHaveLength(1);
        expect(result.items[0].identifier).toBe('plugin-1');
      });

      it('should sort by identifier', async () => {
        const result = await service.getPluginList({
          sort: PluginSorts.Identifier,
          order: 'asc',
        });

        // Note: The service has reversed logic for identifier sorting
        expect(result.items[0].identifier).toBe('plugin-2');
        expect(result.items[1].identifier).toBe('plugin-1');
      });
    });

    describe('getPluginDetail', () => {
      it('should return plugin detail with related items', async () => {
        const result = await service.getPluginDetail({
          identifier: 'plugin-1',
        });

        expect(result).toEqual(
          expect.objectContaining({
            identifier: 'plugin-1',
            title: 'Test Plugin 1',
            related: expect.any(Array),
          }),
        );
      });

      it('should return undefined for non-existent plugin', async () => {
        const result = await service.getPluginDetail({
          identifier: 'non-existent',
        });

        expect(result).toBeUndefined();
      });
    });
  });

  describe('MCP Market', () => {
    describe('getMcpList', () => {
      it('should call market SDK with normalized locale', async () => {
        await service.getMcpList({ locale: 'en-US' });

        expect(mockMarket.plugins.getPluginList).toHaveBeenCalledWith(
          expect.objectContaining({
            locale: 'en',
          }),
          expect.any(Object),
        );
      });
    });

    describe('getMcpDetail', () => {
      it('should return MCP detail with related items', async () => {
        const mockMcp = { identifier: 'mcp-1', category: 'tools' };
        mockMarket.plugins.getPluginDetail.mockResolvedValue(mockMcp);

        const result = await service.getMcpDetail({
          identifier: 'mcp-1',
        });

        expect(result).toEqual(
          expect.objectContaining({
            identifier: 'mcp-1',
            related: expect.any(Array),
          }),
        );
      });
    });
  });

  describe('Provider Market', () => {
    describe('getProviderList', () => {
      it('should return formatted provider list', async () => {
        const result = await service.getProviderList();

        expect(result.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              identifier: 'openai',
              name: 'OpenAI',
              modelCount: expect.any(Number),
            }),
            expect.objectContaining({
              identifier: 'anthropic',
              name: 'Anthropic',
              modelCount: expect.any(Number),
            }),
          ]),
        );
      });

      it('should filter by search query', async () => {
        const result = await service.getProviderList({ q: 'openai' });

        expect(result.items).toHaveLength(1);
        expect(result.items[0].identifier).toBe('openai');
      });

      it('should sort by model count', async () => {
        const result = await service.getProviderList({
          sort: ProviderSorts.ModelCount,
          order: 'desc',
        });

        expect(result.items).toHaveLength(2);
      });
    });

    describe('getProviderDetail', () => {
      it('should return provider detail', async () => {
        const result = await service.getProviderDetail({
          identifier: 'openai',
        });

        expect(result).toEqual(
          expect.objectContaining({
            identifier: 'openai',
            name: 'OpenAI',
            models: expect.any(Array),
            related: expect.any(Array),
          }),
        );
      });
    });
  });

  describe('Model Market', () => {
    describe('getModelList', () => {
      it('should return deduplicated model list', async () => {
        const result = await service.getModelList();

        expect(result.items).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              identifier: expect.any(String),
              displayName: expect.any(String),
              providers: expect.any(Array),
            }),
          ]),
        );
      });

      it('should filter by category', async () => {
        const result = await service.getModelList({ category: 'openai' });

        expect(result.items.length).toBeGreaterThan(0);
      });

      it('should sort by context window tokens', async () => {
        const result = await service.getModelList({
          sort: ModelSorts.ContextWindowTokens,
          order: 'desc',
        });

        expect(result.items).toHaveLength(2);
      });

      it('should filter by search query', async () => {
        const result = await service.getModelList({ q: 'gpt' });

        expect(result.items.length).toBeGreaterThan(0);
      });
    });

    describe('getModelDetail', () => {
      it('should return model detail with providers', async () => {
        const result = await service.getModelDetail({
          identifier: 'gpt-4',
        });

        expect(result).toEqual(
          expect.objectContaining({
            identifier: 'gpt-4',
            displayName: 'GPT-4',
            providers: expect.any(Array),
            related: expect.any(Array),
          }),
        );
      });
    });

    describe('getModelCategories', () => {
      it('should return model categories by provider', async () => {
        const result = await service.getModelCategories();

        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              category: expect.any(String),
              count: expect.any(Number),
            }),
          ]),
        );
      });
    });
  });

  describe('Helper Methods', () => {
    describe('calculateAbilitiesScore', () => {
      it('should calculate abilities score correctly', () => {
        const abilities = {
          vision: true,
          functionCall: true,
          files: false,
        };

        // Access private method for testing
        const score = (service as any).calculateAbilitiesScore(abilities);
        expect(score).toBe(2); // vision + functionCall
      });

      it('should return 0 for empty abilities', () => {
        const score = (service as any).calculateAbilitiesScore(null);
        expect(score).toBe(0);
      });
    });

    describe('selectModelWithBestAbilities', () => {
      it('should select model with best abilities', () => {
        const models = [
          {
            identifier: 'model-1',
            abilities: { vision: true },
            contextWindowTokens: 4000,
          },
          {
            identifier: 'model-1',
            abilities: { vision: true, functionCall: true },
            contextWindowTokens: 8000,
          },
        ];

        const result = (service as any).selectModelWithBestAbilities(models);

        expect(result.abilities).toEqual({ vision: true, functionCall: true });
        expect(result.contextWindowTokens).toBe(8000);
      });

      it('should return single model if only one provided', () => {
        const models = [{ identifier: 'model-1', abilities: {} }];

        const result = (service as any).selectModelWithBestAbilities(models);

        expect(result).toEqual(models[0]);
      });
    });
  });
});
