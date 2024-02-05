/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_CODE?: string;

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

export const getAppConfig = () => {
  if (typeof process === 'undefined') {
    throw new Error('[Server Config] you are importing a server-only module outside of server');
  }

  const ACCESS_CODES = process.env.ACCESS_CODE?.split(',').filter(Boolean) || [];

  return {
    ACCESS_CODES,

    SHOW_ACCESS_CODE_CONFIG: !!ACCESS_CODES.length,

    METADATA_BASE_URL: process.env.METADATA_BASE_URL,

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
