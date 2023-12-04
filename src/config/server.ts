/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_CODE?: string;

      OPENAI_API_KEY?: string;
      OPENAI_PROXY_URL?: string;

      AZURE_API_KEY?: string;
      AZURE_API_VERSION?: string;
      USE_AZURE_OPENAI?: string;

      IMGUR_CLIENT_ID?: string;
    }
  }
}

// we apply a free imgur app to get a client id
// refs: https://apidocs.imgur.com/
const DEFAULT_IMAGUR_CLIENT_ID = 'e415f320d6e24f9';

export const getServerConfig = () => {
  if (typeof process === 'undefined') {
    throw new Error('[Server Config] you are importing a nodejs-only module outside of nodejs');
  }

  // region format: iad1,sfo1
  let regions: string[] = [];
  if (process.env.OPENAI_FUNCTION_REGIONS) {
    regions = process.env.OPENAI_FUNCTION_REGIONS.split(',');
  }

  const ACCESS_CODE = process.env.ACCESS_CODE;

  return {
    ACCESS_CODE,

    SHOW_ACCESS_CODE_CONFIG: !!ACCESS_CODE,

    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_PROXY_URL: process.env.OPENAI_PROXY_URL,
    OPENAI_FUNCTION_REGIONS: regions,

    AZURE_API_KEY: process.env.AZURE_API_KEY,
    AZURE_API_VERSION: process.env.AZURE_API_VERSION,
    USE_AZURE_OPENAI: process.env.USE_AZURE_OPENAI === '1',

    IMGUR_CLIENT_ID: process.env.IMGUR_CLIENT_ID || DEFAULT_IMAGUR_CLIENT_ID,
  };
};
