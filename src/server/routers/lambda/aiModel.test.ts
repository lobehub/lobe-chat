import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AiInfraRepos } from '@/database/repositories/aiInfra';
import { AiModelModel } from '@/database/server/models/aiModel';
import { UserModel } from '@/database/server/models/user';
import { getServerGlobalConfig } from '@/server/globalConfig';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';

import { aiModelRouter } from './aiModel';

vi.mock('@/database/server/models/aiModel');
vi.mock('@/database/server/models/user');
vi.mock('@/database/repositories/aiInfra');
vi.mock('@/server/modules/KeyVaultsEncrypt');
vi.mock('@/server/globalConfig');

describe('aiModelRouter', () => {
  const mockContext = {
    userId: 'test-user-id',
  };

  const mockAiModelModel = {
    batchToggleAiModels: vi.fn(),
    batchUpdateAiModels: vi.fn(),
    clearModelsByProvider: vi.fn(),
    clearRemoteModels: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    toggleModelEnabled: vi.fn(),
    update: vi.fn(),
    updateModelsOrder: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(AiModelModel).mockImplementation(() => mockAiModelModel as any);
    vi.mocked(getServerGlobalConfig).mockReturnValue({ aiProvider: {} } as any);
    vi.mocked(KeyVaultsGateKeeper.initWithEnvKey).mockResolvedValue({} as any);
  });

  it('should handle batchToggleAiModels', async () => {
    const caller = aiModelRouter.createCaller({ ...mockContext } as any);
    await caller.batchToggleAiModels({
      enabled: true,
      id: 'provider-1',
      models: ['model-1', 'model-2'],
    });

    expect(mockAiModelModel.batchToggleAiModels).toHaveBeenCalledWith(
      'provider-1',
      ['model-1', 'model-2'],
      true,
    );
  });

  it('should handle batchUpdateAiModels', async () => {
    const models = [{ id: 'model-1' }, { id: 'model-2' }];
    const caller = aiModelRouter.createCaller({ ...mockContext } as any);
    await caller.batchUpdateAiModels({
      id: 'provider-1',
      models,
    });

    expect(mockAiModelModel.batchUpdateAiModels).toHaveBeenCalledWith('provider-1', models);
  });

  it('should handle clearModelsByProvider', async () => {
    const caller = aiModelRouter.createCaller({ ...mockContext } as any);
    await caller.clearModelsByProvider({ providerId: 'provider-1' });

    expect(mockAiModelModel.clearModelsByProvider).toHaveBeenCalledWith('provider-1');
  });

  it('should handle clearRemoteModels', async () => {
    const caller = aiModelRouter.createCaller({ ...mockContext } as any);
    await caller.clearRemoteModels({ providerId: 'provider-1' });

    expect(mockAiModelModel.clearRemoteModels).toHaveBeenCalledWith('provider-1');
  });

  it('should handle createAiModel', async () => {
    const modelData = {
      id: 'model-1',
      providerId: 'provider-1',
    };
    mockAiModelModel.create.mockResolvedValue({ id: 'created-model-id' });

    const caller = aiModelRouter.createCaller({ ...mockContext } as any);
    const result = await caller.createAiModel(modelData);

    expect(mockAiModelModel.create).toHaveBeenCalledWith(modelData);
    expect(result).toBe('created-model-id');
  });

  it('should handle getAiModelById', async () => {
    const modelData = { id: 'model-1', name: 'Test Model' };
    mockAiModelModel.findById.mockResolvedValue(modelData);

    const caller = aiModelRouter.createCaller({ ...mockContext } as any);
    const result = await caller.getAiModelById({ id: 'model-1' });

    expect(mockAiModelModel.findById).toHaveBeenCalledWith('model-1');
    expect(result).toEqual(modelData);
  });

  it('should handle removeAiModel', async () => {
    const caller = aiModelRouter.createCaller({ ...mockContext } as any);
    await caller.removeAiModel({ id: 'model-1', providerId: 'provider-1' });

    expect(mockAiModelModel.delete).toHaveBeenCalledWith('model-1', 'provider-1');
  });

  it('should handle toggleModelEnabled', async () => {
    const toggleData = {
      enabled: true,
      id: 'model-1',
      providerId: 'provider-1',
    };

    const caller = aiModelRouter.createCaller({ ...mockContext } as any);
    await caller.toggleModelEnabled(toggleData);

    expect(mockAiModelModel.toggleModelEnabled).toHaveBeenCalledWith(toggleData);
  });

  it('should handle updateAiModel', async () => {
    const updateData = {
      id: 'model-1',
      providerId: 'provider-1',
      value: {
        displayName: 'Updated Model',
      },
    };

    const caller = aiModelRouter.createCaller({ ...mockContext } as any);
    await caller.updateAiModel(updateData);

    expect(mockAiModelModel.update).toHaveBeenCalledWith(
      updateData.id,
      updateData.providerId,
      updateData.value,
    );
  });

  it('should handle updateAiModelOrder', async () => {
    const orderData = {
      providerId: 'provider-1',
      sortMap: [
        { id: 'model-1', sort: 1 },
        { id: 'model-2', sort: 2 },
      ],
    };

    const caller = aiModelRouter.createCaller({ ...mockContext } as any);
    await caller.updateAiModelOrder(orderData);

    expect(mockAiModelModel.updateModelsOrder).toHaveBeenCalledWith(
      orderData.providerId,
      orderData.sortMap,
    );
  });
});
