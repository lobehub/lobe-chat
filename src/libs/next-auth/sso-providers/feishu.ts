import { customFetch } from 'next-auth';
import type { OAuthConfig } from 'next-auth/providers';

interface FeishuProfile {
  avatar_big: string;
  avatar_middle: string;
  avatar_thumb: string;
  avatar_url: string;
  en_name: string;
  name: string;
  open_id: string;
  tenant_key: string;
  union_id: string;
}

interface FeishuProfileResponse {
  data: FeishuProfile;
}

function Feishu(): OAuthConfig<FeishuProfileResponse> {
  return {
    authorization: {
      params: {
        scope: '',
      },
      url: 'https://accounts.feishu.cn/open-apis/authen/v1/authorize',
    },
    checks: ['state'],
    client: {
      token_endpoint_auth_method: 'client_secret_post',
    },
    clientId: process.env.AUTH_FEISHU_APP_ID,
    clientSecret: process.env.AUTH_FEISHU_APP_SECRET,
    [customFetch]: (url, options = {}) => {
      if (
        url === 'https://open.feishu.cn/open-apis/authen/v2/oauth/token' &&
        options.method === 'POST'
      ) {
        if (options?.headers) {
          options.headers = {
            ...options.headers,
            'content-type': 'application/json; charset=utf-8',
          };
        } else {
          options.headers = {
            'content-type': 'application/json; charset=utf-8',
          };
        }

        if (options.body instanceof URLSearchParams) {
          options.body = JSON.stringify(Object.fromEntries(options.body));
        }
      }

      return fetch(url, options);
    },
    id: 'feishu',
    name: 'Feishu',
    profile(profileResponse) {
      const profile = profileResponse.data;

      return {
        id: profile.union_id,
        image: profile.avatar_url,
        name: profile.name,
        providerAccountId: profile.union_id,
      };
    },
    style: {
      logo: 'https://p1-hera.feishucdn.com/tos-cn-i-jbbdkfciu3/268ec674a56a4510889f7f5ca14f1ba1~tplv-jbbdkfciu3-image:0:0.image',
    },
    token: 'https://open.feishu.cn/open-apis/authen/v2/oauth/token',
    type: 'oauth',
    userinfo: 'https://open.feishu.cn/open-apis/authen/v1/user_info',
  };
}

const provider = {
  id: 'feishu',
  provider: Feishu(),
};

export default provider;
