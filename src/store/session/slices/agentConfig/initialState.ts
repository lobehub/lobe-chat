import { LobeChatPluginMeta } from '@lobehub/chat-plugin-sdk';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { MetaData } from '@/types/meta';
import { LobeAgentConfig } from '@/types/session';

export type SessionLoadingState = Record<Partial<keyof MetaData>, boolean>;

export interface AgentConfigState {
  autocompleteLoading: SessionLoadingState;
  pluginList?: LobeChatPluginMeta[];
}

export const initialLobeAgentConfig: LobeAgentConfig = DEFAULT_AGENT_CONFIG;

export const initialAgentConfigState: AgentConfigState = {
  // // loading 中间态
  autocompleteLoading: {
    avatar: false,
    backgroundColor: false,
    description: false,
    tag: false,
    title: false,
  },
};
