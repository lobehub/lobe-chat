import pkg from '@/../package.json';
import { getClientConfig } from '@/config/client';

export const CURRENT_VERSION = pkg.version;

export const isServerMode = getClientConfig().ENABLED_SERVER_SERVICE;
