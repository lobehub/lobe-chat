import WeChat from '@auth/core/providers/wechat';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'wechat',
  provider: WeChat({
    ...CommonProviderConfig,
    clientId: process.env.AUTH_WECHAT_ID,
    clientSecret: process.env.AUTH_WECHAT_SECRET,
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
