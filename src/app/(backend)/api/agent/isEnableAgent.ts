import { serverDBEnv } from '@/config/db';
import { isServerMode } from '@/const/version';

export const isEnableAgent = (): boolean => {
  if (!isServerMode) return false;

  if (!serverDBEnv.REDIS_URL) return false;

  if (!serverDBEnv.QSTASH_TOKEN) return false;

  // TODO: V2 的 DB 版本默认需要 REDIS 和 QSTASH_TOKEN 了
  return true;
};
