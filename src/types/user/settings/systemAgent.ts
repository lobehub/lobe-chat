export interface GlobalTranslationConfig {
  model: string;
  provider: string;
}

export interface UserSystemAgentConfig {
  translation: GlobalTranslationConfig;
}
