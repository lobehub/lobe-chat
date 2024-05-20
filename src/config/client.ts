/**
 * the client config is only used in Vercel deployment
 */

/* eslint-disable sort-keys-fix/sort-keys-fix , typescript-sort-keys/interface */

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_I18N_DEBUG: string;
      NEXT_PUBLIC_I18N_DEBUG_BROWSER: string;
      NEXT_PUBLIC_I18N_DEBUG_SERVER: string;

      NEXT_PUBLIC_DEVELOPER_DEBUG: string;

      NEXT_PUBLIC_SERVICE_MODE?: 'server' | 'browser';
    }
  }
}

export const getClientConfig = () => ({
  ENABLED_SERVER_SERVICE: process.env.NEXT_PUBLIC_SERVICE_MODE === 'server',

  BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Sentry
  ENABLE_SENTRY: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // i18n debug mode
  I18N_DEBUG: process.env.NEXT_PUBLIC_I18N_DEBUG === '1',
  I18N_DEBUG_BROWSER: process.env.NEXT_PUBLIC_I18N_DEBUG_BROWSER === '1',
  I18N_DEBUG_SERVER: process.env.NEXT_PUBLIC_I18N_DEBUG_SERVER === '1',

  // developer debug mode
  DEBUG_MODE: process.env.NEXT_PUBLIC_DEVELOPER_DEBUG === '1',
});
