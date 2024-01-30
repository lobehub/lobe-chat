export type CustomModels = { displayName: string; name: string }[];

export interface OpenAIConfig {
  OPENAI_API_KEY: string;
  azureApiVersion?: string;
  /**
   * custom mode name for fine-tuning or openai like model
   */
  customModelName?: string;
  endpoint?: string;
  models?: string[];
  useAzure?: boolean;
}

export interface GlobalLLMConfig {
  openAI: OpenAIConfig;
}
