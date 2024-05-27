export interface SystemAgentItem {
  model: string;
  provider: string;
}

export interface UserSystemAgentConfig {
  topic: SystemAgentItem;
  translation: SystemAgentItem;
}
