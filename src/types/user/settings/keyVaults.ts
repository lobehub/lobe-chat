export interface OpenAICompatibleKeyVault {
  apiKey?: string;
  baseURL?: string;
}

interface AzureOpenAIKeyVault {
  apiKey?: string;
  apiVersion?: string;
  endpoint?: string;
}

export interface AWSBedrockKeyVault {
  accessKeyId?: string;
  region?: string;
  secretAccessKey?: string;
}

export interface UserKeyVaults {
  anthropic?: OpenAICompatibleKeyVault;
  azure?: AzureOpenAIKeyVault;
  bedrock?: AWSBedrockKeyVault;
  deepseek?: OpenAICompatibleKeyVault;
  google?: OpenAICompatibleKeyVault;
  groq?: OpenAICompatibleKeyVault;
  minimax?: OpenAICompatibleKeyVault;
  mistral?: OpenAICompatibleKeyVault;
  moonshot?: OpenAICompatibleKeyVault;
  ollama?: OpenAICompatibleKeyVault;
  openai?: OpenAICompatibleKeyVault;
  openrouter?: OpenAICompatibleKeyVault;
  password?: string;
  perplexity?: OpenAICompatibleKeyVault;
  togetherai?: OpenAICompatibleKeyVault;
  zeroone?: OpenAICompatibleKeyVault;
  zhipu?: OpenAICompatibleKeyVault;
}
