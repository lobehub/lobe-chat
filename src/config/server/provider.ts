/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      CUSTOM_MODELS?: string;

      API_KEY_SELECT_MODE?: string;

      // OpenAI Provider
      OPENAI_API_KEY?: string;
      OPENAI_PROXY_URL?: string;
      OPENAI_FUNCTION_REGIONS?: string;

      // Azure OpenAI Provider
      AZURE_API_KEY?: string;
      AZURE_ENDPOINT?: string;
      AZURE_API_VERSION?: string;
      USE_AZURE_OPENAI?: string;

      // ZhiPu Provider
      ZHIPU_API_KEY?: string;
      ZHIPU_PROXY_URL?: string;

      // Google Provider
      GOOGLE_API_KEY?: string;

      // Moonshot Provider
      MOONSHOT_API_KEY?: string;
      MOONSHOT_PROXY_URL?: string;

      // Perplexity Provider
      PERPLEXITY_API_KEY?: string;

      // Anthropic Provider
      ANTHROPIC_API_KEY?: string;
      ANTHROPIC_PROXY_URL?: string;

      // Mistral Provider
      MISTRAL_API_KEY?: string;

      // Groq Provider
      GROQ_API_KEY?: string;

      // OpenRouter Provider
      OPENROUTER_API_KEY?: string;

      // ZeroOne Provider
      ZEROONE_API_KEY?: string;

      // AWS Credentials
      AWS_REGION?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;

      // Ollama Provider;
      OLLAMA_PROXY_URL?: string;
      OLLAMA_CUSTOM_MODELS?: string;
    }
  }
}

export const getProviderConfig = () => {
  if (typeof process === 'undefined') {
    throw new Error('[Server Config] you are importing a server-only module outside of server');
  }

  const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || '';
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';

  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

  const MOONSHOT_API_KEY = process.env.MOONSHOT_API_KEY || '';

  const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';

  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';

  const ZEROONE_API_KEY = process.env.ZEROONE_API_KEY || '';

  // region format: iad1,sfo1
  let regions: string[] = [];
  if (process.env.OPENAI_FUNCTION_REGIONS) {
    regions = process.env.OPENAI_FUNCTION_REGIONS.split(',');
  }

  return {
    CUSTOM_MODELS: process.env.CUSTOM_MODELS,

    API_KEY_SELECT_MODE: process.env.API_KEY_SELECT_MODE,

    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_PROXY_URL: process.env.OPENAI_PROXY_URL,
    OPENAI_FUNCTION_REGIONS: regions,

    ENABLED_ZHIPU: !!ZHIPU_API_KEY,
    ZHIPU_API_KEY,

    ENABLED_GOOGLE: !!GOOGLE_API_KEY,
    GOOGLE_API_KEY,

    ENABLED_PERPLEXITY: !!PERPLEXITY_API_KEY,
    PERPLEXITY_API_KEY,

    ENABLED_ANTHROPIC: !!ANTHROPIC_API_KEY,
    ANTHROPIC_API_KEY,
    ANTHROPIC_PROXY_URL: process.env.ANTHROPIC_PROXY_URL,

    ENABLED_MISTRAL: !!MISTRAL_API_KEY,
    MISTRAL_API_KEY,

    ENABLED_OPENROUTER: !!OPENROUTER_API_KEY,
    OPENROUTER_API_KEY,

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

    AZURE_API_KEY: process.env.AZURE_API_KEY,
    AZURE_API_VERSION: process.env.AZURE_API_VERSION,
    AZURE_ENDPOINT: process.env.AZURE_ENDPOINT,
    USE_AZURE_OPENAI: process.env.USE_AZURE_OPENAI === '1',

    ENABLE_OLLAMA: !!process.env.OLLAMA_PROXY_URL,
    OLLAMA_PROXY_URL: process.env.OLLAMA_PROXY_URL || '',
    OLLAMA_CUSTOM_MODELS: process.env.OLLAMA_CUSTOM_MODELS,
  };
};
