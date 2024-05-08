/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY_SELECT_MODE?: string;

      // OpenAI Provider
      ENABLED_OPENAI?: string;
      OPENAI_API_KEY?: string;
      OPENAI_PROXY_URL?: string;
      OPENAI_MODEL_LIST?: string;
      OPENAI_ENABLED_MODELS?: string;
      OPENAI_FUNCTION_REGIONS?: string;

      // Azure OpenAI Provider
      AZURE_API_KEY?: string;
      AZURE_ENDPOINT?: string;
      AZURE_API_VERSION?: string;

      // ZhiPu Provider
      ENABLED_ZHIPU?: string;
      ZHIPU_API_KEY?: string;
      ZHIPU_PROXY_URL?: string;

      // Google Provider
      ENABLED_GOOGLE?: string;
      GOOGLE_API_KEY?: string;
      GOOGLE_PROXY_URL?: string;

      // Moonshot Provider
      ENABLED_MOONSHOT?: string;
      MOONSHOT_API_KEY?: string;
      MOONSHOT_PROXY_URL?: string;

      // Perplexity Provider
      ENABLED_PERPLEXITY?: string;
      PERPLEXITY_API_KEY?: string;

      // Anthropic Provider
      ENABLED_ANTHROPIC?: string;
      ANTHROPIC_API_KEY?: string;
      ANTHROPIC_PROXY_URL?: string;

      // Minimax Provider
      ENABLED_MINIMAX?: string;
      MINIMAX_API_KEY?: string;

      // Mistral Provider
      ENABLED_MISTRAL?: string;
      MISTRAL_API_KEY?: string;

      // Groq Provider
      ENABLED_GROQ?: string;
      GROQ_API_KEY?: string;

      // OpenRouter Provider
      ENABLED_OPENROUTER?: string;
      OPENROUTER_API_KEY?: string;
      OPENROUTER_MODEL_LIST?: string;

      // ZeroOne Provider
      ENABLED_ZEROONE?: string;
      ZEROONE_API_KEY?: string;

      // TogetherAI Provider
      ENABLED_TOGETHERAI?: string;
      TOGETHERAI_API_KEY?: string;
      TOGETHERAI_MODEL_LIST?: string;

      // AWS Credentials
      AWS_REGION?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;

      // Ollama Provider;
      ENABLE_OLLAMA?: string;
      OLLAMA_PROXY_URL?: string;
      OLLAMA_MODEL_LIST?: string;

      /**
       * @deprecated
       */
      CUSTOM_MODELS?: string;
      /**
       * @deprecated
       */
      OLLAMA_CUSTOM_MODELS?: string;
      /**
       * @deprecated
       */
      OPENROUTER_CUSTOM_MODELS?: string;
    }
  }
}

export const getProviderConfig = () => {
  if (typeof process === 'undefined') {
    throw new Error('[Server Config] you are importing a server-only module outside of server');
  }

  const AZURE_API_KEY = process.env.AZURE_API_KEY || '';

  const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || '';
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';

  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

  const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY || '';

  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

  const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || '';

  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';

  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

  const ZEROONE_API_KEY = process.env.ZEROONE_API_KEY || '';

  const TOGETHERAI_API_KEY = process.env.TOGETHERAI_API_KEY || '';

  // region format: iad1,sfo1
  let regions: string[] = [];
  if (process.env.OPENAI_FUNCTION_REGIONS) {
    regions = process.env.OPENAI_FUNCTION_REGIONS.split(',');
  }

  if (process.env.CUSTOM_MODELS) {
    console.warn(
      'DEPRECATED: `CUSTOM_MODELS` is deprecated, please use `OPENAI_MODEL_LIST` instead, we will remove `CUSTOM_MODELS` in the LobeChat 1.0',
    );
  }

  if (process.env.OLLAMA_CUSTOM_MODELS) {
    console.warn(
      'DEPRECATED: `OLLAMA_CUSTOM_MODELS` is deprecated, please use `OLLAMA_MODEL_LIST` instead, we will remove `OLLAMA_CUSTOM_MODELS` in the LobeChat 1.0',
    );
  }

  if (process.env.OPENROUTER_CUSTOM_MODELS) {
    console.warn(
      'DEPRECATED: `OPENROUTER_CUSTOM_MODELS` is deprecated, please use `OPENROUTER_MODEL_LIST` instead, we will remove `OPENROUTER_CUSTOM_MODELS` in the LobeChat 1.0',
    );
  }

  return {
    API_KEY_SELECT_MODE: process.env.API_KEY_SELECT_MODE,

    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_PROXY_URL: process.env.OPENAI_PROXY_URL,
    OPENAI_MODEL_LIST: process.env.OPENAI_MODEL_LIST || process.env.CUSTOM_MODELS,
    OPENAI_FUNCTION_REGIONS: regions,

    ENABLED_AZURE_OPENAI: !!AZURE_API_KEY,
    AZURE_API_KEY,
    AZURE_API_VERSION: process.env.AZURE_API_VERSION,
    AZURE_ENDPOINT: process.env.AZURE_ENDPOINT,
    AZURE_MODEL_LIST: process.env.AZURE_MODEL_LIST,

    ENABLED_ZHIPU: !!ZHIPU_API_KEY,
    ZHIPU_API_KEY,

    ENABLED_GOOGLE: !!GOOGLE_API_KEY,
    GOOGLE_API_KEY,
    GOOGLE_PROXY_URL: process.env.GOOGLE_PROXY_URL,

    ENABLED_PERPLEXITY: !!PERPLEXITY_API_KEY,
    PERPLEXITY_API_KEY,

    ENABLED_ANTHROPIC: !!ANTHROPIC_API_KEY,
    ANTHROPIC_API_KEY,
    ANTHROPIC_PROXY_URL: process.env.ANTHROPIC_PROXY_URL,

    ENABLED_MINIMAX: !!MINIMAX_API_KEY,
    MINIMAX_API_KEY,

    ENABLED_MISTRAL: !!MISTRAL_API_KEY,
    MISTRAL_API_KEY,

    ENABLED_OPENROUTER: !!OPENROUTER_API_KEY,
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL_LIST:
      process.env.OPENROUTER_MODEL_LIST || process.env.OPENROUTER_CUSTOM_MODELS,

    ENABLED_TOGETHERAI: !!TOGETHERAI_API_KEY,
    TOGETHERAI_API_KEY,
    TOGETHERAI_MODEL_LIST: process.env.TOGETHERAI_MODEL_LIST,

    ENABLED_MOONSHOT: !!MOONSHOT_API_KEY,
    MOONSHOT_API_KEY,
    MOONSHOT_PROXY_URL: process.env.MOONSHOT_PROXY_URL,

    ENABLED_GROQ: !!GROQ_API_KEY,
    GROQ_API_KEY,

    ENABLED_ZEROONE: !!ZEROONE_API_KEY,
    ZEROONE_API_KEY,

    ENABLED_AWS_BEDROCK: !!AWS_ACCESS_KEY_ID,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',

    ENABLE_OLLAMA: process.env.ENABLE_OLLAMA as unknown as boolean,
    OLLAMA_PROXY_URL: process.env.OLLAMA_PROXY_URL || '',
    OLLAMA_MODEL_LIST: process.env.OLLAMA_MODEL_LIST || process.env.OLLAMA_CUSTOM_MODELS,
  };
};
