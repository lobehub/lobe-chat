import dynamic from 'next/dynamic';

import { getClientConfig } from '@/config/client';

const Vercel = dynamic(() => import('./Vercel'), { ssr: false });
const Plausible = dynamic(() => import('./Plausible'), { ssr: false });
const Posthog = dynamic(() => import('./Posthog'), { ssr: false });

const { ANALYTICS_VERCEL, ANALYTICS_POSTHOG, ANALYTICS_PLAUSIBLE } = getClientConfig();

const Analytics = () => {
  return (
    <>
      {ANALYTICS_VERCEL && <Vercel />}
      {ANALYTICS_PLAUSIBLE && <Plausible />}
      {ANALYTICS_POSTHOG && <Posthog />}
    </>
  );
};

export default Analytics;
