import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { LobeAgentChatConfig, LobeAgentConfig } from '@/types/agent';
import { MetaData } from '@/types/meta';

export interface State {
  autocompleteLoading: SessionLoadingState;
  config: LobeAgentConfig;
  id?: string;
  meta: MetaData;

  onChatConfigChange?: (config: LobeAgentChatConfig) => void;
  onConfigChange?: (config: LobeAgentConfig) => void;
  onMetaChange?: (meta: MetaData) => void;
}
export type SessionLoadingState = Record<Partial<keyof MetaData>, boolean>;

export const initialState: State = {
  // loading 中间态
  autocompleteLoading: {
    avatar: false,
    backgroundColor: false,
    description: false,
    tags: false,
    title: false,
  },
  config: DEFAULT_AGENT_CONFIG,
  meta: DEFAULT_AGENT_META,
};
