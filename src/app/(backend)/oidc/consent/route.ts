import debug from 'debug';
import { NextRequest, NextResponse } from 'next/server';
import urlJoin from 'url-join';

import { appEnv } from '@/config/app';
import { OIDCService } from '@/server/services/oidc';

const log = debug('lobe-oidc:consent');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const consent = formData.get('consent') as string;
    const uid = formData.get('uid') as string;

    log('POST /oauth/consent - uid=%s, choice=%s', uid, consent);

    const oidcService = await OIDCService.initialize();

    let details;
    try {
      details = await oidcService.getInteractionDetails(uid);
      log(
        'Interaction details found - prompt=%s, client=%s',
        details.prompt.name,
        details.params.client_id,
      );
    } catch (error) {
      log(
        'Error: Interaction details not found - %s',
        error instanceof Error ? error.message : 'unknown error',
      );
      if (error instanceof Error && error.message.includes('interaction session not found')) {
        return NextResponse.json(
          {
            error: 'invalid_request',
            error_description:
              'Authorization session expired or invalid, please restart the authorization flow',
          },
          { status: 400 },
        );
      }
      throw error;
    }

    let result;
    if (consent === 'accept') {
      if (details.prompt.name === 'login') {
        result = {
          login: { accountId: details.session?.accountId, remember: true },
        };
      } else {
        result = {
          consent: {
            rejectedClaims: [],
            rejectedScopes: [],
          },
        };
      }
      log('User %s the authorization', consent);
    } else {
      result = {
        error: 'access_denied',
        error_description: 'User denied the authorization request',
      };
      log('User %s the authorization', consent);
    }

    // 获取OIDC提供商的默认重定向URL，但不会直接使用它
    const redirectUrl = await oidcService.getInteractionResult(uid, result);
    log('Default redirectUrl: %s', redirectUrl);

    // 根据用户选择定制重定向地址

    if (consent === 'accept') {
      // 用户同意授权，跳转到success页面
      const successUrl = urlJoin(appEnv.APP_URL!, `/oauth/consent/${uid}/success`);
      log('Redirecting to success page: %s', successUrl);
      return NextResponse.redirect(successUrl);
    } else {
      // 用户拒绝授权，跳转到failed页面
      const failedUrl = urlJoin(appEnv.APP_URL!, `/oauth/consent/${uid}/failed`);
      log('Redirecting to failed page: %s', failedUrl);
      return NextResponse.redirect(failedUrl);
    }
  } catch (error) {
    log('Error processing consent: %s', error instanceof Error ? error.message : 'unknown error');
    console.error('Error processing consent:', error);
    return NextResponse.json(
      {
        error: 'server_error',
        error_description: 'Error processing consent',
      },
      { status: 500 },
    );
  }
}
