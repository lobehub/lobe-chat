import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clientDB } from '@/database/client/db';
import { AiInfraRepos } from '@/database/repositories/aiInfra';
import { AiModelModel } from '@/database/server/models/aiModel';

import { ClientService } from './client';

// Mock dependencies
vi.mock('@/database/client/db', () => ({
  clientDB: {},
}));
vi.mock('@/database/repositories/aiInfra');
vi.mock('@/database/server/models/aiModel');

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ClientService('testUserId');

    // Mock window global store
    if (typeof window !== 'undefined') {
      (window as any).global_serverConfigStore = {
        getState: () => ({
          serverConfig: {
            aiProvider: {
              testConfig: 'value',
            },
          },
        }),
      };
    }
  });

  it('should create an AI model', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ id: 'testId' });
    vi.mocked(AiModelModel).mockImplementation(
      () =>
        ({
          create: mockCreate,
        }) as any,
    );

    const params = {
      id: 'testModel',
      providerId: 'testProvider',
    };

    const result = await service.createAiModel(params);

    expect(result).toBe('testId');
    expect(mockCreate).toHaveBeenCalledWith(params);
  });

  it('should get AI provider model list', async () => {
    const mockList = [
      { id: 'model1', enabled: true, type: 'chat' as const },
      { id: 'model2', enabled: false, type: 'chat' as const },
    ];
    const mockGetList = vi.fn().mockResolvedValue(mockList);
    vi.mocked(AiInfraRepos).mockImplementation(
      () =>
        ({
          getAiProviderModelList: mockGetList,
        }) as any,
    );

    const result = await service.getAiProviderModelList('testProvider');

    expect(result).toEqual(mockList);
    expect(mockGetList).toHaveBeenCalledWith('testProvider');
  });

  it('should get AI model by ID', async () => {
    const mockModel = { id: 'testId', name: 'Test Model' };
    const mockFindById = vi.fn().mockResolvedValue(mockModel);
    vi.mocked(AiModelModel).mockImplementation(
      () =>
        ({
          findById: mockFindById,
        }) as any,
    );

    const result = await service.getAiModelById('testId');

    expect(result).toEqual(mockModel);
    expect(mockFindById).toHaveBeenCalledWith('testId');
  });

  it('should toggle model enabled status', async () => {
    const mockToggle = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(AiModelModel).mockImplementation(
      () =>
        ({
          toggleModelEnabled: mockToggle,
        }) as any,
    );

    const params = { id: 'testId', enabled: true, providerId: 'testProvider' };
    const result = await service.toggleModelEnabled(params);

    expect(result).toEqual({ success: true });
    expect(mockToggle).toHaveBeenCalledWith(params);
  });

  it('should update AI model', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(AiModelModel).mockImplementation(
      () =>
        ({
          update: mockUpdate,
        }) as any,
    );

    const updateParams = { displayName: 'Updated Model' };
    const result = await service.updateAiModel('testId', 'testProvider', updateParams);

    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith('testId', 'testProvider', updateParams);
  });

  it('should batch update AI models', async () => {
    const mockBatchUpdate = vi.fn().mockResolvedValue([
      { id: 'model1', enabled: true, type: 'chat' as const },
      { id: 'model2', enabled: false, type: 'chat' as const },
    ]);
    vi.mocked(AiModelModel).mockImplementation(
      () =>
        ({
          batchUpdateAiModels: mockBatchUpdate,
        }) as any,
    );

    const models = [
      { id: 'model1', enabled: true, type: 'chat' as const },
      { id: 'model2', enabled: false, type: 'chat' as const },
    ];
    const result = await service.batchUpdateAiModels('testProvider', models);

    expect(result).toEqual([
      { id: 'model1', enabled: true, type: 'chat' },
      { id: 'model2', enabled: false, type: 'chat' },
    ]);
    expect(mockBatchUpdate).toHaveBeenCalledWith('testProvider', models);
  });

  it('should batch toggle AI models', async () => {
    const mockBatchToggle = vi.fn().mockResolvedValue(undefined);
    vi.mocked(AiModelModel).mockImplementation(
      () =>
        ({
          batchToggleAiModels: mockBatchToggle,
        }) as any,
    );

    await service.batchToggleAiModels('testProvider', ['model1', 'model2'], true);

    expect(mockBatchToggle).toHaveBeenCalledWith('testProvider', ['model1', 'model2'], true);
  });

  it('should clear remote models', async () => {
    const mockClearRemote = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(AiModelModel).mockImplementation(
      () =>
        ({
          clearRemoteModels: mockClearRemote,
        }) as any,
    );

    const result = await service.clearRemoteModels('testProvider');

    expect(result).toEqual({ success: true });
    expect(mockClearRemote).toHaveBeenCalledWith('testProvider');
  });

  it('should clear models by provider', async () => {
    const mockClearByProvider = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(AiModelModel).mockImplementation(
      () =>
        ({
          clearModelsByProvider: mockClearByProvider,
        }) as any,
    );

    const result = await service.clearModelsByProvider('testProvider');

    expect(result).toEqual({ success: true });
    expect(mockClearByProvider).toHaveBeenCalledWith('testProvider');
  });

  it('should update AI model order', async () => {
    const mockUpdateOrder = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(AiModelModel).mockImplementation(
      () =>
        ({
          updateModelsOrder: mockUpdateOrder,
        }) as any,
    );

    const items = [
      { id: 'model1', sort: 1 },
      { id: 'model2', sort: 2 },
    ];
    const result = await service.updateAiModelOrder('testProvider', items);

    expect(result).toEqual({ success: true });
    expect(mockUpdateOrder).toHaveBeenCalledWith('testProvider', items);
  });

  it('should delete AI model', async () => {
    const mockDelete = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(AiModelModel).mockImplementation(
      () =>
        ({
          delete: mockDelete,
        }) as any,
    );

    const params = { id: 'testId', providerId: 'testProvider' };
    const result = await service.deleteAiModel(params);

    expect(result).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledWith(params.id, params.providerId);
  });
});
