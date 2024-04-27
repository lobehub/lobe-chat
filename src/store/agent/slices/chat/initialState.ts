import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { LobeAgentConfig } from '@/types/agent';

export interface AgentState {
  activeId: string;
  agentConfig: LobeAgentConfig;
  isAgentConfigInit: boolean;
}

export const initialSessionState: AgentState = {
  activeId: 'inbox',
  agentConfig: DEFAULT_AGENT_CONFIG,
  isAgentConfigInit: false,
};
