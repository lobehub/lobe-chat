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
  jina?: OpenAICompatibleKeyVault;
  searchxng?: {
    apiKey?: string;
    baseURL?: string;
  };
}

export interface UserKeyVaults extends SearchEngineKeyVaults {
  password?: string;
}
