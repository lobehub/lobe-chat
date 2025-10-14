import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiProviderSelectors } from '@/store/aiInfra/selectors';

import { ProviderFlashListItem } from '../types';

/**
 * Hook for managing provider list data
 */
export const useProviderList = () => {
  const { t } = useTranslation(['setting']);

  // 获取store数据和方法
  const { useFetchAiProviderList } = useAiInfraStore();

  // 使用SWR获取provider列表
  const { isLoading, error } = useFetchAiProviderList();

  // 使用store selectors来响应状态变化
  const enabledProviders = useAiInfraStore(aiProviderSelectors.enabledAiProviderList, isEqual);
  const disabledProviders = useAiInfraStore(aiProviderSelectors.disabledAiProviderList, isEqual);

  // 构建FlashList统一数据结构
  const flashListData = useMemo<ProviderFlashListItem[]>(() => {
    const items: ProviderFlashListItem[] = [];

    // 启用的Provider section
    if (enabledProviders.length > 0) {
      items.push({
        data: {
          count: enabledProviders.length,
          title: t('aiProviders.list.enabled', { ns: 'setting' }),
        },
        id: 'enabled-header',
        type: 'section-header',
      });

      enabledProviders.forEach((provider) => {
        items.push({
          data: provider,
          id: `provider-${provider.id}`,
          type: 'provider',
        });
      });
    }

    // 禁用的Provider section
    if (disabledProviders.length > 0) {
      items.push({
        data: {
          count: disabledProviders.length,
          title: t('aiProviders.list.disabled', { ns: 'setting' }),
        },
        id: 'disabled-header',
        type: 'section-header',
      });

      disabledProviders.forEach((provider) => {
        items.push({
          data: provider,
          id: `provider-${provider.id}`,
          type: 'provider',
        });
      });
    }

    // 如果没有任何Provider
    if (items.length === 0) {
      items.push({
        data: {
          message: t('aiProviders.list.empty', { ns: 'setting' }),
        },
        id: 'empty-providers',
        type: 'empty',
      });
    }

    return items;
  }, [enabledProviders, disabledProviders, t]);

  return {
    error,
    flashListData,
    isLoading,
  };
};
