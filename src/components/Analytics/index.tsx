import dynamic from 'next/dynamic';

import { getClientConfig } from '@/config/client';
import { getServerConfig } from '@/config/server';

import Google from './Google';
import Vercel from './Vercel';

const Plausible = dynamic(() => import('./Plausible'), { ssr: false });
const Posthog = dynamic(() => import('./Posthog'), { ssr: false });
const Umami = dynamic(() => import('./Umami'), { ssr: false });

const { ANALYTICS_POSTHOG, ANALYTICS_PLAUSIBLE, ANALYTICS_UMAMI } = getClientConfig();

const { ENABLE_VERCEL_ANALYTICS, ENABLE_GOOGLE_ANALYTICS } = getServerConfig();

const Analytics = () => {
  return (
    <>
      {ENABLE_VERCEL_ANALYTICS && <Vercel />}
      {ENABLE_GOOGLE_ANALYTICS && <Google />}
      {ANALYTICS_PLAUSIBLE && <Plausible />}
      {ANALYTICS_POSTHOG && <Posthog />}
      {ANALYTICS_UMAMI && <Umami />}
    </>
  );
};

export default Analytics;
