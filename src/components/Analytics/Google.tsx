import { GoogleAnalytics as GA } from '@next/third-parties/google';

import { getServerConfig } from '@/config/server';

const { GOOGLE_ANALYTICS_MEASUREMENT_ID, ENABLE_GOOGLE_ANALYTICS } = getServerConfig();

if (ENABLE_GOOGLE_ANALYTICS && !GOOGLE_ANALYTICS_MEASUREMENT_ID)
  throw new Error(
    'You have enable the google analytics but not provided the google analytics id. Please provide the google analytics id in your env',
  );

const GoogleAnalytics = () => <GA gaId={GOOGLE_ANALYTICS_MEASUREMENT_ID!} />;

export default GoogleAnalytics;
