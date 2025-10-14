import { useToast } from '@lobehub/ui-rn';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';

import { FlashListItem } from '../types';

/**
 * Hook for managing provider models data and operations
 */
export const useProviderModels = (providerId: string) => {
  const { t } = useTranslation(['setting']);
  const toast = useToast();

  // Models相关状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(20);

  // Store hooks for models
  const { useFetchAiProviderModels, fetchRemoteModelList, toggleModelEnabled } = useAiInfraStore();
  const { data: modelList, isLoading: isModelsLoading } = useFetchAiProviderModels(providerId);
  const totalModels = useAiInfraStore(aiModelSelectors.totalAiProviderModelList);

  // 模型相关处理函数
  const handleFetchModels = useCallback(async () => {
    setIsFetching(true);
    try {
      await fetchRemoteModelList(providerId);
      toast.success(t('aiProviders.models.fetchSuccess', { ns: 'setting' }));
    } catch (error) {
      console.error('Failed to fetch models:', error);
      Alert.alert(
        t('error', { ns: 'common' }),
        t('aiProviders.models.fetchFailed', { ns: 'setting' }),
      );
    } finally {
      setIsFetching(false);
    }
  }, [providerId, fetchRemoteModelList, toast, t]);

  const handleToggleModel = useCallback(
    async (modelId: string, enabled: boolean) => {
      try {
        await toggleModelEnabled({ enabled, id: modelId });
        console.log(`Model ${modelId} ${enabled ? 'enabled' : 'disabled'}`);
      } catch (error) {
        console.error(`Failed to toggle model ${modelId}:`, error);
        Alert.alert(
          t('error', { ns: 'common' }),
          enabled
            ? t('aiProviders.models.enableFailed', { ns: 'setting' })
            : t('aiProviders.models.disableFailed', { ns: 'setting' }),
        );
      }
    },
    [toggleModelEnabled, t],
  );

  // 重置显示数量当搜索关键词变化时
  useEffect(() => {
    setDisplayedCount(20);
  }, [searchKeyword]);

  // 处理模型数据（不包含UI逻辑）
  const { enabledModels, disabledModels, totalFilteredCount } = useMemo(() => {
    if (!modelList) return { disabledModels: [], enabledModels: [], totalFilteredCount: 0 };

    const filtered = modelList.filter((model) => {
      if (!searchKeyword.trim()) return true;
      const keyword = searchKeyword.toLowerCase();
      return (
        model.id.toLowerCase().includes(keyword) ||
        model.displayName?.toLowerCase().includes(keyword)
      );
    });

    const enabled = filtered.filter((model) => model.enabled);
    const disabled = filtered.filter((model) => !model.enabled);

    return {
      disabledModels: disabled,
      enabledModels: enabled,
      totalFilteredCount: enabled.length + disabled.length,
    };
  }, [modelList, searchKeyword]);

  // 构建Models相关的FlashList数据
  const buildModelsData = useCallback(
    (items: FlashListItem[]): FlashListItem[] => {
      // Models header
      items.push({
        data: {
          isFetching,
          searchKeyword,
          totalCount: totalModels,
        },
        id: 'models-header',
        type: 'models-header',
      });

      // 加载中
      if (isModelsLoading) {
        return items;
      }

      // 空状态
      if (totalFilteredCount === 0) {
        items.push({
          data: {
            message: searchKeyword.trim()
              ? t('aiProviders.models.emptyWithSearch', { ns: 'setting' })
              : t('aiProviders.models.emptyNoSearch', { ns: 'setting' }),
          },
          id: 'empty-models',
          type: 'empty',
        });
        return items;
      }

      // 启用的模型
      if (enabledModels.length > 0) {
        items.push({
          data: {
            count: enabledModels.length,
            title: t('aiProviders.list.enabled', { ns: 'setting' }),
          },
          id: 'enabled-header',
          type: 'section-header',
        });

        const displayedEnabled = enabledModels.slice(
          0,
          Math.min(displayedCount, enabledModels.length),
        );
        displayedEnabled.forEach((model) => {
          items.push({
            data: model,
            id: `model-${model.id}`,
            type: 'model',
          });
        });
      }

      // 禁用的模型
      const remainingCount = Math.max(0, displayedCount - enabledModels.length);
      if (disabledModels.length > 0 && remainingCount > 0) {
        items.push({
          data: {
            count: disabledModels.length,
            title: t('aiProviders.list.disabled', { ns: 'setting' }),
          },
          id: 'disabled-header',
          type: 'section-header',
        });

        const displayedDisabled = disabledModels.slice(0, remainingCount);
        displayedDisabled.forEach((model) => {
          items.push({
            data: model,
            id: `model-${model.id}`,
            type: 'model',
          });
        });
      }

      return items;
    },
    [
      searchKeyword,
      totalModels,
      isFetching,
      isModelsLoading,
      enabledModels,
      disabledModels,
      totalFilteredCount,
      displayedCount,
      t,
    ],
  );

  // 自动加载更多
  const handleEndReached = useCallback(() => {
    if (displayedCount < totalFilteredCount) {
      setDisplayedCount((prev) => Math.min(prev + 20, totalFilteredCount));
    }
  }, [displayedCount, totalFilteredCount]);

  return {
    buildModelsData,
    displayedCount,
    handleEndReached,
    handleFetchModels,
    handleToggleModel,
    isFetching,
    isModelsLoading,
    searchKeyword,
    setSearchKeyword,
    totalFilteredCount,
    totalModels,
  };
};
