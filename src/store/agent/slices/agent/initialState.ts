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
   * Whether the agent panel is pinned (UI state)
   */
  isAgentPinned: boolean;
  showAgentSetting: boolean;
  /**
   * Content being streamed for system role update
   */
  streamingSystemRole?: string;
  /**
   * Whether system role streaming is in progress
   */
  streamingSystemRoleInProgress?: boolean;
  updateAgentChatConfigSignal?: AbortController;
  updateAgentConfigSignal?: AbortController;
  updateAgentMetaSignal?: AbortController;
}

export const initialAgentSliceState: AgentSliceState = {
  agentConfigInitMap: {},
  agentMap: {},
  defaultAgentConfig: DEFAULT_AGENT_CONFIG,
  isAgentPinned: false,
  showAgentSetting: false,
  streamingSystemRole: undefined,
  streamingSystemRoleInProgress: false,
};
