/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      // Vercel Analytics
      ENABLE_VERCEL_ANALYTICS?: string;
      DEBUG_VERCEL_ANALYTICS?: string;

      // Google Analytics
      ENABLE_GOOGLE_ANALYTICS?: string;
      GOOGLE_ANALYTICS_MEASUREMENT_ID?: string;
    }
  }
}

export const getAnalyticsConfig = () => {
  if (typeof process === 'undefined') {
    throw new Error('[Server Config] you are importing a server-only module outside of server');
  }

  return {
    // Vercel Analytics
    ENABLE_VERCEL_ANALYTICS: process.env.ENABLE_VERCEL_ANALYTICS === '1',
    VERCEL_DEBUG: process.env.DEBUG_VERCEL_ANALYTICS === '1',

    // Google Analytics
    ENABLE_GOOGLE_ANALYTICS: process.env.ENABLE_GOOGLE_ANALYTICS === '1',
    GOOGLE_ANALYTICS_MEASUREMENT_ID: process.env.GOOGLE_ANALYTICS_MEASUREMENT_ID,
  };
};
