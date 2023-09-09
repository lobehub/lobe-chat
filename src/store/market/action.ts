import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { getAgentList, getAgentManifest } from '@/services/agentMarket';
import { AgentsMarketItem, LobeChatAgentsMarketIndex } from '@/types/market';

import type { Store } from './store';

export interface StoreAction {
  useFetchAgentList: () => SWRResponse<LobeChatAgentsMarketIndex>;
  useFetchAgentManifest: (url: string) => SWRResponse<AgentsMarketItem>;
}

export const createSettings: StateCreator<Store, [['zustand/devtools', never]], [], StoreAction> = (
  set,
) => ({
  useFetchAgentList: () =>
    useSWR<LobeChatAgentsMarketIndex>('fetchAgentList', getAgentList, {
      onSuccess: (agentMarketIndex) => {
        set({ agentList: agentMarketIndex.agents }, false, 'useFetchAgentList');
      },
    }),
  useFetchAgentManifest: (url) =>
    useSWR<AgentsMarketItem>('fetchAgentManifest', () => getAgentManifest(url)),
});
