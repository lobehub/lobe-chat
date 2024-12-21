import WeChat from '@auth/core/providers/wechat';

import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'wechat',
  provider: WeChat({
    ...CommonProviderConfig,
    clientId: authEnv.WECHAT_CLIENT_ID ?? process.env.AUTH_WECHAT_ID,
    clientSecret: authEnv.WECHAT_CLIENT_SECRET ?? process.env.AUTH_WECHAT_SECRET,
    platformType: 'WebsiteApp',
    profile: (profile) => {
      return {
        email: null,
        id: profile.unionid,
        image: profile.headimgurl,
        name: profile.nickname,
        providerAccountId: profile.unionid,
      };
    },
  }),
};

export default provider;
