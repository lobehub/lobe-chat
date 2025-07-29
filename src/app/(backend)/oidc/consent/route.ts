import debug from 'debug';
import { NextRequest, NextResponse } from 'next/server';

import { OIDCService } from '@/server/services/oidc';
import { getUserAuth } from '@/utils/server/auth';

const log = debug('lobe-oidc:consent');

export async function POST(request: NextRequest) {
  log('Received POST request for /oidc/consent, URL: %s', request.url);
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

    const { prompt } = details;
    let result;
    if (consent === 'accept') {
      log(`User accepted the request, Handling 'login' prompt`);
      const { userId } = await getUserAuth();
      log('Obtained userId: %s', userId);

      if (details.prompt.name === 'login') {
        result = {
          login: { accountId: userId, remember: true },
        };
      } else {
        log(`Handling 'consent' prompt`);

        // 1. 获取必要的 ID
        const clientId = details.params.client_id as string;

        // 2. 查找或创建 Grant 对象
        const grant = await oidcService.findOrCreateGrants(userId!, clientId, details.grantId);

        // 3. 将用户同意的 scopes 和 claims 添加到 Grant 对象
        //    这些信息通常在 details.prompt.details 中
        const missingOIDCScope = (prompt.details.missingOIDCScope as string[]) || [];
        if (missingOIDCScope) {
          grant.addOIDCScope(missingOIDCScope.join(' '));
          log('Added OIDC scopes to grant: %s', missingOIDCScope.join(' '));
        }
        const missingOIDCClaims = (prompt.details.missingOIDCClaims as string[]) || [];
        if (missingOIDCClaims) {
          grant.addOIDCClaims(missingOIDCClaims);
          log('Added OIDC claims to grant: %s', missingOIDCClaims.join(' '));
        }

        const missingResourceScopes =
          (prompt.details.missingResourceScopes as Record<string, string[]>) || {};
        if (missingResourceScopes) {
          for (const [indicator, scopes] of Object.entries(missingResourceScopes)) {
            grant.addResourceScope(indicator, scopes.join(' '));
            log('Added resource scopes for %s to grant: %s', indicator, scopes.join(' '));
          }
        }
        // 如果使用了 RAR (Rich Authorization Requests)，也需要添加到 grant
        // if (prompt.details.rar) {
        //   prompt.details.rar.forEach(detail => grant.addRar(detail));
        // }

        // 4. 保存 Grant 对象以获取其 jti (grantId)
        const newGrantId = await grant.save();
        log('Saved grant with ID: %s', newGrantId);

        // 5. 准备包含 grantId 的 result
        result = { consent: { grantId: newGrantId } };

        log('Consent result prepared with grantId');
      }
      log('User %s the authorization', consent);
    } else {
      log('User rejected the request');
      result = {
        error: 'access_denied',
        error_description: 'User denied the authorization request',
      };
      log('User %s the authorization', consent);
    }

    log('Interaction Result: %O', result);

    const internalRedirectUrlString = await oidcService.getInteractionResult(uid, result);
    log('OIDC Provider internal redirect URL string: %s', internalRedirectUrlString);

    // 修复 Cloudflare Tunnel 等代理环境下的 redirect URL 问题
    let finalRedirectUrl = internalRedirectUrlString;
    try {
      const redirectUrl = new URL(internalRedirectUrlString);
      const requestHost = request.headers.get('host');

      // 如果重定向到本地地址，但请求来自外部域名，则修正 URL
      if (
        (redirectUrl.hostname === 'localhost' ||
          redirectUrl.hostname === '127.0.0.1' ||
          redirectUrl.hostname === '0.0.0.0') &&
        requestHost &&
        !requestHost.includes('localhost') &&
        !requestHost.includes('127.0.0.1') &&
        !requestHost.includes('0.0.0.0')
      ) {
        const forwardedProto =
          request.headers.get('x-forwarded-proto') ||
          request.headers.get('x-forwarded-protocol') ||
          (requestHost.includes('localhost') ? 'http' : 'https');

        finalRedirectUrl = `${forwardedProto}://${requestHost}${redirectUrl.pathname}${redirectUrl.search}`;
        log('Corrected redirect URL from %s to %s', internalRedirectUrlString, finalRedirectUrl);
      }
    } catch {
      log('Warning: Could not parse redirect URL, using as-is: %s', internalRedirectUrlString);
    }

    return NextResponse.redirect(finalRedirectUrl, {
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
