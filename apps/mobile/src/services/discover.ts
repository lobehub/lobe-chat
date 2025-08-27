import type { CategoryItem, CategoryListQuery } from '@lobehub/market-sdk';
import i18n from 'i18next';

import { trpcClient } from '@/services/_auth/trpc';
import {
  AssistantListResponse,
  AssistantQueryParams,
  DiscoverAssistantDetail,
  IdentifiersResponse,
} from '@/types/discover';

class DiscoverService {
  private _isRetrying = false;

  // ============================== Assistant Market ==============================
  getAssistantCategories = async (params: CategoryListQuery = {}): Promise<CategoryItem[]> => {
    const locale = i18n.language;
    return trpcClient.market.getAssistantCategories.query({
      ...params,
      locale,
    });
  };

  getAssistantDetail = async (params: {
    identifier: string;
    locale?: string;
  }): Promise<DiscoverAssistantDetail | undefined> => {
    const locale = i18n.language;
    return trpcClient.market.getAssistantDetail.query({
      ...params,
      locale,
    });
  };

  getAssistantIdentifiers = async (): Promise<IdentifiersResponse> => {
    return trpcClient.market.getAssistantIdentifiers.query();
  };

  getAssistantList = async (params: AssistantQueryParams = {}): Promise<AssistantListResponse> => {
    const locale = i18n.language;
    return trpcClient.market.getAssistantList.query({
      ...params,
      locale,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 20,
    });
  };
}

export const discoverService = new DiscoverService();
