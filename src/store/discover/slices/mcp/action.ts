import { CategoryItem, CategoryListQuery } from '@lobehub/market-sdk';
import { type SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { edgeClient } from '@/libs/trpc/client';
import { DiscoverStore } from '@/store/discover';
import { globalHelpers } from '@/store/global/helpers';
import {
  DiscoverMcpDetail,
  IdentifiersResponse,
  McpListResponse,
  McpQueryParams,
} from '@/types/discover';

export interface MCPAction {
  useFetchMcpDetail: (params: {
    identifier?: string;
    version?: string;
  }) => SWRResponse<DiscoverMcpDetail>;
  useFetchMcpList: (params: McpQueryParams) => SWRResponse<McpListResponse>;
  useMcpCategories: (params: CategoryListQuery) => SWRResponse<CategoryItem[]>;
  useMcpIdentifiers: () => SWRResponse<IdentifiersResponse>;
}

export const createMCPSlice: StateCreator<
  DiscoverStore,
  [['zustand/devtools', never]],
  [],
  MCPAction
> = () => ({
  useFetchMcpDetail: ({ identifier, version }) => {
    const locale = globalHelpers.getCurrentLanguage();

    return useClientDataSWR(
      !identifier ? null : ['mcp-detail', locale, identifier, version].filter(Boolean).join('-'),
      async () =>
        edgeClient.market.getMcpDetail.query({ identifier: identifier!, locale, version }),
    );
  },

  useFetchMcpList: (params: any) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useClientDataSWR(
      ['mcp-list', locale, ...Object.values(params)].filter(Boolean).join('-'),
      async () =>
        edgeClient.market.getMcpList.query({
          ...params,
          locale,
          page: params.page ? Number(params.page) : 1,
          pageSize: params.pageSize ? Number(params.pageSize) : 21,
        }),
    );
  },

  useMcpCategories: (params) => {
    const locale = globalHelpers.getCurrentLanguage();
    return useClientDataSWR(
      ['mcp-categories', locale, ...Object.values(params)].join('-'),
      async () =>
        edgeClient.market.getMcpCategories.query({
          ...params,
          locale,
        }),
      {
        revalidateOnFocus: false,
      },
    );
  },

  useMcpIdentifiers: () => {
    return useClientDataSWR(
      'mcp-identifiers',
      async () => edgeClient.market.getMcpIdentifiers.query(),
      {
        revalidateOnFocus: false,
      },
    );
  },
});
