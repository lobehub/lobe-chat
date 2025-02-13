import { DeepPartial } from 'utility-types';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { AgentSettingsInstance } from '@/features/AgentSetting';
import { LobeAgentConfig } from '@/types/agent';

export interface AgentState {
  activeAgentId?: string;
  activeId: string;
  agentMap: Record<string, DeepPartial<LobeAgentConfig>>;
  agentSettingInstance?: AgentSettingsInstance | null;
  defaultAgentConfig: LobeAgentConfig;
  isInboxAgentConfigInit: boolean;
  showAgentSetting: boolean;
  updateAgentChatConfigSignal?: AbortController;
  updateAgentConfigSignal?: AbortController;
}

export const initialAgentChatState: AgentState = {
  activeId: 'inbox',
  agentMap: {},
  defaultAgentConfig: DEFAULT_AGENT_CONFIG,
  isInboxAgentConfigInit: false,
  showAgentSetting: false,
};
