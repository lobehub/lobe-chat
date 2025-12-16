import type { PartialDeep } from 'type-fest';

import { AgentSettingsInstance } from '@/features/AgentSetting';
import { AgentItem } from '@/types/agent';

export interface AgentSliceState {
  activeAgentId?: string;
  agentMap: Record<string, PartialDeep<AgentItem>>;
  agentSettingInstance?: AgentSettingsInstance | null;
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
  agentMap: {},
  isAgentPinned: false,
  showAgentSetting: false,
  streamingSystemRole: undefined,
  streamingSystemRoleInProgress: false,
};
