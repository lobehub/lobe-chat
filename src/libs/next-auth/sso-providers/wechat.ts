/**
 * @module providers/wechat
 */

import type {OAuthConfig, OAuthUserConfig} from "@auth/core/providers/index";
import  { AuthError } from "next-auth"
import { authEnv } from '@/config/auth';

import { CommonProviderConfig } from './sso.config';

const provider = {
  id: 'wechat',
  provider: Wechat({
    ...CommonProviderConfig,
    clientId: authEnv.WECHAT_CLIENT_ID ?? process.env.WECHAT_CLIENT_ID,//appid
    clientSecret: authEnv.WECHAT_CLIENT_SECRET ?? process.env.WECHAT_CLIENT_SECRET,//app_secret
    // Remove end
    profile: (profile) => {
      return {
        email: profile.email,
        id: profile.email,
        image: profile.image,
        name: profile.name,
        providerAccountId: profile.email.toString(),
      };
    },
  }),
};

export default provider;



// WeChat Profile Interface
export interface WeChatProfile {
  openid: string;
  nickname: string;
  sex: number;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid: string;
  scope: string;
  [key: string]: any;
}

class customError extends AuthError {
  constructor(message: string) {
    super()
    this.message = message
  }
}

function Wechat(config: OAuthUserConfig<WeChatProfile>): OAuthConfig<WeChatProfile> {
  const { clientId, clientSecret } = config;

  return {
    id: "wechat",
    name: "微信",
    type: "oauth",
    clientId:clientId,
    clientSecret:clientSecret,
    authorization: {
      url: "https://open.weixin.qq.com/connect/qrconnect",
      params: {
        appid: clientId,
        redirect_uri: process.env.WECHAT_REDIRECT_URI,//callback url
        response_type: "code",
        scope:"snsapi_login",
        state: "STATE"
      },
    },


    token: {
      url: "https://api.weixin.qq.com/sns/oauth2/access_token",
      params: {
        appid: clientId,
        secret: clientSecret,
        code: "{$code}",
        grant_type: "authorization_code"
      },

      conform: async (response: Response): Promise<Response | undefined> => {
        let json = await response.json();

        if (response.ok) {
          // 判断返回的json是否包含access_token
          if (json.access_token) {
            // 如果包含access_token，则返回json
            // 构建一个新的Response对象
            return new Response(JSON.stringify({
              id: json.openid,
              access_token: json.access_token,
              token_type: "bearer",
              expires_in: json.expires_in,
              refresh_token: json.refresh_token,
              openid: json.openid,
              scope: json.scope,
              // 可选属性
              ...(json.unionid ? { unionid: json.unionid } : {}),
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          } else {
            // 抛出错误
            throw new customError(json.errmsg);
          }
        } else {
          // 抛出错误
          throw new customError("获取token失败");
        }
      },
    },
    userinfo: {
      url: "https://api.weixin.qq.com/sns/userinfo",
      async request(context: RequestContext) {
        return await makeUserinfoRequest(context)
      }
    },
    profile(profile) {
      return {
        id: profile.unionid,
        name: profile.nickname,
        image: profile.headimgurl,
        email: profile.unionid, // WeChat does not provide email address
        unionid: profile.unionid, // WeChat does not provide email address
        openid: profile.openid,
      };
    },
    style: { logo: "https://res.wx.qq.com/open/zh_CN/htmledition/res/img/pic/app-create/pic_logo_1086fcdeb.png", bg: "#48bd00", text: "#fff" },
    // options: config,
    checks: [ "state"],
    allowDangerousEmailAccountLinking: true,
  };
}

interface Tokens {
  id: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid: string;
}

interface RequestContext {
  tokens: Tokens;
  provider: OAuthConfig<WeChatProfile>;
}

// 实现 makeUserinfoRequest 函数
async function makeUserinfoRequest(context: RequestContext): Promise<any> {
  console.log("makeUserinfoRequest:",context)
  // 从 context 中获取必要的参数
  const { tokens } = context;

  // 构建完整的请求 URL
  const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${tokens.access_token}&openid=${tokens.openid}&lang=zh_CN`;

  // 发起 GET 请求
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 解析响应体为 JSON 格式
  const data = await response.json();

  // 检查响应状态
  if (!response.ok) {
    throw new customError(`Failed to fetch user info: ${response.status} ${response.statusText}`);
  }

  // 返回解析后的 JSON 数据
  return data;
}
