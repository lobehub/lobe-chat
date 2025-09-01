import { AiProviderModelListItem } from 'model-bank';
import { describe, expect, it, vi } from 'vitest';

import { lambdaClient } from '@/libs/trpc/client';

import { ServerService } from './server';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    aiModel: {
      createAiModel: { mutate: vi.fn() },
      getAiProviderModelList: { query: vi.fn() },
      getAiModelById: { query: vi.fn() },
      toggleModelEnabled: { mutate: vi.fn() },
      updateAiModel: { mutate: vi.fn() },
      batchUpdateAiModels: { mutate: vi.fn() },
      batchToggleAiModels: { mutate: vi.fn() },
      clearModelsByProvider: { mutate: vi.fn() },
      clearRemoteModels: { mutate: vi.fn() },
      updateAiModelOrder: { mutate: vi.fn() },
      removeAiModel: { mutate: vi.fn() },
    },
  },
}));

describe('ServerService', () => {
  const service = new ServerService();

  it('should create AI model', async () => {
    const params = {
      id: 'test-id',
      providerId: 'test-provider',
      displayName: 'Test Model',
    };
    await service.createAiModel(params);
    expect(vi.mocked(lambdaClient.aiModel.createAiModel.mutate)).toHaveBeenCalledWith(params);
  });

  it('should get AI provider model list', async () => {
    await service.getAiProviderModelList('123');
    expect(vi.mocked(lambdaClient.aiModel.getAiProviderModelList.query)).toHaveBeenCalledWith({
      id: '123',
    });
  });

  it('should get AI model by id', async () => {
    await service.getAiModelById('123');
    expect(vi.mocked(lambdaClient.aiModel.getAiModelById.query)).toHaveBeenCalledWith({
      id: '123',
    });
  });

  it('should toggle model enabled', async () => {
    const params = { id: '123', providerId: 'test', enabled: true };
    await service.toggleModelEnabled(params);
    expect(vi.mocked(lambdaClient.aiModel.toggleModelEnabled.mutate)).toHaveBeenCalledWith(params);
  });

  it('should update AI model', async () => {
    const value = { contextWindowTokens: 4000, displayName: 'Updated Model' };
    await service.updateAiModel('123', 'openai', value);
    expect(vi.mocked(lambdaClient.aiModel.updateAiModel.mutate)).toHaveBeenCalledWith({
      id: '123',
      providerId: 'openai',
      value,
    });
  });

  it('should batch update AI models', async () => {
    const models: AiProviderModelListItem[] = [
      {
        id: '123',
        enabled: true,
        type: 'chat',
      },
    ];
    await service.batchUpdateAiModels('provider1', models);
    expect(vi.mocked(lambdaClient.aiModel.batchUpdateAiModels.mutate)).toHaveBeenCalledWith({
      id: 'provider1',
      models,
    });
  });

  it('should batch toggle AI models', async () => {
    const models = ['123', '456'];
    await service.batchToggleAiModels('provider1', models, true);
    expect(vi.mocked(lambdaClient.aiModel.batchToggleAiModels.mutate)).toHaveBeenCalledWith({
      id: 'provider1',
      models,
      enabled: true,
    });
  });

  it('should clear models by provider', async () => {
    await service.clearModelsByProvider('provider1');
    expect(vi.mocked(lambdaClient.aiModel.clearModelsByProvider.mutate)).toHaveBeenCalledWith({
      providerId: 'provider1',
    });
  });

  it('should clear remote models', async () => {
    await service.clearRemoteModels('provider1');
    expect(vi.mocked(lambdaClient.aiModel.clearRemoteModels.mutate)).toHaveBeenCalledWith({
      providerId: 'provider1',
    });
  });

  it('should update AI model order', async () => {
    const items = [{ id: '123', sort: 1 }];
    await service.updateAiModelOrder('provider1', items);
    expect(vi.mocked(lambdaClient.aiModel.updateAiModelOrder.mutate)).toHaveBeenCalledWith({
      providerId: 'provider1',
      sortMap: items,
    });
  });

  it('should delete AI model', async () => {
    const params = { id: '123', providerId: 'openai' };
    await service.deleteAiModel(params);
    expect(vi.mocked(lambdaClient.aiModel.removeAiModel.mutate)).toHaveBeenCalledWith(params);
  });
});
