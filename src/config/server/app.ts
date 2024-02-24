/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_CODE?: string;

      IMGUR_CLIENT_ID?: string;

      SITE_URL?: string;

      AGENTS_INDEX_URL?: string;

      PLUGINS_INDEX_URL?: string;
      PLUGIN_SETTINGS?: string;

      DEFAULT_AGENT_CONFIG?: string;
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

    DEFAULT_AGENT_CONFIG: process.env.DEFAULT_AGENT_CONFIG || '',

    SHOW_ACCESS_CODE_CONFIG: !!ACCESS_CODES.length,

    SITE_URL: process.env.SITE_URL,

    IMGUR_CLIENT_ID: process.env.IMGUR_CLIENT_ID || DEFAULT_IMAGUR_CLIENT_ID,

    AGENTS_INDEX_URL: !!process.env.AGENTS_INDEX_URL
      ? process.env.AGENTS_INDEX_URL
      : 'https://chat-agents.lobehub.com',

    PLUGINS_INDEX_URL: !!process.env.PLUGINS_INDEX_URL
      ? process.env.PLUGINS_INDEX_URL
      : 'https://chat-plugins.lobehub.com',

    PLUGIN_SETTINGS: process.env.PLUGIN_SETTINGS,

    ENABLE_OAUTH_SSO: !!process.env.ENABLE_OAUTH_SSO,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '',
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || '',
    AUTH0_ISSUER: process.env.AUTH0_ISSUER || '',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
  };
};
