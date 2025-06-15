import { CategoryItem, CategoryListQuery } from '@lobehub/market-sdk';
import useSWR, { type SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { edgeClient } from '@/libs/trpc/client';
import { DiscoverStore } from '@/store/discover';
import { globalHelpers } from '@/store/global/helpers';
import {
  DiscoverPluginDetail,
  IdentifiersResponse,
  PluginListResponse,
  PluginQueryParams,
} from '@/types/discover';

export interface PluginAction {
  usePluginCategories: (params: CategoryListQuery) => SWRResponse<CategoryItem[]>;
  usePluginDetail: (params: {
    identifier: string;
    withManifest?: boolean;
  }) => SWRResponse<DiscoverPluginDetail | undefined>;
  usePluginIdentifiers: () => SWRResponse<IdentifiersResponse>;
  usePluginList: (params?: PluginQueryParams) => SWRResponse<PluginListResponse>;
}

export const createPluginSlice: StateCreator<
  DiscoverStore,
  [['zustand/devtools', never]],
  [],
  PluginAction
> = () => ({
  usePluginCategories: (params) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useSWR(
      ['plugin-categories', locale, ...Object.values(params)].filter(Boolean).join('-'),
      async () =>
        edgeClient.market.getPluginCategories.query({
          ...params,
          locale,
        }),
      {
        revalidateOnFocus: false,
      },
    );
  },

  usePluginDetail: (params) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useSWR(
      ['plugin-details', locale, ...Object.values(params)].filter(Boolean).join('-'),
      async () => edgeClient.market.getPluginDetail.query({ ...params, locale }),
      {
        revalidateOnFocus: false,
      },
    );
  },

  usePluginIdentifiers: () => {
    return useSWR(
      'plugin-identifiers',
      async () => edgeClient.market.getPluginIdentifiers.query(),
      {
        revalidateOnFocus: false,
      },
    );
  },

  usePluginList: (params = {}) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useSWR(
      ['plugin-list', locale, ...Object.values(params)].filter(Boolean).join('-'),
      async () =>
        edgeClient.market.getPluginList.query({
          ...params,
          locale,
          page: params.page ? Number(params.page) : 1,
          pageSize: params.pageSize ? Number(params.pageSize) : 21,
        }),
      {
        revalidateOnFocus: false,
      },
    );
  },
});
