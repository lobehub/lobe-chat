import { flatten } from 'lodash-es';
import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { getAgentList, getAgentManifest } from '@/services/agentMarket';
import { AgentsMarketItem, LobeChatAgentsMarketIndex } from '@/types/market';
import { findDuplicates } from '@/utils/findDuplicates';

import type { Store } from './store';

export interface StoreAction {
  generateAgentTagList: () => string[];
  onAgentCardClick: (url: string) => void;
  toggleMarketSideBar: (show: boolean) => void;
  useFetchAgentList: () => SWRResponse<LobeChatAgentsMarketIndex>;
  useFetchAgentManifest: (url: string) => SWRResponse<AgentsMarketItem>;
}

export const createMarketAction: StateCreator<
  Store,
  [['zustand/devtools', never]],
  [],
  StoreAction
> = (set, get) => ({
  generateAgentTagList: () => {
    const agentList = get().agentList;
    const rawAgentTagList = flatten(agentList.map((item) => item.meta.tags)) as string[];
    return findDuplicates(rawAgentTagList);
  },
  onAgentCardClick: (url) => {
    get().toggleMarketSideBar(true);
    console.log(url);
    set({ agentManifestUrl: url });
  },
  toggleMarketSideBar: (show) => {
    set({ showAgentSidebar: show }, false, 'toggleMarketSideBar');
  },
  useFetchAgentList: () =>
    useSWR<LobeChatAgentsMarketIndex>('fetchAgentList', getAgentList, {
      onSuccess: (agentMarketIndex) => {
        set({ agentList: agentMarketIndex.agents }, false, 'useFetchAgentList');
      },
    }),
  useFetchAgentManifest: (url) =>
    useSWR<AgentsMarketItem>('fetchAgentManifest', () => getAgentManifest(url)),
});
