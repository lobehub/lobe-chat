'use client';

import Script from 'next/script';
import { memo } from 'react';

import { getClientConfig } from '@/config/client';

const { PLAUSIBLE_DOMAIN, PLAUSIBLE_SCRIPT_BASE_URL } = getClientConfig();

const PlausibleAnalytics = memo(
  () =>
    PLAUSIBLE_DOMAIN && (
      <Script
        data-domain={PLAUSIBLE_DOMAIN}
        defer
        src={`${PLAUSIBLE_SCRIPT_BASE_URL}/js/script.js`}
      />
    ),
);

export default PlausibleAnalytics;
