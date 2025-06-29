import { CategoryItem, CategoryListQuery } from '@lobehub/market-sdk';
import useSWR, { type SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { edgeClient } from '@/libs/trpc/client';
import { DiscoverStore } from '@/store/discover';
import { globalHelpers } from '@/store/global/helpers';
import {
  DiscoverModelDetail,
  IdentifiersResponse,
  ModelListResponse,
  ModelQueryParams,
} from '@/types/discover';

export interface ModelAction {
  useModelCategories: (params: CategoryListQuery) => SWRResponse<CategoryItem[]>;
  useModelDetail: (params: { identifier: string }) => SWRResponse<DiscoverModelDetail | undefined>;
  useModelIdentifiers: () => SWRResponse<IdentifiersResponse>;
  useModelList: (params?: ModelQueryParams) => SWRResponse<ModelListResponse>;
}

export const createModelSlice: StateCreator<
  DiscoverStore,
  [['zustand/devtools', never]],
  [],
  ModelAction
> = () => ({
  useModelCategories: (params) => {
    return useSWR(
      ['model-categories', ...Object.values(params)].filter(Boolean).join('-'),
      async () => edgeClient.market.getModelCategories.query(params),
      {
        revalidateOnFocus: false,
      },
    );
  },

  useModelDetail: (params) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useSWR(
      ['model-details', locale, params.identifier].filter(Boolean).join('-'),
      async () => edgeClient.market.getModelDetail.query({ ...params, locale }),
      {
        revalidateOnFocus: false,
      },
    );
  },

  useModelIdentifiers: () => {
    return useSWR('model-identifiers', async () => edgeClient.market.getModelIdentifiers.query(), {
      revalidateOnFocus: false,
    });
  },

  useModelList: (params = {}) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useSWR(
      ['model-list', locale, ...Object.values(params)].filter(Boolean).join('-'),
      async () =>
        edgeClient.market.getModelList.query({
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
