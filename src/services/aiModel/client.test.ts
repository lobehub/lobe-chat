import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clientDB } from '@/database/client/db';
import { AiInfraRepos } from '@/database/repositories/aiInfra';
import { AiModelModel } from '@/database/server/models/aiModel';

import { ClientService } from './client';

// Mock dependencies
vi.mock('@/database/client/db', () => ({
  clientDB: {},
}));
vi.mock('@/database/repositories/aiInfra', () => ({
  AiInfraRepos: vi.fn(),
}));
vi.mock('@/database/server/models/aiModel', () => ({
  AiModelModel: vi.fn(),
}));

// Mock window global store
const mockServerConfig = {
  aiProvider: {
    testProvider: {
      config: 'test',
    },
  },
};

const mockGlobalStore = {
  getState: vi.fn(() => ({
    serverConfig: mockServerConfig,
  })),
};

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup window mock
    if (typeof window === 'undefined') {
      Object.defineProperty(global, 'window', {
        value: {
          global_serverConfigStore: mockGlobalStore,
        },
        writable: true,
      });
    }
    service = new ClientService('testUserId');
  });

  describe('createAiModel', () => {
    it('should create an AI model successfully', async () => {
      const mockParams = {
        id: 'test-model',
        displayName: 'Test Model',
        description: 'Test Description',
        organization: 'Test Org',
        enabled: true,
        providerId: 'test-provider',
        type: 'custom',
        sort: 1,
        accessedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        config: {},
        source: 'custom',
        abilities: {},
        contextWindowTokens: 1024,
        releasedAt: null as unknown as string,
        pricing: null,
        parameters: null,
      };
      const mockResponse = { id: 'test-model-id' };

      const mockCreate = vi.fn().mockResolvedValue(mockResponse);
      (AiModelModel.prototype.create as any) = mockCreate;

      const result = await service.createAiModel(mockParams);

      expect(result).toBe('test-model-id');
      expect(mockCreate).toHaveBeenCalledWith(mockParams);
    });
  });

  describe('getAiModelById', () => {
    it('should get AI model by ID', async () => {
      const mockModel = {
        id: 'test-model',
        displayName: 'Test Model',
        description: 'Description',
        organization: null,
        enabled: true,
        providerId: 'test-provider',
        type: 'custom',
        sort: 1,
        accessedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        config: null,
        source: 'custom',
        abilities: {},
        contextWindowTokens: 1024,
        releasedAt: null,
        pricing: null,
        parameters: null,
        userId: 'testUserId',
      };
      const mockFindById = vi.fn().mockResolvedValue(mockModel);
      (AiModelModel.prototype.findById as any) = mockFindById;

      const result = await service.getAiModelById('test-model');

      expect(result).toEqual(mockModel);
      expect(mockFindById).toHaveBeenCalledWith('test-model');
    });
  });

  describe('toggleModelEnabled', () => {
    it('should toggle model enabled state', async () => {
      const params = { id: 'test-model', enabled: true, providerId: 'test-provider' };
      const mockToggle = vi.fn().mockResolvedValue({});
      (AiModelModel.prototype.toggleModelEnabled as any) = mockToggle;

      await service.toggleModelEnabled(params);

      expect(mockToggle).toHaveBeenCalledWith(params);
    });
  });

  describe('updateAiModel', () => {
    it('should update AI model', async () => {
      const updateData = {
        displayName: 'Updated Model',
        config: { deploymentName: 'new-deployment' },
      };
      const mockUpdate = vi.fn().mockResolvedValue({});
      (AiModelModel.prototype.update as any) = mockUpdate;

      await service.updateAiModel('test-model', 'test-provider', updateData);

      expect(mockUpdate).toHaveBeenCalledWith('test-model', 'test-provider', updateData);
    });
  });

  describe('batchUpdateAiModels', () => {
    it('should batch update AI models', async () => {
      const mockModels = [
        { id: 'model1', type: 'custom', displayName: 'Model 1', enabled: true },
        { id: 'model2', type: 'builtin', displayName: 'Model 2', enabled: false },
      ];
      const mockBatchUpdate = vi.fn().mockResolvedValue([]);
      (AiModelModel.prototype.batchUpdateAiModels as any) = mockBatchUpdate;

      await service.batchUpdateAiModels('test-provider', mockModels as any);

      expect(mockBatchUpdate).toHaveBeenCalledWith('test-provider', mockModels);
    });
  });

  describe('batchToggleAiModels', () => {
    it('should batch toggle AI models', async () => {
      const modelIds = ['model1', 'model2'];
      const mockBatchToggle = vi.fn().mockResolvedValue(undefined);
      (AiModelModel.prototype.batchToggleAiModels as any) = mockBatchToggle;

      await service.batchToggleAiModels('test-provider', modelIds, true);

      expect(mockBatchToggle).toHaveBeenCalledWith('test-provider', modelIds, true);
    });
  });

  describe('clearRemoteModels', () => {
    it('should clear remote models', async () => {
      const mockClearRemote = vi.fn().mockResolvedValue({});
      (AiModelModel.prototype.clearRemoteModels as any) = mockClearRemote;

      await service.clearRemoteModels('test-provider');

      expect(mockClearRemote).toHaveBeenCalledWith('test-provider');
    });
  });

  describe('clearModelsByProvider', () => {
    it('should clear models by provider', async () => {
      const mockClearByProvider = vi.fn().mockResolvedValue({});
      (AiModelModel.prototype.clearModelsByProvider as any) = mockClearByProvider;

      await service.clearModelsByProvider('test-provider');

      expect(mockClearByProvider).toHaveBeenCalledWith('test-provider');
    });
  });

  describe('updateAiModelOrder', () => {
    it('should update AI model order', async () => {
      const items = [{ id: 'model1', sort: 1 }];
      const mockUpdateOrder = vi.fn().mockResolvedValue({});
      (AiModelModel.prototype.updateModelsOrder as any) = mockUpdateOrder;

      await service.updateAiModelOrder('test-provider', items);

      expect(mockUpdateOrder).toHaveBeenCalledWith('test-provider', items);
    });
  });

  describe('deleteAiModel', () => {
    it('should delete AI model', async () => {
      const params = { id: 'test-model', providerId: 'test-provider' };
      const mockDelete = vi.fn().mockResolvedValue({});
      (AiModelModel.prototype.delete as any) = mockDelete;

      await service.deleteAiModel(params);

      expect(mockDelete).toHaveBeenCalledWith(params.id, params.providerId);
    });
  });
});
