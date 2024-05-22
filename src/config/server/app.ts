/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_CODE?: string;

      SITE_URL?: string;

      AGENTS_INDEX_URL?: string;

      PLUGINS_INDEX_URL?: string;
      PLUGIN_SETTINGS?: string;

      DEFAULT_AGENT_CONFIG?: string;
    }
  }
}

export const getAppConfig = () => {
  if (typeof process === 'undefined') {
    throw new Error('[Server Config] you are importing a server-only module outside of server');
  }

  const ACCESS_CODES = process.env.ACCESS_CODE?.split(',').filter(Boolean) || [];

  return {
    ACCESS_CODES,

    DEFAULT_AGENT_CONFIG: process.env.DEFAULT_AGENT_CONFIG || '',

    SITE_URL: process.env.SITE_URL,

    AGENTS_INDEX_URL: !!process.env.AGENTS_INDEX_URL
      ? process.env.AGENTS_INDEX_URL
      : 'https://chat-agents.lobehub.com',

    PLUGINS_INDEX_URL: !!process.env.PLUGINS_INDEX_URL
      ? process.env.PLUGINS_INDEX_URL
      : 'https://chat-plugins.lobehub.com',

    PLUGIN_SETTINGS: process.env.PLUGIN_SETTINGS,
  };
};
