import { GoogleAnalytics as GA } from '@next/third-parties/google';

import { analyticsEnv } from '@/envs/analytics';

const GoogleAnalytics = () => <GA gaId={analyticsEnv.GOOGLE_ANALYTICS_MEASUREMENT_ID!} />;

export default GoogleAnalytics;
