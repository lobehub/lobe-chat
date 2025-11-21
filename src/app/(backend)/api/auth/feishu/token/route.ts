import { NextResponse } from 'next/server';

import { authEnv } from '@/envs/auth';

const FEISHU_TOKEN_URL = 'https://open.feishu.cn/open-apis/authen/v2/oauth/token';
const FEISHU_ERROR_MISSING_CONFIG = 50_101;
const FEISHU_ERROR_INVALID_CONTENT_TYPE = 40_101;
const FEISHU_ERROR_MISSING_CODE = 40_102;

type FeishuTokenPayload = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  tokenType?: string;
  token_type?: string;
};

type FeishuTokenResponse = {
  code?: number;
  data?: FeishuTokenPayload;
  message?: string;
  msg?: string;
} & FeishuTokenPayload;

export const POST = async (request: Request) => {
  if (!authEnv.AUTH_FEISHU_APP_ID || !authEnv.AUTH_FEISHU_APP_SECRET) {
    return NextResponse.json(
      { code: FEISHU_ERROR_MISSING_CONFIG, msg: 'Feishu credentials are not configured' },
      { status: 500 },
    );
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/x-www-form-urlencoded')) {
    return NextResponse.json(
      { code: FEISHU_ERROR_INVALID_CONTENT_TYPE, msg: 'Invalid content type' },
      { status: 400 },
    );
  }

  const body = await request.text();
  const params = new URLSearchParams(body);

  const code = params.get('code');
  const grantType = params.get('grant_type') ?? 'authorization_code';
  const redirectUri = params.get('redirect_uri') ?? undefined;

  if (!code) {
    return NextResponse.json(
      { code: FEISHU_ERROR_MISSING_CODE, msg: 'Missing code parameter' },
      { status: 400 },
    );
  }

  const feishuRequestBody: Record<string, string> = {
    app_id: authEnv.AUTH_FEISHU_APP_ID,
    app_secret: authEnv.AUTH_FEISHU_APP_SECRET,
    code,
    grant_type: grantType,
  };

  if (redirectUri) {
    feishuRequestBody.redirect_uri = redirectUri;
  }

  const tokenResponse = await fetch(FEISHU_TOKEN_URL, {
    body: JSON.stringify(feishuRequestBody),
    cache: 'no-store',
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
    method: 'POST',
  });

  const parsed = (await tokenResponse.json()) as FeishuTokenResponse;
  const payload = parsed.data ?? parsed;

  const hasErrorCode = typeof parsed.code === 'number' && parsed.code !== 0;
  const tokenMissing = !payload.access_token;

  if (!tokenResponse.ok || hasErrorCode || tokenMissing) {
    return NextResponse.json(parsed, { status: tokenResponse.ok ? 400 : tokenResponse.status });
  }

  return NextResponse.json({
    access_token: payload.access_token,
    expires_in: payload.expires_in,
    refresh_token: payload.refresh_token,
    scope: payload.scope,
    token_type: payload.token_type ?? payload.tokenType ?? 'Bearer',
  });
};
