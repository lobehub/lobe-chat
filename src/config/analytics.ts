/* eslint-disable sort-keys-fix/sort-keys-fix */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * @deprecated
       */
      NEXT_PUBLIC_ANALYTICS_PLAUSIBLE?: string;
      /**
       * @deprecated
       */
      NEXT_PUBLIC_ANALYTICS_POSTHOG: string;
      /**
       * @deprecated
       */
      NEXT_PUBLIC_PLAUSIBLE_DOMAIN?: string;

      /**
       * @deprecated
       */
      NEXT_PUBLIC_PLAUSIBLE_SCRIPT_BASE_URL?: string;
      /**
       * @deprecated
       */
      NEXT_PUBLIC_POSTHOG_HOST: string;
      /**
       * @deprecated
       */
      NEXT_PUBLIC_POSTHOG_KEY: string;

      /**
       * @deprecated
       */
      NEXT_PUBLIC_UMAMI_SCRIPT_URL?: string;
      /**
       * @deprecated
       */
      NEXT_PUBLIC_UMAMI_WEBSITE_ID?: string;
    }
  }
}

export const getAnalyticsConfig = () => {
  if (process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_BASE_URL) {
    console.warn(
      'NEXT_PUBLIC_PLAUSIBLE_SCRIPT_BASE_URL is deprecated. Please use PLAUSIBLE_SCRIPT_BASE_URL instead. We will remove it in LobeChat 1.0',
    );
  }
  if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
    console.warn(
      'NEXT_PUBLIC_PLAUSIBLE_DOMAIN is deprecated. Please use PLAUSIBLE_DOMAIN instead. We will remove it in LobeChat 1.0',
    );
  }

  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn(
      'NEXT_PUBLIC_POSTHOG_KEY is deprecated. Please use POSTHOG_KEY instead. We will remove it in LobeChat 1.0',
    );
  }
  if (process.env.NEXT_PUBLIC_POSTHOG_HOST) {
    console.warn(
      'NEXT_PUBLIC_POSTHOG_HOST is deprecated. Please use POSTHOG_HOST instead. We will remove it in LobeChat 1.0',
    );
  }

  if (process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL) {
    console.warn(
      'NEXT_PUBLIC_UMAMI_SCRIPT_URL is deprecated. Please use UMAMI_SCRIPT_URL instead. We will remove it in LobeChat 1.0',
    );
  }
  if (process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) {
    console.warn(
      'NEXT_PUBLIC_UMAMI_WEBSITE_ID is deprecated. Please use UMAMI_WEBSITE_ID instead. We will remove it in LobeChat 1.0',
    );
  }

  return createEnv({
    server: {
      ENABLED_PLAUSIBLE_ANALYTICS: z.boolean(),
      PLAUSIBLE_SCRIPT_BASE_URL: z.string(),
      PLAUSIBLE_DOMAIN: z.string().optional(),

      ENABLED_POSTHOG_ANALYTICS: z.boolean(),
      POSTHOG_KEY: z.string().optional(),
      POSTHOG_HOST: z.string(),
      DEBUG_POSTHOG_ANALYTICS: z.boolean(),

      ENABLED_UMAMI_ANALYTICS: z.boolean(),
      UMAMI_WEBSITE_ID: z.string().optional(),
      UMAMI_SCRIPT_URL: z.string(),

      ENABLED_CLARITY_ANALYTICS: z.boolean(),
      CLARITY_PROJECT_ID: z.string().optional(),

      ENABLE_VERCEL_ANALYTICS: z.boolean(),
      DEBUG_VERCEL_ANALYTICS: z.boolean(),

      ENABLE_GOOGLE_ANALYTICS: z.boolean(),
      GOOGLE_ANALYTICS_MEASUREMENT_ID: z.string().optional(),
    },
    runtimeEnv: {
      // Plausible Analytics
      ENABLED_PLAUSIBLE_ANALYTICS:
        !!process.env.PLAUSIBLE_DOMAIN || !!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      PLAUSIBLE_DOMAIN: process.env.PLAUSIBLE_DOMAIN || process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      PLAUSIBLE_SCRIPT_BASE_URL:
        process.env.PLAUSIBLE_SCRIPT_BASE_URL ||
        process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_BASE_URL ||
        'https://plausible.io',

      // Posthog Analytics
      ENABLED_POSTHOG_ANALYTICS: !!process.env.POSTHOG_KEY || !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
      POSTHOG_KEY: process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY,
      POSTHOG_HOST:
        process.env.POSTHOG_HOST ||
        process.env.NEXT_PUBLIC_POSTHOG_HOST ||
        'https://app.posthog.com',
      DEBUG_POSTHOG_ANALYTICS: process.env.DEBUG_POSTHOG_ANALYTICS === '1',

      // Umami Analytics
      ENABLED_UMAMI_ANALYTICS:
        !!process.env.UMAMI_WEBSITE_ID || !!process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
      UMAMI_SCRIPT_URL:
        process.env.UMAMI_SCRIPT_URL ||
        process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ||
        'https://analytics.umami.is/script.js',
      UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,

      // Clarity Analytics
      ENABLED_CLARITY_ANALYTICS: !!process.env.CLARITY_PROJECT_ID,
      CLARITY_PROJECT_ID: process.env.CLARITY_PROJECT_ID,

      // Vercel Analytics
      ENABLE_VERCEL_ANALYTICS: process.env.ENABLE_VERCEL_ANALYTICS === '1',
      DEBUG_VERCEL_ANALYTICS: process.env.DEBUG_VERCEL_ANALYTICS === '1',

      // Google Analytics
      ENABLE_GOOGLE_ANALYTICS: !!process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID,
      GOOGLE_ANALYTICS_MEASUREMENT_ID: process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID,
    },
  });
};

export const analyticsEnv = getAnalyticsConfig();
