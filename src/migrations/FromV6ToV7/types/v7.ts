

interface OpenAICompatibleKeyVault {
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

export interface V7KeyVaults {
  anthropic: OpenAICompatibleKeyVault;
  azure: AzureOpenAIKeyVault;
  bedrock: AWSBedrockKeyVault;
  deepseek: OpenAICompatibleKeyVault;
  google: OpenAICompatibleKeyVault;
  groq: OpenAICompatibleKeyVault;
  minimax: OpenAICompatibleKeyVault;
  mistral: OpenAICompatibleKeyVault;
  moonshot: OpenAICompatibleKeyVault;
  ollama: OpenAICompatibleKeyVault;
  openai: OpenAICompatibleKeyVault;
  openrouter: OpenAICompatibleKeyVault;
  password: string;
  perplexity: OpenAICompatibleKeyVault;
  togetherai: OpenAICompatibleKeyVault;
  zeroone: OpenAICompatibleKeyVault;
  zhipu: OpenAICompatibleKeyVault;
}

interface V7ProviderConfig {
  autoFetchModelLists?: boolean;
  customModelCards?: any[];
  enabled: boolean;
  enabledModels?: string[] | null;
  fetchOnClient?: boolean;
  latestFetchTime?: number;
  remoteModelCards?: any[];
}

export type V7ModelProviderConfig = Record<string, V7ProviderConfig>;

export interface V7GeneralSettings {
  fontSize: number;
  language: string;
  neutralColor?: string;
  primaryColor?: string;
  themeMode: string;
}

export interface V7Settings {
  defaultAgent: any;
  general: V7GeneralSettings;
  keyVaults: V7KeyVaults;
  languageModel?: V7ModelProviderConfig;
  sync: any;
  tool: any;
  tts: any;
}

export interface V7ConfigState {
  settings?: V7Settings;
}
