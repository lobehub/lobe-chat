import { NextRequest, NextResponse } from 'next/server';

import { oidcEnv } from '@/envs/oidc';

import { getOIDCProvider } from '../../oidcProvider';

/**
 * 处理交互请求 GET
 * 显示交互页面 (登录或同意授权)
 */
export async function GET(req: NextRequest, props: { params: Promise<{ uid: string }> }) {
  try {
    if (!oidcEnv.ENABLE_OIDC) {
      return new NextResponse('OIDC is not enabled', { status: 404 });
    }

    const { uid } = await props.params;
    const provider = await getOIDCProvider();

    // 获取交互详情
    // 注意：此处应该做更好的 NextRequest 和 oidc-provider 之间的适配
    // 这是简化版实现
    const details = await provider.interactionDetails(req, {} as any);

    // 根据交互类型处理
    // 1. 如果需要登录，重定向到登录页
    if (details.prompt.name === 'login') {
      // 重定向到 LobeChat 登录页面，完成后再返回此交互
      const nextauthPath = '/next-auth/signin';
      const returnUrl = `/oauth/interaction/${uid}`;
      const loginUrl = `${nextauthPath}?callbackUrl=${encodeURIComponent(returnUrl)}`;

      return new NextResponse(null, {
        headers: {
          Location: loginUrl,
        },
        status: 302,
      });
    }

    // 2. 如果需要同意授权，显示同意授权页面
    if (details.prompt.name === 'consent') {
      // 构建同意授权 HTML 页面
      const client = details.params.client_id || 'unknown';
      const scopes = details.params.scope?.split(' ') || [];

      const html = `
        <html>
          <head>
            <title>LobeChat - Authorize</title>
            <style>
              body { font-family: system-ui, sans-serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 2rem; }
              .card { border: 1px solid #eee; border-radius: 8px; padding: 2rem; margin: 2rem 0; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
              .title { font-size: 1.5rem; margin-bottom: 1rem; }
              .scopes { margin: 1rem 0; }
              .scope { background: #f3f4f6; padding: 0.5rem; margin: 0.25rem 0; border-radius: 4px; }
              .buttons { display: flex; gap: 1rem; margin-top: 2rem; }
              button { padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; font-weight: 500; }
              .primary { background: #000; color: white; border: none; }
              .secondary { background: white; color: #333; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1 class="title">授权请求</h1>
              <p>应用 <strong>${client}</strong> 请求访问您的 LobeChat 账户</p>

              <div class="scopes">
                <p>应用请求以下权限：</p>
                ${scopes.map((scope) => `<div class="scope">${getScopeDescription(scope)}</div>`).join('')}
              </div>

              <form method="post">
                <div class="buttons">
                  <button type="submit" name="consent" value="deny" class="secondary">拒绝</button>
                  <button type="submit" name="consent" value="accept" class="primary">授权</button>
                </div>
              </form>
            </div>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
        },
        status: 200,
      });
    }

    // 3. 其他交互类型
    return new NextResponse(`不支持的交互类型: ${details.prompt.name}`, { status: 400 });
  } catch (error) {
    console.error('Error handling OIDC interaction:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * 处理交互请求 POST
 * 处理用户交互结果 (如授权同意)
 */
export async function POST(req: NextRequest, { params }: { params: { uid: string } }) {
  try {
    if (!oidcEnv.ENABLE_OIDC) {
      return new NextResponse('OIDC is not enabled', { status: 404 });
    }

    const { uid } = params;
    const provider = await getOIDCProvider();

    // 解析表单数据
    const formData = await req.formData();
    const consent = formData.get('consent');

    // 获取交互详情
    const details = await provider.interactionDetails(req, {} as any);

    // 根据用户选择和交互类型构建结果
    let result;

    if (details.prompt.name === 'consent') {
      if (consent === 'accept') {
        // 用户同意授权
        result = {
          consent: {
            rejectedClaims: [],
            // 授权所有请求的 scopes
            rejectedScopes: [],
          },
        };
      } else {
        // 用户拒绝授权
        result = {
          error: 'access_denied',
          error_description: 'User denied the authorization request',
        };
      }
    } else {
      return new NextResponse(`不支持的交互类型: ${details.prompt.name}`, { status: 400 });
    }

    // 完成交互
    const redirectUrl = await provider.interactionFinished(req, {} as any, result, {
      mergeWithLastSubmission: true,
    });

    // 重定向到 OIDC 流程的下一步
    return new NextResponse(null, {
      headers: {
        Location: redirectUrl,
      },
      status: 302,
    });
  } catch (error) {
    console.error('Error handling OIDC interaction submission:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * 获取 Scope 的中文描述
 * @param scope - Scope 名称
 * @returns Scope 描述
 */
function getScopeDescription(scope: string): string {
  const descriptions: Record<string, string> = {
    'email': '访问您的电子邮件地址',
    'offline_access': '在您离线时继续访问您的数据',
    'openid': '使用您的 LobeChat 账户进行身份验证',
    'profile': '访问您的基本资料信息（名称、头像等）',
    'sync:read': '读取您的同步数据',
    'sync:write': '写入并更新您的同步数据',
  };

  return descriptions[scope] || scope;
}
