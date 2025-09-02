import { Analytics } from '@vercel/analytics/react';
import { memo } from 'react';

import { analyticsEnv } from '@/envs/analytics';

const VercelAnalytics = memo(() => <Analytics debug={analyticsEnv.DEBUG_VERCEL_ANALYTICS} />);

export default VercelAnalytics;
