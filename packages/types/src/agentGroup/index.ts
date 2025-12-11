import { AgentItem } from '../agent';

export interface LobeChatGroupMetaConfig {
  description: string;
  title: string;
}

export interface LobeChatGroupChatConfig {
  allowDM: boolean;
  enableSupervisor: boolean;
  maxResponseInRow: number;
  orchestratorModel: string;
  orchestratorProvider: string;
  responseOrder: 'sequential' | 'natural';
  responseSpeed: 'slow' | 'medium' | 'fast';
  revealDM: boolean;
  scene: 'casual' | 'productive';
  systemPrompt?: string;
}

// Database config type (flat structure)
export type LobeChatGroupConfig = LobeChatGroupChatConfig;

// Full group type with nested structure for UI components
export interface LobeChatGroupFullConfig {
  chat: LobeChatGroupChatConfig;
  meta: LobeChatGroupMetaConfig;
}

// Chat Group Agent types (independent from schema)
export interface ChatGroupAgent {
  agentId: string;
  chatGroupId: string;
  createdAt: Date;
  enabled?: boolean;
  order?: number;
  role?: string;
  updatedAt: Date;
  userId: string;
}

export interface NewChatGroupAgent {
  agentId: string;
  chatGroupId: string;
  enabled?: boolean;
  order?: number;
  role?: string;
  userId: string;
}

// Chat Group Item type (independent from schema)
export interface ChatGroupItem {
  accessedAt?: Date;
  clientId?: string | null;
  config?: LobeChatGroupConfig | null;
  createdAt: Date;
  description?: string | null;
  groupId?: string | null;
  id: string;
  pinned?: boolean | null;
  title?: string | null;
  updatedAt: Date;
  userId: string;
}

// Agent item with group role info
export type AgentGroupMember = AgentItem & {
  /**
   * Whether this agent is the supervisor of the group
   */
  isSupervisor: boolean;
};

// Agent Group Detail - extends ChatGroupItem with agents
export interface AgentGroupDetail extends ChatGroupItem {
  agents: AgentGroupMember[];
  /**
   * The supervisor agent ID, if exists
   */
  supervisorAgentId?: string;
}
