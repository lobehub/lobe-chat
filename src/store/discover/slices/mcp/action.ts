import { CategoryItem, PluginListResponse, PluginQueryParams } from '@lobehub/market-sdk';
import { PluginItemDetail } from '@lobehub/market-types';
import useSWR, { type SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { discoverService } from '@/services/discover';
import { DiscoverStore } from '@/store/discover';

export interface MCPAction {
  usePluginCategories: () => SWRResponse<CategoryItem[]>;
  usePluginDetail: (params: {
    identifier: string;
    version?: string;
  }) => SWRResponse<PluginItemDetail>;
  usePluginList: (
    params: Pick<PluginQueryParams, 'page' | 'pageSize' | 'category' | 'order' | 'sort' | 'q'>,
  ) => SWRResponse<PluginListResponse>;
}

export const createMCPSlice: StateCreator<
  DiscoverStore,
  [['zustand/devtools', never]],
  [],
  MCPAction
> = () => ({
  usePluginCategories: () =>
    useSWR('plugin-categories', async () => discoverService.getPluginCategories(), {
      revalidateOnFocus: false,
    }),

  usePluginDetail: (params) =>
    useSWR(
      ['plugin-detail', ...Object.values(params)].filter(Boolean).join('-'),
      async () => discoverService.getPluginDetail(params),
      {
        revalidateOnFocus: false,
      },
    ),

  usePluginList: (params) =>
    useSWR(
      ['plugin-list', ...Object.values(params)].filter(Boolean).join('-'),
      async () => discoverService.getPluginList(params),
      {
        revalidateOnFocus: false,
      },
    ),
});
