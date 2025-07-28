import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { clientDB, initializeDB } from '@/database/client/db';
import { AiProviderModelListItem, EnabledAiModel } from '@/types/aiModel';
import {
  AiProviderDetailItem,
  AiProviderListItem,
  AiProviderRuntimeConfig,
  EnabledProvider,
} from '@/types/aiProvider';

import { AiInfraRepos } from './index';

const userId = 'test-user-id';
const mockProviderConfigs = {
  openai: { enabled: true },
  anthropic: { enabled: false },
};

let repo: AiInfraRepos;

beforeEach(async () => {
  await initializeDB();
  vi.clearAllMocks();

  repo = new AiInfraRepos(clientDB as any, userId, mockProviderConfigs);
});

describe('AiInfraRepos', () => {
  describe('getAiProviderList', () => {
    it('should merge builtin and user providers correctly', async () => {
      const mockUserProviders = [
        { id: 'openai', enabled: true, name: 'Custom OpenAI' },
        { id: 'custom', enabled: true, name: 'Custom Provider' },
      ] as AiProviderListItem[];

      vi.spyOn(repo.aiProviderModel, 'getAiProviderList').mockResolvedValueOnce(mockUserProviders);

      const result = await repo.getAiProviderList();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      // Verify the merge logic
      const openaiProvider = result.find((p) => p.id === 'openai');
      expect(openaiProvider).toMatchObject({ enabled: true, name: 'Custom OpenAI' });
    });

    it('should sort providers according to DEFAULT_MODEL_PROVIDER_LIST order', async () => {
      vi.spyOn(repo.aiProviderModel, 'getAiProviderList').mockResolvedValue([]);

      const result = await repo.getAiProviderList();

      expect(result).toEqual(
        expect.arrayContaining(
          DEFAULT_MODEL_PROVIDER_LIST.map((item) =>
            expect.objectContaining({
              id: item.id,
              source: 'builtin',
            }),
          ),
        ),
      );
    });
  });

  describe('getUserEnabledProviderList', () => {
    it('should return only enabled providers', async () => {
      const mockProviders = [
        { id: 'openai', enabled: true, name: 'OpenAI', sort: 1 },
        { id: 'anthropic', enabled: false, name: 'Anthropic', sort: 2 },
      ] as AiProviderListItem[];

      vi.spyOn(repo, 'getAiProviderList').mockResolvedValue(mockProviders);

      const result = await repo.getUserEnabledProviderList();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'openai',
        name: 'OpenAI',
      });
    });

    it('should return only enabled provider', async () => {
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

      vi.spyOn(repo.aiProviderModel, 'getAiProviderList').mockResolvedValue(mockProviders);

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
    it('should merge and filter enabled models', async () => {
      const mockProviders = [{ id: 'openai', enabled: true }] as AiProviderListItem[];
      const mockAllModels = [
        { id: 'gpt-4', providerId: 'openai', enabled: true },
      ] as EnabledAiModel[];

      vi.spyOn(repo, 'getAiProviderList').mockResolvedValue(mockProviders);
      vi.spyOn(repo.aiModelModel, 'getAllModels').mockResolvedValue(mockAllModels);
      vi.spyOn(repo as any, 'fetchBuiltinModels').mockResolvedValue([
        { id: 'gpt-4', enabled: true, type: 'chat' },
      ]);

      const result = await repo.getEnabledModels();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toMatchObject({
        id: 'gpt-4',
        providerId: 'openai',
      });
    });

    it('should merge builtin and user models correctly', async () => {
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
          contextWindowTokens: 10,
        },
      ];

      vi.spyOn(repo, 'getAiProviderList').mockResolvedValue(mockProviders);
      vi.spyOn(repo.aiModelModel, 'getAllModels').mockResolvedValue(mockAllModels);
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
          contextWindowTokens: 10,
          id: 'gpt-4',
          providerId: 'openai',
          sort: 1,
          type: 'chat',
        }),
      );
    });

    it('should handle case when user model not found', async () => {
      const mockProviders = [
        { enabled: true, id: 'openai', name: 'OpenAI', sort: 1, source: 'builtin' as const },
      ];

      const mockAllModels: any[] = [];

      vi.spyOn(repo, 'getAiProviderList').mockResolvedValue(mockProviders);
      vi.spyOn(repo.aiModelModel, 'getAllModels').mockResolvedValue(mockAllModels);
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

    it('should include settings property from builtin model', async () => {
      const mockProviders = [
        { enabled: true, id: 'openai', name: 'OpenAI', source: 'builtin' },
      ] as AiProviderListItem[];
      const mockAllModels: EnabledAiModel[] = [];
      const mockSettings = { searchImpl: 'tool' as const };

      vi.spyOn(repo, 'getAiProviderList').mockResolvedValue(mockProviders);
      vi.spyOn(repo.aiModelModel, 'getAllModels').mockResolvedValue(mockAllModels);
      vi.spyOn(repo as any, 'fetchBuiltinModels').mockResolvedValue([
        {
          enabled: true,
          id: 'gpt-4',
          settings: mockSettings,
          type: 'chat',
        },
      ]);

      const result = await repo.getEnabledModels();

      expect(result[0]).toMatchObject({
        id: 'gpt-4',
        settings: mockSettings,
      });
    });

    it('should return all models including disabled ones when filterEnabled is false', async () => {
      const mockProviders = [
        { enabled: true, id: 'openai', name: 'OpenAI', source: 'builtin' },
        { enabled: false, id: 'anthropic', name: 'Anthropic', source: 'builtin' },
      ] as AiProviderListItem[];

      const mockAllModels = [
        {
          abilities: {},
          enabled: false,
          id: 'claude-3',
          providerId: 'anthropic',
          type: 'chat' as const,
        },
      ] as EnabledAiModel[];

      vi.spyOn(repo, 'getAiProviderList').mockResolvedValue(mockProviders);
      vi.spyOn(repo.aiModelModel, 'getAllModels').mockResolvedValue(mockAllModels);
      vi.spyOn(repo as any, 'fetchBuiltinModels').mockResolvedValue([
        {
          enabled: true,
          id: 'gpt-4',
          type: 'chat' as const,
        },
        {
          enabled: false,
          id: 'claude-3',
          type: 'chat' as const,
        },
      ]);

      const result = await repo.getEnabledModels(false);

      // Should include both enabled and disabled models
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'gpt-4',
            enabled: true,
            providerId: 'openai',
          }),
          expect.objectContaining({
            id: 'claude-3',
            enabled: false,
            providerId: 'anthropic',
          }),
        ]),
      );
      // Verify we have at least the expected models (may have more from builtin models)
      expect(result.length).toBeGreaterThanOrEqual(2);

      // Verify disabled models are included
      const disabledModels = result.filter((model) => !model.enabled);
      expect(disabledModels.length).toBeGreaterThan(0);
    });
  });

  describe('getAiProviderModelList', () => {
    it('should merge builtin and user models', async () => {
      const providerId = 'openai';
      const mockUserModels = [
        { id: 'custom-gpt4', enabled: true, type: 'chat' },
      ] as AiProviderModelListItem[];
      const mockBuiltinModels = [{ id: 'gpt-4', enabled: true }];

      vi.spyOn(repo.aiModelModel, 'getModelListByProviderId').mockResolvedValue(mockUserModels);
      vi.spyOn(repo as any, 'fetchBuiltinModels').mockResolvedValue(mockBuiltinModels);

      const result = await repo.getAiProviderModelList(providerId);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'custom-gpt4' }),
          expect.objectContaining({ id: 'gpt-4' }),
        ]),
      );
    });

    it('should merge default and custom models', async () => {
      const mockCustomModels = [
        {
          displayName: 'Custom GPT-4',
          enabled: false,
          id: 'gpt-4',
          type: 'chat' as const,
        },
      ];

      const mockDefaultModels = [
        {
          displayName: 'GPT-4',
          enabled: true,
          id: 'gpt-4',
          type: 'chat' as const,
        },
      ];

      vi.spyOn(repo.aiModelModel, 'getModelListByProviderId').mockResolvedValue(mockCustomModels);
      vi.spyOn(repo as any, 'fetchBuiltinModels').mockResolvedValue(mockDefaultModels);

      const result = await repo.getAiProviderModelList('openai');

      expect(result).toContainEqual(
        expect.objectContaining({
          displayName: 'Custom GPT-4',
          enabled: false,
          id: 'gpt-4',
        }),
      );
    });

    it('should use builtin models', async () => {
      const providerId = 'ai21';

      vi.spyOn(repo.aiModelModel, 'getModelListByProviderId').mockResolvedValue([]);

      const result = await repo.getAiProviderModelList(providerId);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'jamba-mini' }),
          expect.objectContaining({ id: 'jamba-large' }),
        ]),
      );
    });

    it('should return empty if not exist provider', async () => {
      const providerId = 'abc';

      vi.spyOn(repo.aiModelModel, 'getModelListByProviderId').mockResolvedValue([]);

      const result = await repo.getAiProviderModelList(providerId);

      expect(result).toHaveLength(0);
    });
  });

  describe('getAiProviderRuntimeState', () => {
    it('should return complete runtime state', async () => {
      const mockRuntimeConfig = {
        openai: { apiKey: 'test-key' },
      } as unknown as Record<string, AiProviderRuntimeConfig>;
      const mockEnabledProviders = [{ id: 'openai', name: 'OpenAI' }] as EnabledProvider[];
      const mockEnabledModels = [
        { id: 'gpt-4', providerId: 'openai', enabled: true },
      ] as EnabledAiModel[];

      vi.spyOn(repo.aiProviderModel, 'getAiProviderRuntimeConfig').mockResolvedValue(
        mockRuntimeConfig,
      );
      vi.spyOn(repo, 'getUserEnabledProviderList').mockResolvedValue(mockEnabledProviders);
      vi.spyOn(repo, 'getEnabledModels').mockResolvedValue(mockEnabledModels);

      const result = await repo.getAiProviderRuntimeState();

      expect(result).toMatchObject({
        enabledAiProviders: mockEnabledProviders,
        enabledAiModels: mockEnabledModels,
        runtimeConfig: expect.any(Object),
      });
    });

    it('should return provider runtime state', async () => {
      const mockRuntimeConfig = {
        openai: {
          apiKey: 'test-key',
        },
      } as unknown as Record<string, AiProviderRuntimeConfig>;

      vi.spyOn(repo.aiProviderModel, 'getAiProviderRuntimeConfig').mockResolvedValue(
        mockRuntimeConfig,
      );

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
        enabledChatAiProviders: [
          { id: 'openai', logo: 'logo1', name: 'OpenAI', source: 'builtin' },
        ],
        enabledImageAiProviders: [],
        runtimeConfig: {
          openai: {
            apiKey: 'test-key',
            enabled: true,
          },
        },
      });
    });

    it('should return provider runtime state with enabledImageAiProviders', async () => {
      const mockRuntimeConfig = {
        fal: {
          apiKey: 'test-fal-key',
        },
        openai: {
          apiKey: 'test-openai-key',
        },
      } as unknown as Record<string, AiProviderRuntimeConfig>;

      vi.spyOn(repo.aiProviderModel, 'getAiProviderRuntimeConfig').mockResolvedValue(
        mockRuntimeConfig,
      );

      // Mock providers including fal for image generation
      vi.spyOn(repo, 'getUserEnabledProviderList').mockResolvedValue([
        { id: 'openai', logo: 'openai-logo', name: 'OpenAI', source: 'builtin' },
        { id: 'fal', logo: 'fal-logo', name: 'Fal', source: 'builtin' },
      ]);

      // Mock models including image models from fal
      vi.spyOn(repo, 'getEnabledModels').mockResolvedValue([
        {
          abilities: {},
          enabled: true,
          id: 'gpt-4',
          providerId: 'openai',
          type: 'chat',
        },
        {
          abilities: {},
          enabled: true,
          id: 'flux/schnell',
          providerId: 'fal',
          type: 'image',
        },
        {
          abilities: {},
          enabled: true,
          id: 'flux-kontext/dev',
          providerId: 'fal',
          type: 'image',
        },
      ]);

      const result = await repo.getAiProviderRuntimeState();

      expect(result).toEqual({
        enabledAiModels: [
          expect.objectContaining({
            enabled: true,
            id: 'gpt-4',
            providerId: 'openai',
            type: 'chat',
          }),
          expect.objectContaining({
            enabled: true,
            id: 'flux/schnell',
            providerId: 'fal',
            type: 'image',
          }),
          expect.objectContaining({
            enabled: true,
            id: 'flux-kontext/dev',
            providerId: 'fal',
            type: 'image',
          }),
        ],
        enabledAiProviders: [
          { id: 'openai', logo: 'openai-logo', name: 'OpenAI', source: 'builtin' },
          { id: 'fal', logo: 'fal-logo', name: 'Fal', source: 'builtin' },
        ],
        enabledChatAiProviders: [
          { id: 'openai', logo: 'openai-logo', name: 'OpenAI', source: 'builtin' },
        ],
        enabledImageAiProviders: [
          expect.objectContaining({
            id: 'fal',
            name: 'Fal',
          }),
        ],
        runtimeConfig: {
          fal: {
            apiKey: 'test-fal-key',
            enabled: undefined,
          },
          openai: {
            apiKey: 'test-openai-key',
            enabled: true,
          },
        },
      });
    });
  });

  describe('getAiProviderDetail', () => {
    it('should merge provider config with user settings', async () => {
      const providerId = 'openai';
      const mockProviderDetail = {
        id: providerId,
        customSetting: 'test',
      } as unknown as AiProviderDetailItem;

      vi.spyOn(repo.aiProviderModel, 'getAiProviderById').mockResolvedValue(mockProviderDetail);

      const result = await repo.getAiProviderDetail(providerId);

      expect(result).toMatchObject({
        id: providerId,
        customSetting: 'test',
        enabled: true, // from mockProviderConfigs
      });
    });

    it('should merge provider configs correctly', async () => {
      const mockProviderDetail = {
        enabled: true,
        id: 'openai',
        keyVaults: { apiKey: 'test-key' },
        name: 'Custom OpenAI',
        settings: {},
        source: 'builtin' as const,
      };

      vi.spyOn(repo.aiProviderModel, 'getAiProviderById').mockResolvedValue(mockProviderDetail);

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
