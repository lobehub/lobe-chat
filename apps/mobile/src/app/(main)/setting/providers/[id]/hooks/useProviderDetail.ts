import { AiProviderDetailItem } from '@lobechat/types';
import { useMemo } from 'react';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';

/**
 * Hook for managing provider detail data
 */
export const useProviderDetail = (providerId: string) => {
  const { useFetchAiProviderItem } = useAiInfraStore();
  const { data: userConfig, isLoading, error } = useFetchAiProviderItem(providerId);

  // 获取provider配置状态
  const isConfigLoading = useAiInfraStore(
    aiProviderSelectors.isAiProviderConfigLoading(providerId),
  );

  // 先从本地配置获取基础信息
  const builtinProviderCard = useMemo(
    () => DEFAULT_MODEL_PROVIDER_LIST.find((v) => v.id === providerId),
    [providerId],
  );

  // 合并配置
  const providerDetail = useMemo<AiProviderDetailItem | undefined>(() => {
    if (!builtinProviderCard && !userConfig) return undefined;

    // 如果是内置provider，合并本地配置和用户配置
    if (builtinProviderCard) {
      return {
        ...builtinProviderCard,
        ...userConfig,

        // 保持checkModel的默认值，只有用户明确配置了才使用用户的值
        checkModel: userConfig?.checkModel ?? builtinProviderCard.checkModel,

        // 保留用户配置的这些字段
        enabled: userConfig?.enabled ?? builtinProviderCard.enabled,

        keyVaults: userConfig?.keyVaults || {},
        // 确保settings字段来自本地配置
        settings: builtinProviderCard.settings,
      } as AiProviderDetailItem;
    }

    // 如果是自定义provider，直接使用用户配置
    return userConfig;
  }, [builtinProviderCard, userConfig]);

  return {
    builtinProviderCard,
    error,
    isConfigLoading,
    isLoading,
    providerDetail,
  };
};
