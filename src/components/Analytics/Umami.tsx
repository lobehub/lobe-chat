'use client';

import Script from 'next/script';
import { memo } from 'react';

import { getClientConfig } from '@/config/client';

const { UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } = getClientConfig();

const UmamiAnalytics = memo(
  () =>
    UMAMI_WEBSITE_ID && <Script data-website-id={UMAMI_WEBSITE_ID} defer src={UMAMI_SCRIPT_URL} />,
);

export default UmamiAnalytics;
