// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  dsn: 'https://4d07958ed9716d7f4443d7d3fb176b37@o4506913437712384.ingest.us.sentry.io/4506913439612928',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',
});
