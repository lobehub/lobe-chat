'use client';

import Script from 'next/script';
import { memo } from 'react';

interface PlausibleAnalyticsProps {
  domain?: string;
  scriptBaseUrl: string;
}

const PlausibleAnalytics = memo<PlausibleAnalyticsProps>(
  ({ domain, scriptBaseUrl }) =>
    domain && <Script data-domain={domain} defer src={`${scriptBaseUrl}/js/script.js`} />,
);

export default PlausibleAnalytics;
