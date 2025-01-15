export interface OpenAICompatibleKeyVault {
  apiKey?: string;
  baseURL?: string;
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

export interface WenxinKeyVault {
  accessKey?: string;
  secretKey?: string;
}

export interface UserKeyVaults {
  ai21?: OpenAICompatibleKeyVault;
  ai360?: OpenAICompatibleKeyVault;
  anthropic?: OpenAICompatibleKeyVault;
  azure?: AzureOpenAIKeyVault;
  baichuan?: OpenAICompatibleKeyVault;
  bedrock?: AWSBedrockKeyVault;
  cloudflare?: CloudflareKeyVault;
  deepseek?: OpenAICompatibleKeyVault;
  fireworksai?: OpenAICompatibleKeyVault;
  giteeai?: OpenAICompatibleKeyVault;
  github?: OpenAICompatibleKeyVault;
  google?: OpenAICompatibleKeyVault;
  groq?: OpenAICompatibleKeyVault;
  higress?: OpenAICompatibleKeyVault;
  huggingface?: OpenAICompatibleKeyVault;
  hunyuan?: OpenAICompatibleKeyVault;
  internlm?: OpenAICompatibleKeyVault;
  lmstudio?: OpenAICompatibleKeyVault;
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
  sensenova?: OpenAICompatibleKeyVault;
  siliconcloud?: OpenAICompatibleKeyVault;
  spark?: OpenAICompatibleKeyVault;
  stepfun?: OpenAICompatibleKeyVault;
  taichu?: OpenAICompatibleKeyVault;
  togetherai?: OpenAICompatibleKeyVault;
  upstage?: OpenAICompatibleKeyVault;
  wenxin?: WenxinKeyVault;
  xai?: OpenAICompatibleKeyVault;
  zeroone?: OpenAICompatibleKeyVault;
  zhipu?: OpenAICompatibleKeyVault;
}
