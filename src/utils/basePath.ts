import { appEnv } from '@/envs/app';

export const withBasePath = (path: string) => appEnv.NEXT_PUBLIC_BASE_PATH + path;
