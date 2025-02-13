import { beforeEach, describe, expect, it, vi } from 'vitest';

import { aiModelService } from '@/services/aiModel';
import { AiInfraStore } from '@/store/aiInfra/store';
import { AiProviderModelListItem } from '@/types/aiModel';

import { createAiModelSlice } from './action';

vi.mock('@/services/aiModel');
vi.mock('@/services/models');
vi.mock('@/libs/swr');

describe('aiModel actions', () => {
  const mockGet = vi.fn();
  const mockSet = vi.fn();
  const mockRefreshAiModelList = vi.fn();
  const mockStore = {
    getState: vi.fn(),
    getInitialState: vi.fn(),
    subscribe: vi.fn(),
  };
  const slice = createAiModelSlice(mockSet, mockGet, mockStore as any);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue({
      activeAiProvider: 'test-provider',
      refreshAiModelList: mockRefreshAiModelList,
      refreshAiProviderRuntimeState: vi.fn(),
      internal_toggleAiModelLoading: vi.fn(),
    });
  });

  describe('batchToggleAiModels', () => {
    it('should call service and refresh list', async () => {
      await slice.batchToggleAiModels(['model1', 'model2'], true);

      expect(aiModelService.batchToggleAiModels).toHaveBeenCalledWith(
        'test-provider',
        ['model1', 'model2'],
        true,
      );
      expect(mockRefreshAiModelList).toHaveBeenCalled();
    });

    it('should not call service if no active provider', async () => {
      mockGet.mockReturnValue({ activeAiProvider: undefined });

      await slice.batchToggleAiModels(['model1'], true);

      expect(aiModelService.batchToggleAiModels).not.toHaveBeenCalled();
    });
  });

  describe('batchUpdateAiModels', () => {
    it('should call service and refresh list', async () => {
      const models: AiProviderModelListItem[] = [
        {
          id: 'model1',
          enabled: true,
          type: 'chat',
          abilities: {},
        },
      ];

      await slice.batchUpdateAiModels(models);

      expect(aiModelService.batchUpdateAiModels).toHaveBeenCalledWith('test-provider', models);
      expect(mockRefreshAiModelList).toHaveBeenCalled();
    });

    it('should not call service if no active provider', async () => {
      mockGet.mockReturnValue({ activeAiProvider: undefined });

      await slice.batchUpdateAiModels([]);

      expect(aiModelService.batchUpdateAiModels).not.toHaveBeenCalled();
    });
  });

  describe('clearModelsByProvider', () => {
    it('should call service and refresh list', async () => {
      await slice.clearModelsByProvider('test-provider');

      expect(aiModelService.clearModelsByProvider).toHaveBeenCalledWith('test-provider');
      expect(mockRefreshAiModelList).toHaveBeenCalled();
    });
  });

  describe('clearRemoteModels', () => {
    it('should call service and refresh list', async () => {
      await slice.clearRemoteModels('test-provider');

      expect(aiModelService.clearRemoteModels).toHaveBeenCalledWith('test-provider');
      expect(mockRefreshAiModelList).toHaveBeenCalled();
    });
  });

  describe('createNewAiModel', () => {
    it('should call service and refresh list', async () => {
      const data = { id: 'model1', providerId: 'test-provider' };
      await slice.createNewAiModel(data);

      expect(aiModelService.createAiModel).toHaveBeenCalledWith(data);
      expect(mockRefreshAiModelList).toHaveBeenCalled();
    });
  });

  describe('internal_toggleAiModelLoading', () => {
    it('should add id to loading ids when loading is true', () => {
      mockGet.mockReturnValue({ aiModelLoadingIds: [] });

      slice.internal_toggleAiModelLoading('model1', true);

      expect(mockSet).toHaveBeenCalledWith(expect.any(Function), false, 'toggleAiModelLoading');
    });

    it('should remove id from loading ids when loading is false', () => {
      mockGet.mockReturnValue({ aiModelLoadingIds: ['model1'] });

      slice.internal_toggleAiModelLoading('model1', false);

      expect(mockSet).toHaveBeenCalledWith(expect.any(Function), false, 'toggleAiModelLoading');
    });
  });

  describe('toggleModelEnabled', () => {
    it('should call service and refresh list', async () => {
      await slice.toggleModelEnabled({ id: 'model1', enabled: true });

      expect(aiModelService.toggleModelEnabled).toHaveBeenCalledWith({
        id: 'model1',
        enabled: true,
        providerId: 'test-provider',
      });
      expect(mockRefreshAiModelList).toHaveBeenCalled();
    });

    it('should not call service if no active provider', async () => {
      mockGet.mockReturnValue({ activeAiProvider: undefined });

      await slice.toggleModelEnabled({ id: 'model1', enabled: true });

      expect(aiModelService.toggleModelEnabled).not.toHaveBeenCalled();
    });
  });

  describe('updateAiModelsConfig', () => {
    it('should call service and refresh list', async () => {
      const data: Partial<AiProviderModelListItem> = {
        enabled: true,
      };
      await slice.updateAiModelsConfig('model1', 'test-provider', data);

      expect(aiModelService.updateAiModel).toHaveBeenCalledWith('model1', 'test-provider', data);
      expect(mockRefreshAiModelList).toHaveBeenCalled();
    });
  });

  describe('updateAiModelsSort', () => {
    it('should call service and refresh list', async () => {
      const items = [{ id: 'model1', sort: 1 }];
      await slice.updateAiModelsSort('test-provider', items);

      expect(aiModelService.updateAiModelOrder).toHaveBeenCalledWith('test-provider', items);
      expect(mockRefreshAiModelList).toHaveBeenCalled();
    });
  });
});
