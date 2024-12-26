// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AssistantCategory, PluginCategory } from '@/types/discover';

import { DiscoverService } from './index';

// 模拟 fetch 函数
global.fetch = vi.fn();

describe('DiscoverService', () => {
  let service: DiscoverService;

  beforeEach(() => {
    service = new DiscoverService();
    vi.resetAllMocks();
  });

  describe('Assistants', () => {
    it('should search assistants', async () => {
      const mockAssistants = [
        {
          author: 'John',
          meta: { title: 'Test Assistant', description: 'A test assistant', tags: ['test'] },
        },
        {
          author: 'Jane',
          meta: {
            title: 'Another Assistant',
            description: 'Another test assistant',
            tags: ['demo'],
          },
        },
      ];

      vi.spyOn(service, 'getAssistantList').mockResolvedValue(mockAssistants as any);

      const result = await service.searchAssistant('en-US', 'A test assistant');
      expect(result).toHaveLength(1);
      expect(result[0].author).toBe('John');
    });

    it('should get assistant category', async () => {
      const mockAssistants = [
        { meta: { category: AssistantCategory.General } },
        { meta: { category: AssistantCategory.Academic } },
      ];

      vi.spyOn(service, 'getAssistantList').mockResolvedValue(mockAssistants as any);

      const result = await service.getAssistantCategory('en-US', AssistantCategory.General);
      expect(result).toHaveLength(1);
      expect(result[0].meta.category).toBe(AssistantCategory.General);
    });

    it('should get assistant list', async () => {
      const mockResponse = { agents: [{ id: 'test-assistant' }] };
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service.getAssistantList('en-US');
      expect(result).toEqual(mockResponse.agents);
    });

    it('should get assistant by id', async () => {
      const mockAssistant = {
        identifier: 'test-assistant',
        meta: { category: AssistantCategory.General },
      };

      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockAssistant),
      } as any);

      vi.spyOn(service, 'getAssistantCategory').mockResolvedValue([]);

      const result = await service.getAssistantById('en-US', 'test-assistant');

      expect(result).toBeDefined();
      expect(result?.identifier).toBe('test-assistant');
    });

    it('should get assistants by ids', async () => {
      const mockAssistants = [{ identifier: 'assistant1' }, { identifier: 'assistant2' }];

      vi.spyOn(service, 'getAssistantById').mockImplementation(
        async (_, id) => mockAssistants.find((a) => a.identifier === id) as any,
      );

      const result = await service.getAssistantByIds('en-US', [
        'assistant1',
        'assistant2',
        'nonexistent',
      ]);
      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('assistant1');
      expect(result[1].identifier).toBe('assistant2');
    });
  });

  describe('Plugins', () => {
    it('should search plugins', async () => {
      const mockPlugins = [
        {
          author: 'John',
          meta: { title: 'Test Plugin', description: 'A test plugin', tags: ['test'] },
        },
        {
          author: 'Jane',
          meta: { title: 'Another Plugin', description: 'Another test plugin', tags: ['demo'] },
        },
      ];

      vi.spyOn(service, 'getPluginList').mockResolvedValue(mockPlugins as any);

      const result = await service.searchPlugin('en-US', 'A test plugin');
      expect(result).toHaveLength(1);
      expect(result[0].author).toBe('John');
    });

    it('should get plugin category', async () => {
      const mockPlugins = [
        { meta: { category: PluginCategory.Tools } },
        { meta: { category: PluginCategory.Social } },
      ];

      vi.spyOn(service, 'getPluginList').mockResolvedValue(mockPlugins as any);

      const result = await service.getPluginCategory('en-US', PluginCategory.Tools);
      expect(result).toHaveLength(1);
      expect(result[0].meta.category).toBe(PluginCategory.Tools);
    });

    it('should get plugin list', async () => {
      const mockResponse = { plugins: [{ id: 'test-plugin' }] };
      vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await service.getPluginList('en-US');
      expect(result).toEqual(mockResponse.plugins);
    });

    it('should get plugin by id', async () => {
      const mockPlugin = {
        identifier: 'test-plugin',
        meta: { category: PluginCategory.Tools },
      };

      vi.spyOn(service, 'getPluginList').mockResolvedValue([mockPlugin] as any);
      vi.spyOn(service, 'getPluginCategory').mockResolvedValue([]);

      const result = await service.getPluginById('en-US', 'test-plugin');

      expect(result).toBeDefined();
      expect(result?.identifier).toBe('test-plugin');
    });

    it('should get plugins by ids', async () => {
      const mockPlugins = [{ identifier: 'plugin1' }, { identifier: 'plugin2' }];

      vi.spyOn(service, 'getPluginById').mockImplementation(
        async (_, id) => mockPlugins.find((p) => p.identifier === id) as any,
      );

      const result = await service.getPluginByIds('en-US', ['plugin1', 'plugin2', 'nonexistent']);
      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('plugin1');
      expect(result[1].identifier).toBe('plugin2');
    });
  });

  describe('Providers', () => {
    it('should get provider list', async () => {
      const result = await service.getProviderList('en-US');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('identifier');
      expect(result[0]).toHaveProperty('meta');
      expect(result[0]).toHaveProperty('models');
    });

    it('should search providers', async () => {
      const mockProviders = [
        { identifier: 'provider1', meta: { title: 'Test Provider' } },
        { identifier: 'provider2', meta: { title: 'Another Provider' } },
      ];

      vi.spyOn(service, 'getProviderList').mockResolvedValue(mockProviders as any);

      const result = await service.searchProvider('en-US', 'test');
      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('provider1');
    });

    it('should get provider by id', async () => {
      const mockProvider = {
        identifier: 'test-provider',
        meta: { title: 'Test Provider' },
        models: ['model1', 'model2'],
      };

      vi.spyOn(service, 'getProviderList').mockResolvedValue([mockProvider] as any);

      const result = await service.getProviderById('en-US', 'test-provider');

      expect(result).toBeDefined();
      expect(result?.identifier).toBe('test-provider');
    });

    it('should get providers by ids', async () => {
      const mockProviders = [{ identifier: 'provider1' }, { identifier: 'provider2' }];

      vi.spyOn(service, 'getProviderById').mockImplementation(
        async (_, id) => mockProviders.find((p) => p.identifier === id) as any,
      );

      const result = await service.getProviderByIds('en-US', [
        'provider1',
        'provider2',
        'nonexistent',
      ]);
      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('provider1');
      expect(result[1].identifier).toBe('provider2');
    });
  });

  describe('Models', () => {
    it('should get model list', async () => {
      const result = await service.getModelList('en-US');
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('identifier');
      expect(result[0]).toHaveProperty('meta');
      expect(result[0]).toHaveProperty('providers');
    });

    it('should search models', async () => {
      const mockModels = [
        {
          identifier: 'model1',
          meta: { title: 'Test Model', description: 'A test model' },
          providers: ['provider1'],
        },
        {
          identifier: 'model2',
          meta: { title: 'Another Model', description: 'Another test model' },
          providers: ['provider2'],
        },
      ];

      vi.spyOn(service as any, '_getModelList').mockResolvedValue(mockModels);

      const result = await service.searchModel('en-US', 'A test model');
      expect(result).toHaveLength(1);
      expect(result[0].identifier).toBe('model1');
    });

    it('should get model category', async () => {
      const mockModels = [{ meta: { category: 'category1' } }, { meta: { category: 'category2' } }];

      vi.spyOn(service as any, '_getModelList').mockResolvedValue(mockModels);

      const result = await service.getModelCategory('en-US', 'category1');
      expect(result).toHaveLength(1);
      expect(result[0].meta.category).toBe('category1');
    });

    it('should get model by id', async () => {
      const mockModel = {
        identifier: 'test-model',
        meta: { category: 'test-category' },
        providers: ['provider1'],
      };

      vi.spyOn(service, 'getModelList').mockResolvedValue([mockModel] as any);
      vi.spyOn(service, 'getModelCategory').mockResolvedValue([]);

      const result = await service.getModelById('en-US', 'test-model');

      expect(result).toBeDefined();
      expect(result?.identifier).toBe('test-model');
    });

    it('should get models by ids', async () => {
      const mockModels = [{ identifier: 'model1' }, { identifier: 'model2' }];

      vi.spyOn(service, 'getModelById').mockImplementation(
        async (_, id) => mockModels.find((m) => m.identifier === id) as any,
      );

      const result = await service.getModelByIds('en-US', ['model1', 'model2', 'nonexistent']);
      expect(result).toHaveLength(2);
      expect(result[0].identifier).toBe('model1');
      expect(result[1].identifier).toBe('model2');
    });
  });
});
