import debug from 'debug';
import { NextRequest, NextResponse, after } from 'next/server';

import { OAuthHandoffModel } from '@/database/models/oauthHandoff';
import { serverDB } from '@/database/server';

const log = debug('lobe-oidc:callback:desktop');

export const GET = async (req: NextRequest) => {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This `state` is the handoff ID

    if (!code || !state || typeof code !== 'string' || typeof state !== 'string') {
      log('Missing code or state in form data');
      const errorUrl = req.nextUrl.clone();
      errorUrl.pathname = '/oauth/callback/error';
      errorUrl.searchParams.set('reason', 'invalid_request');
      return NextResponse.redirect(errorUrl);
    }

    log('Received OIDC callback. state(handoffId): %s', state);

    // The 'client' is 'desktop' because this redirect_uri is for the desktop client.
    const client = 'desktop';
    const payload = { code, state };
    const id = state;

    const authHandoffModel = new OAuthHandoffModel(serverDB);
    await authHandoffModel.create({ client, id, payload });
    log('Handoff record created successfully for id: %s', id);

    // Redirect to a generic success page. The desktop app will poll for the result.
    const successUrl = req.nextUrl.clone();
    successUrl.pathname = '/oauth/callback/success';

    // cleanup expired
    after(async () => {
      const cleanedCount = await authHandoffModel.cleanupExpired();

      log('Cleaned up %d expired handoff records', cleanedCount);
    });

    return NextResponse.redirect(successUrl);
  } catch (error) {
    log('Error in OIDC callback: %O', error);
    const errorUrl = req.nextUrl.clone();
    errorUrl.pathname = '/oauth/callback/error';
    errorUrl.searchParams.set('reason', 'internal_error');

    if (error instanceof Error) {
      errorUrl.searchParams.set('errorMessage', error.message);
    }

    return NextResponse.redirect(errorUrl);
  }
};
