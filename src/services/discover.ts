import { PluginQueryParams } from '@lobehub/market-sdk';
import '@lobehub/market-types';

import { edgeClient } from '@/libs/trpc/client';
import { globalHelpers } from '@/store/global/helpers';

class DiscoverService {
  getPluginList = async (
    params: Pick<PluginQueryParams, 'page' | 'pageSize' | 'category' | 'order' | 'sort' | 'q'>,
  ) => {
    const locale = globalHelpers.getCurrentLanguage();
    return edgeClient.market.getPluginList.query({ ...params, locale });
  };

  getPluginCategories = async () => {
    return edgeClient.market.getPluginCategories.query();
  };

  getPluginDetail = async (params: { identifier: string; version?: string }) => {
    const locale = globalHelpers.getCurrentLanguage();
    return edgeClient.market.getPluginDetail.query({ ...params, locale });
  };

  getPluginIdentifiers = async () => {
    return edgeClient.market.getPluginIdentifiers.query();
  };
}

export const discoverService = new DiscoverService();
