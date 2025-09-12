export interface LobeChatGroupMetaConfig {
  description: string;
  title: string;
}

export interface LobeChatGroupChatConfig {
  maxResponseInRow: number;
  orchestratorModel: string;
  orchestratorProvider: string;
  responseOrder: 'sequential' | 'natural';
  responseSpeed: 'slow' | 'medium' | 'fast';
  revealDM: boolean;
  systemPrompt?: string;
}

// Database config type (flat structure)
export type LobeChatGroupConfig = LobeChatGroupChatConfig;

// Full group type with nested structure for UI components
export interface LobeChatGroupFullConfig {
  chat: LobeChatGroupChatConfig;
  meta: LobeChatGroupMetaConfig;
}
