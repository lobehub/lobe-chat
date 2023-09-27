'use client';

import mixpanel from 'mixpanel-browser';
import { memo, useEffect } from 'react';

import { getClientConfig } from '@/config/client';

const { MIXPANEL_PROJECT_TOKEN, MIXPANEL_DEBUG } = getClientConfig();

const MixpanelAnalytics = memo(() => {
  useEffect(() => {
    if (!MIXPANEL_PROJECT_TOKEN) return;

    mixpanel.init(MIXPANEL_PROJECT_TOKEN, {
      debug: MIXPANEL_DEBUG,
      persistence: 'localStorage',
      track_pageview: true,
    });
  }, []);
  return null;
});

export default MixpanelAnalytics;
