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
