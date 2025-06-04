import useSWR, { type SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { edgeClient } from '@/libs/trpc/client';
import { DiscoverStore } from '@/store/discover';
import { globalHelpers } from '@/store/global/helpers';
import {
  DiscoverProviderDetail,
  IdentifiersResponse,
  ProviderListResponse,
  ProviderQueryParams,
} from '@/types/discover';

export interface ProviderAction {
  useProviderDetail: (params: {
    identifier: string;
    withReadme?: boolean;
  }) => SWRResponse<DiscoverProviderDetail | undefined>;
  useProviderIdentifiers: () => SWRResponse<IdentifiersResponse>;
  useProviderList: (params?: ProviderQueryParams) => SWRResponse<ProviderListResponse>;
}

export const createProviderSlice: StateCreator<
  DiscoverStore,
  [['zustand/devtools', never]],
  [],
  ProviderAction
> = () => ({
  useProviderDetail: (params) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useSWR(
      ['provider-details', locale, params.identifier].filter(Boolean).join('-'),
      async () => edgeClient.market.getProviderDetail.query({ locale, ...params }),
      {
        revalidateOnFocus: false,
      },
    );
  },

  useProviderIdentifiers: () => {
    return useSWR(
      'provider-identifiers',
      async () => edgeClient.market.getProviderIdentifiers.query(),
      {
        revalidateOnFocus: false,
      },
    );
  },

  useProviderList: (params = {}) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useSWR(
      ['provider-list', locale, ...Object.values(params)].filter(Boolean).join('-'),
      async () =>
        edgeClient.market.getProviderList.query({
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
