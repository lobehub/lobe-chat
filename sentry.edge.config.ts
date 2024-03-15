// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  dsn: 'https://4d07958ed9716d7f4443d7d3fb176b37@o4506913437712384.ingest.us.sentry.io/4506913439612928',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
});
