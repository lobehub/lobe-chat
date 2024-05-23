export interface GlobalTranslationConfig {
  model: string;
  provider: string;
}

export interface GlobalSystemAgentConfig {
  translation: GlobalTranslationConfig;
}
