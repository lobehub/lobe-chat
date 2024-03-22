import { Analytics } from '@vercel/analytics/react';
import { memo } from 'react';

import { getServerConfig } from '@/config/server';

const { VERCEL_DEBUG } = getServerConfig();

const VercelAnalytics = memo(() => <Analytics debug={VERCEL_DEBUG} />);

export default VercelAnalytics;
