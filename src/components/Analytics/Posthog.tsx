'use client';

import posthog from 'posthog-js';
import { FC, memo, useEffect } from 'react';

import { getClientConfig } from '@/config/client';

const { POSTHOG_HOST, POSTHOG_KEY, POSTHOG_DEBUG } = getClientConfig();

const PostHog: FC = memo(() => {
  useEffect(() => {
    if (!POSTHOG_KEY) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST ?? 'https://app.posthog.com',
      debug: POSTHOG_DEBUG,
    });
  }, []);

  return null;
});

export default PostHog;
