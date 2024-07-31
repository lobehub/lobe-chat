import { OAuthConfig } from '@auth/core/providers';
import { TokenSet } from '@auth/core/types';

import { authEnv } from '@/config/auth';

interface FeishuUserInfo {
  avatar_big: string;
  avatar_middle: string;
  avatar_thumb: string;
  avatar_url: string;
  email?: string;
  employee_no?: string;
  en_name: string;
  enterprise_email?: string;
  mobile?: string;
  name: string;
  open_id: string;
  tenant_key: string;
  union_id: string;
  user_id?: string;
}

interface Config {
  baseUrl?: string;
  clientId?: string;
  clientSecret?: string;
}

function Feishu({
  clientId = '',
  clientSecret = '',
  baseUrl: _baseUrl,
}: Config): OAuthConfig<FeishuUserInfo> {
  const baseUrl = _baseUrl ?? 'https://open.feishu.cn';
  return {
    authorization: {
      params: {
        app_id: clientId,
        scope: 'contact:contact.base:readonly',
      },
      url: `${baseUrl}/open-apis/authen/v1/authorize`,
    },
    checks: ['state'],
    clientId,
    clientSecret,
    id: 'feishu',
    name: 'Feishu',
    profile(profile) {
      return {
        email: profile.email || profile.enterprise_email || '',
        id: profile.open_id,
        image: profile.avatar_url,
        name: profile.name || profile.en_name,
      };
    },
    style: {
      bg: '',
      logo: 'https://p1-hera.feishucdn.com/tos-cn-i-jbbdkfciu3/84a9f036fe2b44f99b899fff4beeb963~tplv-jbbdkfciu3-image:0:0.image',
      text: '',
    },
    token: {
      async request({
        params,
        provider,
      }: {
        params: URLSearchParams;
        provider: ReturnType<typeof Feishu>;
      }) {
        const { app_access_token } = await fetch(
          `${baseUrl}/open-apis/auth/v3/app_access_token/internal`,
          {
            body: JSON.stringify({
              app_id: clientId,
              app_secret: clientSecret,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          },
        ).then(async (res) => await res.json());

        const res = await fetch(provider.token?.url, {
          body: JSON.stringify({
            code: params.get('code'),
            grant_type: 'authorization_code',
          }),
          headers: {
            'Authorization': `Bearer ${app_access_token}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
        });

        const { data } = await res.json();

        return new Response(JSON.stringify(data), {
          headers: res.headers,
        });
      },
      url: `${baseUrl}/open-apis/authen/v1/oidc/access_token`,
    },
    type: 'oauth',
    userinfo: {
      async request({
        tokens,
        provider,
      }: {
        provider: ReturnType<typeof Feishu>;
        tokens: TokenSet;
      }) {
        const { data } = await fetch(provider.userinfo?.url, {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`,
            'User-Agent': 'LobeChat',
          },
        }).then(async (res) => await res.json());

        return data;
      },
      url: `${baseUrl}/open-apis/authen/v1/user_info`,
    },
  };
}

const provider = {
  id: 'feishu',
  provider: Feishu({
    clientId: authEnv.FEISHU_CLIENT_ID,
    clientSecret: authEnv.FEISHU_CLIENT_SECRET,
  }),
};

export default provider;
