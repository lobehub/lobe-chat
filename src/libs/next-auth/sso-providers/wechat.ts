import WeChat from '@auth/core/providers/wechat';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'wechat',
  provider: WeChat({
    ...CommonProviderConfig,
    clientId: process.env.AUTH_WECHAT_ID,
    clientSecret: process.env.AUTH_WECHAT_SECRET,
    platformType: 'WebsiteApp',
    token: {
      url: "https://api.weixin.qq.com/sns/oauth2/access_token",
      params: { appid: process.env.AUTH_WECHAT_ID, secret:  process.env.AUTH_WECHAT_SECRET },
      async conform(response) {
        const data = await response.json()
        console.log('wechat data:',data)
        return new Response( JSON.stringify({ ...data, token_type: "bearer" }), {
          headers: { 'Content-Type': 'application/json' }
        })
      },
    },
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
