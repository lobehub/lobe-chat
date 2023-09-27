'use client';

import { Analytics } from '@vercel/analytics/react';
import { memo } from 'react';

import { getClientConfig } from '@/config/client';

const { VERCEL_DEBUG } = getClientConfig();

const VercelAnalytics = memo(() => <Analytics debug={VERCEL_DEBUG} />);

export default VercelAnalytics;
