import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import Script from 'next/script';

import { getClientConfig } from '@/config/client';

const { PLAUSIBLE_DOMAIN, ANALYTICS_PLAUSIBLE } = getClientConfig();
const Analytics = () => {
  return (
    <>
      <VercelAnalytics />
      {ANALYTICS_PLAUSIBLE && PLAUSIBLE_DOMAIN && (
        <Script data-domain={PLAUSIBLE_DOMAIN} defer src="https://plausible.io/js/script.js" />
      )}
    </>
  );
};

export default Analytics;
