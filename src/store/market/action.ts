import { flatten } from 'lodash-es';
import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { getAgentList, getAgentManifest } from '@/services/agentMarket';
import { AgentsMarketItem, LobeChatAgentsMarketIndex } from '@/types/market';
import { findDuplicates } from '@/utils/findDuplicates';

import type { Store } from './store';

export interface StoreAction {
  generateAgentTagList: () => string[];
  useFetchAgentList: () => SWRResponse<LobeChatAgentsMarketIndex>;
  useFetchAgentManifest: () => SWRResponse<AgentsMarketItem>;
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
  useFetchAgentList: () =>
    useSWR<LobeChatAgentsMarketIndex>('fetchAgentList', getAgentList, {
      onSuccess: (agentMarketIndex) => {
        set({ agentList: agentMarketIndex.agents }, false, 'useFetchAgentList');
      },
    }),
  useFetchAgentManifest: () =>
    useSWR<AgentsMarketItem>('fetchAgentManifest', () => getAgentManifest(get().agentManifestUrl), {
      onSuccess: (agentManifest) => {
        set({ agentManifest }, false, 'useFetchAgentManifest');
      },
    }),
});
