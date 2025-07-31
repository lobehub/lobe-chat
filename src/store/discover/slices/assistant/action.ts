import { CategoryItem, CategoryListQuery } from '@lobehub/market-sdk';
import useSWR, { type SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { discoverService } from '@/services/discover';
import { DiscoverStore } from '@/store/discover';
import { globalHelpers } from '@/store/global/helpers';
import {
  AssistantListResponse,
  AssistantQueryParams,
  DiscoverAssistantDetail,
  IdentifiersResponse,
} from '@/types/discover';

export interface AssistantAction {
  useAssistantCategories: (params: CategoryListQuery) => SWRResponse<CategoryItem[]>;
  useAssistantDetail: (params: {
    identifier: string;
  }) => SWRResponse<DiscoverAssistantDetail | undefined>;
  useAssistantIdentifiers: () => SWRResponse<IdentifiersResponse>;
  useAssistantList: (params?: AssistantQueryParams) => SWRResponse<AssistantListResponse>;
}

export const createAssistantSlice: StateCreator<
  DiscoverStore,
  [['zustand/devtools', never]],
  [],
  AssistantAction
> = () => ({
  useAssistantCategories: (params) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useSWR(
      ['assistant-categories', locale, ...Object.values(params)].filter(Boolean).join('-'),
      async () => discoverService.getAssistantCategories(params),
      {
        revalidateOnFocus: false,
      },
    );
  },

  useAssistantDetail: (params) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useSWR(
      ['assistant-details', locale, params.identifier].filter(Boolean).join('-'),
      async () => discoverService.getAssistantDetail(params),
      {
        revalidateOnFocus: false,
      },
    );
  },

  useAssistantIdentifiers: () => {
    return useSWR('assistant-identifiers', async () => discoverService.getAssistantIdentifiers(), {
      revalidateOnFocus: false,
    });
  },

  useAssistantList: (params = {}) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useSWR(
      ['assistant-list', locale, ...Object.values(params)].filter(Boolean).join('-'),
      async () =>
        discoverService.getAssistantList({
          ...params,
          page: params.page ? Number(params.page) : 1,
          pageSize: params.pageSize ? Number(params.pageSize) : 21,
        }),
      {
        revalidateOnFocus: false,
      },
    );
  },
});
