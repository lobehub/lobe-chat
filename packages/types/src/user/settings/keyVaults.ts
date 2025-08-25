export interface OpenAICompatibleKeyVault {
  apiKey?: string;
  baseURL?: string;
}

export interface FalKeyVault {
  apiKey?: string;
}

export interface AzureOpenAIKeyVault {
  apiKey?: string;
  apiVersion?: string;
  baseURL?: string;
  /**
   * @deprecated
   */
  endpoint?: string;
}

export interface AWSBedrockKeyVault {
  accessKeyId?: string;
  region?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}

export interface CloudflareKeyVault {
  apiKey?: string;
  baseURLOrAccountID?: string;
}

export interface SearchEngineKeyVaults {
  searchxng?: {
    apiKey?: string;
    baseURL?: string;
  };
}

export interface UserKeyVaults extends SearchEngineKeyVaults {
  ai21?: OpenAICompatibleKeyVault;
  ai302?: OpenAICompatibleKeyVault;
  ai360?: OpenAICompatibleKeyVault;
  aihubmix?: OpenAICompatibleKeyVault;
  akashchat?: OpenAICompatibleKeyVault;
  anthropic?: OpenAICompatibleKeyVault;
  azure?: AzureOpenAIKeyVault;
  azureai?: AzureOpenAIKeyVault;
  baichuan?: OpenAICompatibleKeyVault;
  bedrock?: AWSBedrockKeyVault;
  cloudflare?: CloudflareKeyVault;
  cohere?: OpenAICompatibleKeyVault;
  deepseek?: OpenAICompatibleKeyVault;
  fal?: FalKeyVault;
  fireworksai?: OpenAICompatibleKeyVault;
  giteeai?: OpenAICompatibleKeyVault;
  github?: OpenAICompatibleKeyVault;
  google?: OpenAICompatibleKeyVault;
  groq?: OpenAICompatibleKeyVault;
  higress?: OpenAICompatibleKeyVault;
  huggingface?: OpenAICompatibleKeyVault;
  hunyuan?: OpenAICompatibleKeyVault;
  infiniai?: OpenAICompatibleKeyVault;
  internlm?: OpenAICompatibleKeyVault;
  jina?: OpenAICompatibleKeyVault;
  lmstudio?: OpenAICompatibleKeyVault;
  lobehub?: any;
  minimax?: OpenAICompatibleKeyVault;
  mistral?: OpenAICompatibleKeyVault;
  modelscope?: OpenAICompatibleKeyVault;
  moonshot?: OpenAICompatibleKeyVault;
  novita?: OpenAICompatibleKeyVault;
  nvidia?: OpenAICompatibleKeyVault;
  ollama?: OpenAICompatibleKeyVault;
  openai?: OpenAICompatibleKeyVault;
  openrouter?: OpenAICompatibleKeyVault;
  password?: string;
  perplexity?: OpenAICompatibleKeyVault;
  ppio?: OpenAICompatibleKeyVault;
  qiniu?: OpenAICompatibleKeyVault;
  qwen?: OpenAICompatibleKeyVault;
  sambanova?: OpenAICompatibleKeyVault;
  search1api?: OpenAICompatibleKeyVault;
  sensenova?: OpenAICompatibleKeyVault;
  siliconcloud?: OpenAICompatibleKeyVault;
  spark?: OpenAICompatibleKeyVault;
  stepfun?: OpenAICompatibleKeyVault;
  taichu?: OpenAICompatibleKeyVault;
  tencentcloud?: OpenAICompatibleKeyVault;
  togetherai?: OpenAICompatibleKeyVault;
  upstage?: OpenAICompatibleKeyVault;
  v0?: OpenAICompatibleKeyVault;
  vertexai?: OpenAICompatibleKeyVault;
  vllm?: OpenAICompatibleKeyVault;
  volcengine?: OpenAICompatibleKeyVault;
  wenxin?: OpenAICompatibleKeyVault;
  xai?: OpenAICompatibleKeyVault;
  xinference?: OpenAICompatibleKeyVault;
  zeroone?: OpenAICompatibleKeyVault;
  zhipu?: OpenAICompatibleKeyVault;
}
