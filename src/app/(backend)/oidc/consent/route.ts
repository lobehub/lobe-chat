import debug from 'debug';
import { NextRequest, NextResponse } from 'next/server';

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

    // await oidcService.finishInteraction(uid, result);

    // 获取OIDC提供商的默认重定向URL，但不会直接使用它
    const internalRedirectUrlString = await oidcService.getInteractionResult(uid, result);
    log('OIDC Provider internal redirect URL string: %s', internalRedirectUrlString);

    return NextResponse.redirect(internalRedirectUrlString, {
      headers: request.headers,
      status: 303,
    });
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
