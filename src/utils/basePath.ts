import { getClientConfig } from '@/config/client';

export const withBasePath = (path: string) => getClientConfig().BASE_PATH + path;
