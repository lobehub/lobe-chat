import { NextResponse } from 'next/server';

import { authEnv } from '@/envs/auth';

const WECHAT_TOKEN_URL = 'https://api.weixin.qq.com/sns/oauth2/access_token';
const WECHAT_ERROR_MISSING_CONFIG = 50_001;
const WECHAT_ERROR_INVALID_CONTENT_TYPE = 40_001;
const WECHAT_ERROR_MISSING_CODE = 40_002;

type WeChatTokenResponse = {
  access_token?: string;
  errcode?: number;
  errmsg?: string;
  expires_in?: number;
  openid?: string;
  refresh_token?: string;
  scope?: string;
  unionid?: string;
};

const augmentScope = (scope: string | undefined, openId?: string, unionId?: string) => {
  const scopes = scope ? scope.split(' ') : [];
  if (openId) scopes.push(`wechat_openid:${openId}`);
  if (unionId) scopes.push(`wechat_unionid:${unionId}`);
  return scopes.join(' ').trim();
};

export const POST = async (request: Request) => {
  if (!authEnv.AUTH_WECHAT_ID || !authEnv.AUTH_WECHAT_SECRET) {
    return NextResponse.json(
      { errcode: WECHAT_ERROR_MISSING_CONFIG, errmsg: 'WeChat credentials are not configured' },
      { status: 500 },
    );
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    return NextResponse.json(
      { errcode: WECHAT_ERROR_INVALID_CONTENT_TYPE, errmsg: 'Invalid content type' },
      { status: 400 },
    );
  }

  const body = await request.text();
  const params = new URLSearchParams(body);

  const code = params.get('code');
  const grantType = params.get('grant_type') ?? 'authorization_code';

  if (!code) {
    return NextResponse.json(
      { errcode: WECHAT_ERROR_MISSING_CODE, errmsg: 'Missing code parameter' },
      { status: 400 },
    );
  }

  const tokenUrl = new URL(WECHAT_TOKEN_URL);
  tokenUrl.searchParams.set('appid', authEnv.AUTH_WECHAT_ID);
  tokenUrl.searchParams.set('secret', authEnv.AUTH_WECHAT_SECRET);
  tokenUrl.searchParams.set('code', code);
  tokenUrl.searchParams.set('grant_type', grantType);

  const tokenResponse = await fetch(tokenUrl, { cache: 'no-store' });
  const data = (await tokenResponse.json()) as WeChatTokenResponse;

  if (!tokenResponse.ok || data.errcode) {
    return NextResponse.json(data, { status: tokenResponse.ok ? 400 : tokenResponse.status });
  }

  return NextResponse.json({
    ...data,
    scope: augmentScope(data.scope, data.openid, data.unionid),
  });
};
