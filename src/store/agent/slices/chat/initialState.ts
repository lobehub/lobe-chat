import { DeepPartial } from 'utility-types';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { LobeAgentConfig } from '@/types/agent';

export interface AgentState {
  activeId: string;
  agentConfig: DeepPartial<LobeAgentConfig>;
  defaultAgentConfig: LobeAgentConfig;
  isAgentConfigInit: boolean;
  isDefaultAgentConfigInit: boolean;
  updateAgentChatConfigSignal?: AbortController;
  updateAgentConfigSignal?: AbortController;
}

export const initialAgentChatState: AgentState = {
  activeId: 'inbox',
  agentConfig: {},
  defaultAgentConfig: DEFAULT_AGENT_CONFIG,
  isAgentConfigInit: false,
  isDefaultAgentConfigInit: false,
};
