import { AiProviderDetailItem } from '@lobechat/types';
import { useMemo } from 'react';

import { DEFAULT_MODEL_PROVIDER_LIST } from '@/config/modelProviders';
import { aiProviderSelectors, useAiInfraStore } from '@/store/aiInfra';
import { merge } from '@/utils/merge';

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

  const builtinProviderCard = useMemo(
    () => DEFAULT_MODEL_PROVIDER_LIST.find((v) => v.id === providerId),
    [providerId],
  );

  // 合并本地配置和服务端配置（与 web 端的 AiInfraRepos.getAiProviderDetail 逻辑一致）
  const providerDetail = useMemo<AiProviderDetailItem | undefined>(() => {
    if (!builtinProviderCard && !userConfig) return undefined;

    if (builtinProviderCard) {
      return merge(builtinProviderCard, userConfig || {}) as unknown as AiProviderDetailItem;
    }

    return userConfig;
  }, [builtinProviderCard, userConfig, providerId]);

  return {
    builtinProviderCard,
    error,
    isConfigLoading,
    isLoading,
    providerDetail,
  };
};
