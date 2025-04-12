import { NextRequest, NextResponse } from 'next/server';

import { oidcEnv } from '@/envs/oidc';

import { getOIDCProvider } from '../oidcProvider';

/**
 * 处理请求头部兼容性
 * NextRequest 和 oidc-provider 间的适配
 */
const convertHeadersToNodeHeaders = (nextHeaders: Headers): Record<string, string> => {
  const headers: Record<string, string> = {};
  nextHeaders.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
};

/**
 * 将 oidc-provider 的响应转换为 NextResponse
 */
const convertOidcResponseToNextResponse = (oidcResponse: any): NextResponse => {
  // 从 oidc-provider 响应中提取关键信息
  const { body, status, headers } = oidcResponse;

  // 创建 NextResponse
  return new NextResponse(body, {
    headers,
    status,
  });
};

type Props = { params: Promise<{ oidc: string[] }> };

/**
 * 处理 catch-all 路由下的所有 OIDC 请求
 * 这个处理器会捕获所有 /oauth/[...oidc] 的请求
 * 例如: /oauth/auth, /oauth/token, /oauth/userinfo 等
 */
export async function GET(req: NextRequest, props: Props) {
  try {
    if (!oidcEnv.ENABLE_OIDC) {
      return new NextResponse('OIDC is not enabled', { status: 404 });
    }

    // 获取子路径
    const params = await props.params;
    const subpath = params.oidc.join('/');

    // 获取 OIDC Provider 实例
    const provider = await getOIDCProvider();

    // 将 NextRequest 转换为 oidc-provider 兼容的请求格式
    // 实际实现需要更复杂的适配逻辑，这里只是简化版
    const oidcCompatibleRequest = {
      body: null,
      headers: convertHeadersToNodeHeaders(req.headers),
      method: req.method,
      url: req.url, // GET 请求无 body
    };

    // 使用 oidc-provider 处理请求
    // 注意：这里的实现简化了，在实际项目中需要进一步处理
    const oidcResponse = await provider.callback()(oidcCompatibleRequest, {
      end: () => {},
      setHeader: () => {},
      statusCode: 200,
    });

    // 将 oidc-provider 的响应转换为 NextResponse
    return convertOidcResponseToNextResponse(oidcResponse);
  } catch (error) {
    console.error('Error handling OIDC request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * 处理 POST 请求 (用于令牌端点等)
 */
export async function POST(req: NextRequest, props: Props) {
  try {
    if (!oidcEnv.ENABLE_OIDC) {
      return new NextResponse('OIDC is not enabled', { status: 404 });
    }

    // 获取子路径
    const params = await props.params;
    const subpath = params.oidc.join('/');

    // 获取 OIDC Provider 实例
    const provider = await getOIDCProvider();

    // 将 NextRequest 转换为 oidc-provider 兼容的请求格式
    // 注意：POST 请求需要解析 body
    const body = await req.text();

    const oidcCompatibleRequest = {
      body,
      headers: convertHeadersToNodeHeaders(req.headers),
      method: req.method,
      url: req.url,
    };

    // 使用 oidc-provider 处理请求
    const oidcResponse = await provider.callback()(oidcCompatibleRequest, {
      end: () => {},
      setHeader: () => {},
      statusCode: 200,
    });

    // 将 oidc-provider 的响应转换为 NextResponse
    return convertOidcResponseToNextResponse(oidcResponse);
  } catch (error) {
    console.error('Error handling OIDC request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * 同样处理其他 HTTP 方法
 */
export const PUT = POST;
export const DELETE = POST;
export const PATCH = POST;
