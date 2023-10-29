import isEqual from 'fast-deep-equal';
import { produce } from 'immer';
import useSWR, { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { getAgentList, getAgentManifest } from '@/services/agentMarket';
import { getCurrentLanguage } from '@/store/global/helpers';
import { AgentsMarketItem, LobeChatAgentsMarketIndex } from '@/types/market';

import type { Store } from './store';

export interface StoreAction {
  activateAgent: (identifier: string) => void;
  deactivateAgent: () => void;
  updateAgentMap: (key: string, value: AgentsMarketItem) => void;
  useFetchAgent: (identifier: string) => SWRResponse<AgentsMarketItem>;
  useFetchAgentList: () => SWRResponse<LobeChatAgentsMarketIndex>;
}

export const createMarketAction: StateCreator<
  Store,
  [['zustand/devtools', never]],
  [],
  StoreAction
> = (set, get) => ({
  activateAgent: (identifier) => {
    set({ currentIdentifier: identifier });
  },
  deactivateAgent: () => {
    set({ currentIdentifier: undefined }, false, 'deactivateAgent');
  },
  updateAgentMap: (key, value) => {
    const { agentMap } = get();

    const nextAgentMap = produce(agentMap, (draft) => {
      draft[key] = value;
    });

    if (isEqual(nextAgentMap, agentMap)) return;

    set({ agentMap: nextAgentMap }, false, `setAgentMap/${key}`);
  },
  useFetchAgent: (identifier) =>
    useSWR<AgentsMarketItem>(
      [identifier, getCurrentLanguage()],
      ([id, locale]) => getAgentManifest(id, locale as string),
      {
        onError: () => {
          get().deactivateAgent();
        },
        onSuccess: (data) => {
          get().updateAgentMap(identifier, data);
        },
      },
    ),
  useFetchAgentList: () =>
    useSWR<LobeChatAgentsMarketIndex>(getCurrentLanguage(), getAgentList, {
      onSuccess: (agentMarketIndex) => {
        set({ agentList: agentMarketIndex.agents }, false, 'useFetchAgentList');
      },
    }),
});
