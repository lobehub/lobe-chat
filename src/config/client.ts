/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      AGENTS_INDEX_URL?: string;
      PLUGINS_INDEX_URL?: string;

      NEXT_PUBLIC_ANALYTICS_VERCEL?: string;
      NEXT_PUBLIC_VERCEL_DEBUG?: string;

      NEXT_PUBLIC_ANALYTICS_MIXPANEL?: string;
      NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN?: string;
      NEXT_PUBLIC_MIXPANEL_DEBUG?: string;

      NEXT_PUBLIC_ANALYTICS_PLAUSIBLE?: string;
      NEXT_PUBLIC_PLAUSIBLE_DOMAIN?: string;

      NEXT_PUBLIC_ANALYTICS_POSTHOG: string;
      NEXT_PUBLIC_POSTHOG_KEY: string;
      NEXT_PUBLIC_POSTHOG_HOST: string;
      NEXT_PUBLIC_POSTHOG_DEBUG: string;
    }
  }
}

export const getClientConfig = () => ({
  AGENTS_INDEX_URL: process.env.AGENTS_INDEX_URL,
  PLUGINS_INDEX_URL: process.env.PLUGINS_INDEX_URL,

  ANALYTICS_VERCEL: process.env.NEXT_PUBLIC_ANALYTICS_VERCEL !== '0',
  VERCEL_DEBUG: process.env.NEXT_PUBLIC_VERCEL_DEBUG === '1',

  ANALYTICS_PLAUSIBLE: process.env.NEXT_PUBLIC_ANALYTICS_PLAUSIBLE === '1',
  PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,

  ANALYTICS_MIXPANEL: process.env.NEXT_PUBLIC_ANALYTICS_MIXPANEL === '1',
  MIXPANEL_PROJECT_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN,
  MIXPANEL_DEBUG: process.env.NEXT_PUBLIC_MIXPANEL_DEBUG === '1',

  ANALYTICS_POSTHOG: process.env.NEXT_PUBLIC_ANALYTICS_POSTHOG === '1',
  POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  POSTHOG_DEBUG: process.env.NEXT_PUBLIC_POSTHOG_DEBUG === '1',
});
