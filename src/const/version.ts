import pkg from '@/../package.json';
import { getServerDBConfig } from '@/config/db';

export const CURRENT_VERSION = pkg.version;

export const isServerMode = getServerDBConfig().NEXT_PUBLIC_ENABLED_SERVER_SERVICE;
