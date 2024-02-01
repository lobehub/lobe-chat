export type CustomModels = { displayName: string; id: string }[];

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

export interface ZhiPuConfig {
  ZHIPU_API_KEY?: string;
  enabled: boolean;
}

export interface GoogleConfig {
  GOOGLE_API_KEY?: string;
  enabled: boolean;
}

export interface AWSBedrockConfig {
  AWS_ACCESS_KEY_ID?: string;
  AWS_REGION?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  enabled: boolean;
}

export interface GlobalLLMConfig {
  bedrock: AWSBedrockConfig;
  google: GoogleConfig;
  openAI: OpenAIConfig;
  zhipu: ZhiPuConfig;
}
