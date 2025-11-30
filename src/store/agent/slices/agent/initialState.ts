import type { PartialDeep } from 'type-fest';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { AgentSettingsInstance } from '@/features/AgentSetting';
import { AgentItem, LobeAgentConfig } from '@/types/agent';

export interface AgentSliceState {
  activeAgentId?: string;
  agentConfigInitMap: Record<string, boolean>;
  agentMap: Record<string, PartialDeep<AgentItem>>;
  agentSettingInstance?: AgentSettingsInstance | null;
  defaultAgentConfig: LobeAgentConfig;
  /**
   * inbox agent id, since inbox is accessed via sessionId, we need to store its agentId separately
   */
  inboxAgentId?: string;
  isInboxAgentConfigInit: boolean;
  showAgentSetting: boolean;
  updateAgentChatConfigSignal?: AbortController;
  updateAgentConfigSignal?: AbortController;
  updateAgentMetaSignal?: AbortController;
}

export const initialAgentSliceState: AgentSliceState = {
  agentConfigInitMap: {},
  agentMap: {},
  defaultAgentConfig: DEFAULT_AGENT_CONFIG,
  isInboxAgentConfigInit: false,
  showAgentSetting: false,
};
