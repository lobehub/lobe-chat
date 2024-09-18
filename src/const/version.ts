import pkg from '@/../package.json';
import { getServerDBConfig } from '@/config/db';

import { BRANDING_NAME } from './branding';

export const CURRENT_VERSION = pkg.version;

export const isServerMode = getServerDBConfig().NEXT_PUBLIC_ENABLED_SERVER_SERVICE;

// @ts-ignore
export const isCustomBranding = BRANDING_NAME !== 'LobeChat';
