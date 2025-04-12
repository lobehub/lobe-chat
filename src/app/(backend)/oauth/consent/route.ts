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
      log('Interaction details found - prompt=%s, client=%s', details.prompt.name, details.params.client_id);
    } catch (error) {
      log('Error: Interaction details not found - %s', error instanceof Error ? error.message : 'unknown error');
      if (error instanceof Error && error.message.includes('interaction session not found')) {
        return NextResponse.json({
          error: 'invalid_request',
          error_description: 'Authorization session expired or invalid, please restart the authorization flow'
        }, { status: 400 });
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

    const redirectUrl = await oidcService.getInteractionResult(uid, result);
    log('Redirecting to: %s', redirectUrl);
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    log('Error in consent flow: %s', error instanceof Error ? error.message : 'unknown error');
    console.error('Failed to process consent request:', error);
    return NextResponse.json({ error: 'Failed to process consent request' }, { status: 500 });
  }
}
