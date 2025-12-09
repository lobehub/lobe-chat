import { redisEnv } from '@/envs/redis';

export const isEnableAgent = (): boolean => !redisEnv.REDIS_URL;
