import { appEnv } from '@/config/app';
import { getDBInstance } from '@/database/core/web-server';
import { oidcEnv } from '@/envs/oidc';
import { createOIDCProvider } from '@/libs/oidc-provider/provider';

/**
 * OIDC Provider 实例
 */
let provider: any;

/**
 * 获取 OIDC Provider 实例
 * @returns OIDC Provider 实例
 */
export const getOIDCProvider = async () => {
  if (!provider) {
    if (!oidcEnv.ENABLE_OIDC) {
      throw new Error('OIDC is not enabled. Set ENABLE_OIDC=1 to enable it.');
    }

    const baseUrl = appEnv.APP_URL!;
    const db = getDBInstance();
    provider = await createOIDCProvider(db, baseUrl);
  }

  return provider;
};
