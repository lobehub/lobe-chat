'use client';

import Script from 'next/script';
import { memo } from 'react';

interface UmamiAnalyticsProps {
  scriptUrl: string;
  websiteId?: string;
}

const UmamiAnalytics = memo<UmamiAnalyticsProps>(
  ({ scriptUrl, websiteId }) =>
    websiteId && <Script data-website-id={websiteId} defer src={scriptUrl} />,
);

export default UmamiAnalytics;
