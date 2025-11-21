import { authEnv } from '@/envs/auth';

import type { GenericProviderDefinition } from '../types';

const FEISHU_AUTHORIZATION_URL = 'https://accounts.feishu.cn/open-apis/authen/v1/authorize';
const FEISHU_TOKEN_PROXY_PATH = '/api/auth/feishu/token';
const FEISHU_USERINFO_URL = 'https://open.feishu.cn/open-apis/authen/v1/user_info';

type FeishuUserProfile = {
  avatar_big?: string;
  avatar_middle?: string;
  avatar_thumb?: string;
  avatar_url?: string;
  email?: string;
  en_name?: string;
  enterprise_email?: string;
  name?: string;
  open_id?: string;
  tenant_key?: string;
  union_id?: string;
};

type FeishuUserInfoResponse = {
  code?: number;
  data?: FeishuUserProfile;
  msg?: string;
};

const isFeishuProfile = (value: unknown): value is FeishuUserProfile => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.union_id === 'string' ||
    typeof candidate.open_id === 'string' ||
    typeof candidate.avatar_url === 'string' ||
    typeof candidate.name === 'string'
  );
};

const ensureBaseURL = () => {
  const baseUrl = authEnv.NEXT_PUBLIC_BETTER_AUTH_URL?.trim();
  if (!baseUrl) {
    throw new Error('[Better-Auth] NEXT_PUBLIC_BETTER_AUTH_URL is required for Feishu SSO');
  }
  return baseUrl.replace(/\/$/, '');
};

const provider: GenericProviderDefinition = {
  build: () => {
    const clientId = authEnv.AUTH_FEISHU_APP_ID!;
    const clientSecret = authEnv.AUTH_FEISHU_APP_SECRET!;
    const tokenProxy = `${ensureBaseURL()}${FEISHU_TOKEN_PROXY_PATH}`;

    return {
      authentication: 'post',
      authorizationUrl: FEISHU_AUTHORIZATION_URL,
      authorizationUrlParams: {
        app_id: clientId,
        response_type: 'code',
        scope: '',
      },
      clientId,
      clientSecret,
      getUserInfo: async (tokens) => {
        if (!tokens.accessToken) return null;

        const response = await fetch(FEISHU_USERINFO_URL, {
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });

        if (!response.ok) {
          return null;
        }

        const payload = (await response.json()) as unknown;
        const profileResponse = payload as FeishuUserInfoResponse;

        if (profileResponse.code && profileResponse.code !== 0) {
          return null;
        }

        const profile: FeishuUserProfile | undefined =
          profileResponse.data ?? (isFeishuProfile(payload) ? payload : undefined);

        if (!profile) return null;

        const unionId = profile.union_id ?? profile.open_id;
        if (!unionId) return null;

        const syntheticEmail =
          profile.email ?? profile.enterprise_email ?? `${unionId}@feishu.lobehub`;

        return {
          email: syntheticEmail,
          emailVerified: false,
          id: unionId,
          image:
            profile.avatar_url ??
            profile.avatar_thumb ??
            profile.avatar_middle ??
            profile.avatar_big,
          name: profile.name ?? profile.en_name ?? unionId,
          ...profile,
        };
      },
      pkce: false,
      providerId: 'feishu',
      responseMode: 'query',
      scopes: [],
      tokenUrl: tokenProxy,
    };
  },

  checkEnvs: () => {
    return !!(
      authEnv.AUTH_FEISHU_APP_ID &&
      authEnv.AUTH_FEISHU_APP_SECRET &&
      authEnv.NEXT_PUBLIC_BETTER_AUTH_URL
    );
  },
  id: 'feishu',
  type: 'generic',
};

export default provider;
