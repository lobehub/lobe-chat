import { NextRequest, NextResponse } from 'next/server';

import { OIDCService } from '@/server/services/oidc';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const consent = formData.get('consent') as string;
    const uid = formData.get('uid') as string;

    const oidcService = await OIDCService.initialize();
    const details = await oidcService.getInteractionDetails(uid);

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
    } else {
      result = {
        error: 'access_denied',
        error_description: '用户拒绝了授权请求',
      };
    }

    const redirectUrl = await oidcService.getInteractionResult(uid, result);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('处理授权请求失败:', error);
    return NextResponse.json({ error: '处理授权请求失败' }, { status: 500 });
  }
}
