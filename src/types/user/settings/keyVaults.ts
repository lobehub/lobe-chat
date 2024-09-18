export interface OpenAICompatibleKeyVault {
  apiKey?: string;
  baseURL?: string;
}

export interface AzureOpenAIKeyVault {
  apiKey?: string;
  apiVersion?: string;
  endpoint?: string;
}

export interface AWSBedrockKeyVault {
  accessKeyId?: string;
  region?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

export interface UserKeyVaults {
  ai21?: OpenAICompatibleKeyVault;
  ai360?: OpenAICompatibleKeyVault;
  anthropic?: OpenAICompatibleKeyVault;
  azure?: AzureOpenAIKeyVault;
  baichuan?: OpenAICompatibleKeyVault;
  bedrock?: AWSBedrockKeyVault;
  deepseek?: OpenAICompatibleKeyVault;
  fireworksai?: OpenAICompatibleKeyVault;
  github?: OpenAICompatibleKeyVault;
  google?: OpenAICompatibleKeyVault;
  groq?: OpenAICompatibleKeyVault;
  lobehub?: any;
  minimax?: OpenAICompatibleKeyVault;
  mistral?: OpenAICompatibleKeyVault;
  moonshot?: OpenAICompatibleKeyVault;
  novita?: OpenAICompatibleKeyVault;
  ollama?: OpenAICompatibleKeyVault;
  openai?: OpenAICompatibleKeyVault;
  openrouter?: OpenAICompatibleKeyVault;
  password?: string;
  perplexity?: OpenAICompatibleKeyVault;
  qwen?: OpenAICompatibleKeyVault;
  siliconcloud?: OpenAICompatibleKeyVault;
  spark?: OpenAICompatibleKeyVault;
  stepfun?: OpenAICompatibleKeyVault;
  taichu?: OpenAICompatibleKeyVault;
  togetherai?: OpenAICompatibleKeyVault;
  upstage?: OpenAICompatibleKeyVault;
  zeroone?: OpenAICompatibleKeyVault;
  zhipu?: OpenAICompatibleKeyVault;
}
