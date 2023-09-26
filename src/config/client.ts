/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      AGENTS_INDEX_URL?: string;
      PLUGINS_INDEX_URL?: string;

      ANALYTICS_VERCEL?: string;
      ANALYTICS_MIXPANEL?: string;
      ANALYTICS_PLAUSIBLE?: string;

      MIXPANEL_PROJECT_TOKEN?: string;
    }
  }
}

export const getClientConfig = () => ({
  AGENTS_INDEX_URL: process.env.AGENTS_INDEX_URL,
  PLUGINS_INDEX_URL: process.env.PLUGINS_INDEX_URL,

  ANALYTICS_VERCEL: process.env.ANALYTICS_VERCEL,
  ANALYTICS_MIXPANEL: process.env.ANALYTICS_MIXPANEL === '1',
  ANALYTICS_PLAUSIBLE: process.env.ANALYTICS_PLAUSIBLE === '1',

  PLAUSIBLE_DOMAIN: process.env.PLAUSIBLE_DOMAIN,
  MIXPANEL_PROJECT_TOKEN: process.env.ANALYTICS_MIXPANEL,
});
