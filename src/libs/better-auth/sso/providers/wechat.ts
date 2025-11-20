import { authEnv } from '@/envs/auth';

import type { GenericProviderDefinition } from '../types';

const WECHAT_AUTHORIZATION_URL = 'https://open.weixin.qq.com/connect/qrconnect';
const WECHAT_TOKEN_PROXY_PATH = '/api/auth/wechat/token';
const WECHAT_USERINFO_URL = 'https://api.weixin.qq.com/sns/userinfo';

const ensureBaseURL = () => {
  const baseUrl = authEnv.NEXT_PUBLIC_BETTER_AUTH_URL?.trim();
  if (!baseUrl) {
    throw new Error('[Better-Auth] NEXT_PUBLIC_BETTER_AUTH_URL is required for WeChat SSO');
  }
  return baseUrl.replace(/\/$/, '');
};

const extractWechatMetadata = (scopes: string[] | undefined, key: string) => {
  const record = scopes?.find((item) => item.startsWith(`${key}:`));
  return record?.slice(key.length + 1);
};

const provider: GenericProviderDefinition = {
  build: () => {
    const clientId = authEnv.AUTH_WECHAT_ID!;
    const clientSecret = authEnv.AUTH_WECHAT_SECRET!;
    const tokenProxy = `${ensureBaseURL()}${WECHAT_TOKEN_PROXY_PATH}`;

    return {
      authentication: 'post',
      authorizationUrl: WECHAT_AUTHORIZATION_URL,
      authorizationUrlParams: {
        appid: clientId,
        response_type: 'code',
        scope: 'snsapi_login',
      },
      clientId,
      clientSecret,
      /**
       * Our token proxy encodes wechat_openid/wechat_unionid metadata into the scope string so we
       * can safely retrieve the profile here.
       */
      getUserInfo: async (tokens) => {
        const accessToken = tokens.accessToken;
        const openId = extractWechatMetadata(tokens.scopes, 'wechat_openid');
        const unionId = extractWechatMetadata(tokens.scopes, 'wechat_unionid');

        if (!accessToken || !openId) {
          return null;
        }

        const url = new URL(WECHAT_USERINFO_URL);
        url.searchParams.set('access_token', accessToken);
        url.searchParams.set('openid', openId);
        url.searchParams.set('lang', 'zh_CN');

        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
          return null;
        }

        const profile = (await response.json()) as {
          headimgurl?: string;
          nickname?: string;
          unionid?: string;
        };

        const finalUnionId = unionId ?? profile.unionid ?? openId;
        const syntheticEmail = `${finalUnionId}@wechat.lobehub`;

        return {
          email: syntheticEmail,
          emailVerified: false,
          id: finalUnionId,
          image: profile.headimgurl,
          name: profile.nickname ?? finalUnionId,
          ...profile,
        };
      },

      pkce: false,

      providerId: 'wechat',

      responseMode: 'query',

      scopes: ['snsapi_login'],

      tokenUrl: tokenProxy,
    };
  },

  checkEnvs: () => {
    return !!(
      authEnv.AUTH_WECHAT_ID &&
      authEnv.AUTH_WECHAT_SECRET &&
      authEnv.NEXT_PUBLIC_BETTER_AUTH_URL
    );
  },
  id: 'wechat',
  type: 'generic',
};

export default provider;
