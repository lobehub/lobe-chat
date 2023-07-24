import { LanguageModel } from '@/types/llm';
import { MetaData } from '@/types/meta';
import { LobeAgentConfig } from '@/types/session';

export type SessionLoadingState = Record<Partial<keyof MetaData>, boolean>;

export interface AgentConfigState {
  autocompleteLoading: SessionLoadingState;

  showAgentSettings: boolean;
}

export const initialLobeAgentConfig: LobeAgentConfig = {
  model: LanguageModel.GPT3_5,
  params: { temperature: 0.6 },
  systemRole: '',
};

export const initialAgentConfigState: AgentConfigState = {
  // // loading 中间态
  autocompleteLoading: {
    avatar: false,
    backgroundColor: false,
    description: false,
    tag: false,
    title: false,
  },

  showAgentSettings: true,
};
