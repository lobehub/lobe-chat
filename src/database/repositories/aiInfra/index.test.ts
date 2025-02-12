import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';

import { AiInfraRepos } from './index';

describe('AiInfraRepos', () => {
  const mockDb = {
    query: vi.fn(),
  };

  const mockUserId = 'test-user-id';
  const mockProviderConfigs = {
    openai: {
      enabled: true,
    },
  };

  const mockAiProviderModel = {
    getAiProviderById: vi.fn(),
    getAiProviderList: vi.fn(),
    getAiProviderRuntimeConfig: vi.fn(),
  };

  const mockAiModelModel = {
    getAllModels: vi.fn(),
    getModelListByProviderId: vi.fn(),
  };

  describe('getAiProviderList', () => {
    it('should merge builtin and user providers correctly', async () => {
      const repo = new AiInfraRepos(mockDb as any, mockUserId, mockProviderConfigs);
      repo.aiProviderModel = mockAiProviderModel as any;

      const mockUserProviders = [
        {
          description: 'Custom OpenAI',
          enabled: true,
          id: 'openai',
          name: 'Custom OpenAI',
          sort: 1,
          source: 'builtin' as const,
        },
      ];

      mockAiProviderModel.getAiProviderList.mockResolvedValue(mockUserProviders);

      const result = await repo.getAiProviderList();

      expect(result[0]).toEqual(
        expect.objectContaining({
          description: 'Custom OpenAI',
          enabled: true,
          id: 'openai',
          name: 'Custom OpenAI',
          sort: 1,
          source: 'builtin',
        }),
      );
    });
  });

  describe('getUserEnabledProviderList', () => {
    it('should return only enabled providers', async () => {
      const repo = new AiInfraRepos(mockDb as any, mockUserId, mockProviderConfigs);
      repo.aiProviderModel = mockAiProviderModel as any;

      const mockProviders = [
        {
          enabled: true,
          id: 'openai',
          logo: 'logo1',
          name: 'OpenAI',
          sort: 1,
          source: 'builtin' as const,
        },
        {
          enabled: false,
          id: 'anthropic',
          logo: 'logo2',
          name: 'Anthropic',
          sort: 2,
          source: 'builtin' as const,
        },
      ];

      vi.spyOn(repo, 'getAiProviderList').mockResolvedValue(mockProviders);

      const result = await repo.getUserEnabledProviderList();

      expect(result).toEqual([
        {
          id: 'openai',
          logo: 'logo1',
          name: 'OpenAI',
          source: 'builtin',
        },
      ]);
    });
  });

  describe('getEnabledModels', () => {
    it('should merge builtin and user models correctly', async () => {
      const repo = new AiInfraRepos(mockDb as any, mockUserId, mockProviderConfigs);
      repo.aiProviderModel = mockAiProviderModel as any;
      (repo as any).aiModelModel = mockAiModelModel;

      const mockProviders = [
        { enabled: true, id: 'openai', name: 'OpenAI', sort: 1, source: 'builtin' as const },
      ];

      const mockAllModels = [
        {
          abilities: { vision: true },
          displayName: 'Custom GPT-4',
          enabled: true,
          id: 'gpt-4',
          providerId: 'openai',
          sort: 1,
          type: 'chat' as const,
        },
      ];

      vi.spyOn(repo, 'getAiProviderList').mockResolvedValue(mockProviders);
      mockAiModelModel.getAllModels.mockResolvedValue(mockAllModels);
      vi.spyOn(repo as any, 'fetchBuiltinModels').mockResolvedValue([
        {
          abilities: {},
          displayName: 'GPT-4',
          enabled: true,
          id: 'gpt-4',
          type: 'chat' as const,
        },
      ]);

      const result = await repo.getEnabledModels();

      expect(result).toContainEqual(
        expect.objectContaining({
          abilities: { vision: true },
          displayName: 'Custom GPT-4',
          enabled: true,
          id: 'gpt-4',
          providerId: 'openai',
          sort: 1,
          type: 'chat',
        }),
      );
    });

    it('should handle case when user model not found', async () => {
      const repo = new AiInfraRepos(mockDb as any, mockUserId, mockProviderConfigs);
      repo.aiProviderModel = mockAiProviderModel as any;
      (repo as any).aiModelModel = mockAiModelModel;

      const mockProviders = [
        { enabled: true, id: 'openai', name: 'OpenAI', sort: 1, source: 'builtin' as const },
      ];

      const mockAllModels: any[] = [];

      vi.spyOn(repo, 'getAiProviderList').mockResolvedValue(mockProviders);
      mockAiModelModel.getAllModels.mockResolvedValue(mockAllModels);
      vi.spyOn(repo as any, 'fetchBuiltinModels').mockResolvedValue([
        {
          abilities: { reasoning: true },
          displayName: 'GPT-4',
          enabled: true,
          id: 'gpt-4',
          type: 'chat' as const,
        },
      ]);

      const result = await repo.getEnabledModels();

      expect(result[0]).toEqual(
        expect.objectContaining({
          abilities: { reasoning: true },
          enabled: true,
          id: 'gpt-4',
          providerId: 'openai',
        }),
      );
    });
  });

  describe('getAiProviderModelList', () => {
    it('should merge default and custom models', async () => {
      const repo = new AiInfraRepos(mockDb as any, mockUserId, mockProviderConfigs);
      (repo as any).aiModelModel = mockAiModelModel;

      const mockCustomModels = [
        {
          displayName: 'Custom GPT-4',
          enabled: true,
          id: 'gpt-4',
          type: 'chat' as const,
        },
      ];

      const mockDefaultModels = [
        {
          displayName: 'GPT-4',
          enabled: false,
          id: 'gpt-4',
          type: 'chat' as const,
        },
      ];

      mockAiModelModel.getModelListByProviderId.mockResolvedValue(mockCustomModels);
      vi.spyOn(repo as any, 'fetchBuiltinModels').mockResolvedValue(mockDefaultModels);

      const result = await repo.getAiProviderModelList('openai');

      expect(result).toContainEqual(
        expect.objectContaining({
          displayName: 'Custom GPT-4',
          enabled: true,
          id: 'gpt-4',
        }),
      );
    });
  });

  describe('getAiProviderRuntimeState', () => {
    it('should return provider runtime state', async () => {
      const repo = new AiInfraRepos(mockDb as any, mockUserId, mockProviderConfigs);
      repo.aiProviderModel = mockAiProviderModel as any;

      const mockRuntimeConfig = {
        openai: {
          apiKey: 'test-key',
        },
      };

      mockAiProviderModel.getAiProviderRuntimeConfig.mockResolvedValue(mockRuntimeConfig);

      vi.spyOn(repo, 'getUserEnabledProviderList').mockResolvedValue([
        { id: 'openai', logo: 'logo1', name: 'OpenAI', source: 'builtin' },
      ]);

      vi.spyOn(repo, 'getEnabledModels').mockResolvedValue([
        {
          abilities: {},
          enabled: true,
          id: 'gpt-4',
          providerId: 'openai',
          type: 'chat',
        },
      ]);

      const result = await repo.getAiProviderRuntimeState();

      expect(result).toEqual({
        enabledAiModels: [
          expect.objectContaining({
            enabled: true,
            id: 'gpt-4',
            providerId: 'openai',
          }),
        ],
        enabledAiProviders: [{ id: 'openai', logo: 'logo1', name: 'OpenAI', source: 'builtin' }],
        runtimeConfig: {
          openai: {
            apiKey: 'test-key',
            enabled: true,
          },
        },
      });
    });
  });

  describe('getAiProviderDetail', () => {
    it('should merge provider configs correctly', async () => {
      const repo = new AiInfraRepos(mockDb as any, mockUserId, mockProviderConfigs);
      repo.aiProviderModel = mockAiProviderModel as any;

      const mockProviderDetail = {
        enabled: true,
        id: 'openai',
        keyVaults: { apiKey: 'test-key' },
        name: 'Custom OpenAI',
        settings: {},
        source: 'builtin' as const,
      };

      mockAiProviderModel.getAiProviderById.mockResolvedValue(mockProviderDetail);

      const result = await repo.getAiProviderDetail('openai');

      expect(result).toEqual({
        enabled: true,
        id: 'openai',
        keyVaults: { apiKey: 'test-key' },
        name: 'Custom OpenAI',
        settings: {},
        source: 'builtin',
      });
    });
  });
});
