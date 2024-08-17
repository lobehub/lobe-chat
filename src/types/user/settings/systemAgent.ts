export interface SystemAgentItem {
  model: string;
  provider: string;
}

export interface UserSystemAgentConfig {
  agentMeta: SystemAgentItem;
  queryRewrite: SystemAgentItem;
  topic: SystemAgentItem;
  translation: SystemAgentItem;
}

export type UserSystemAgentConfigKey = keyof UserSystemAgentConfig;
