'use client';

import Script from 'next/script';
import { memo } from 'react';

import { getClientConfig } from '@/config/client';

const { PLAUSIBLE_DOMAIN } = getClientConfig();

const PlausibleAnalytics = memo(() => {
  return (
    PLAUSIBLE_DOMAIN && (
      <Script data-domain={PLAUSIBLE_DOMAIN} defer src="https://plausible.io/js/script.js" />
    )
  );
});

export default PlausibleAnalytics;
