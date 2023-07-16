import { LanguageModel } from '@/types/llm';
import { LobeAgentConfig } from '@/types/session';

export interface SessionLoadingState {
  pickingEmojiAvatar: boolean;
  summarizingDescription: boolean;
  summarizingTitle: boolean;
}
export interface AgentConfigState {
  loading: SessionLoadingState;

  showAgentSettings: boolean;
}

export const initialLobeAgentConfig: LobeAgentConfig = {
  model: LanguageModel.GPT3_5,
  params: { temperature: 0.6 },
  systemRole: '',
};

export const defaultAvatar = 'https://npm.elemecdn.com/@lobehub/assets-logo/assets/logo-3d.webp';

export const initialAgentConfigState: AgentConfigState = {
  // // loading 中间态
  loading: {
    pickingEmojiAvatar: false,
    summarizingDescription: false,
    summarizingTitle: false,
  },

  showAgentSettings: false,
};
