/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_CODE?: string;
      CUSTOM_MODELS?: string;

      // OpenAI Model
      OPENAI_API_KEY?: string;
      OPENAI_PROXY_URL?: string;

      // Azure OpenAI Model
      AZURE_API_KEY?: string;
      AZURE_API_VERSION?: string;
      USE_AZURE_OPENAI?: string;

      // ZhiPu Model
      ZHIPU_API_KEY?: string;

      // AWS Credentials
      AWS_REGION?: string;
      AWS_ACCESS_KEY_ID?: string;
      AWS_SECRET_ACCESS_KEY?: string;

      IMGUR_CLIENT_ID?: string;

      METADATA_BASE_URL?: string;

      AGENTS_INDEX_URL?: string;

      PLUGINS_INDEX_URL?: string;
      PLUGIN_SETTINGS?: string;
    }
  }
}

// we apply a free imgur app to get a client id
// refs: https://apidocs.imgur.com/
const DEFAULT_IMAGUR_CLIENT_ID = 'e415f320d6e24f9';

export const getServerConfig = () => {
  if (typeof process === 'undefined') {
    throw new Error('[Server Config] you are importing a server-only module outside of server');
  }

  // region format: iad1,sfo1
  let regions: string[] = [];
  if (process.env.OPENAI_FUNCTION_REGIONS) {
    regions = process.env.OPENAI_FUNCTION_REGIONS.split(',');
  }

  const ACCESS_CODES = process.env.ACCESS_CODE?.split(',').filter(Boolean) || [];

  const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;

  return {
    ACCESS_CODES,
    CUSTOM_MODELS: process.env.CUSTOM_MODELS,

    SHOW_ACCESS_CODE_CONFIG: !!ACCESS_CODES.length,

    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_PROXY_URL: process.env.OPENAI_PROXY_URL,
    OPENAI_FUNCTION_REGIONS: regions,

    ENABLED_ZHIPU: !!ZHIPU_API_KEY,
    ZHIPU_API_KEY,

    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,

    METADATA_BASE_URL: process.env.METADATA_BASE_URL,

    AZURE_API_KEY: process.env.AZURE_API_KEY,
    AZURE_API_VERSION: process.env.AZURE_API_VERSION,
    USE_AZURE_OPENAI: process.env.USE_AZURE_OPENAI === '1',

    IMGUR_CLIENT_ID: process.env.IMGUR_CLIENT_ID || DEFAULT_IMAGUR_CLIENT_ID,

    AGENTS_INDEX_URL: !!process.env.AGENTS_INDEX_URL
      ? process.env.AGENTS_INDEX_URL
      : 'https://chat-agents.lobehub.com',

    PLUGINS_INDEX_URL: !!process.env.PLUGINS_INDEX_URL
      ? process.env.PLUGINS_INDEX_URL
      : 'https://chat-plugins.lobehub.com',

    PLUGIN_SETTINGS: process.env.PLUGIN_SETTINGS,
  };
};
