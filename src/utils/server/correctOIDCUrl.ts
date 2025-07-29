import { NextRequest } from 'next/server';

/**
 * 修复 OIDC 重定向 URL 在代理环境下的问题
 * @param req - Next.js 请求对象
 * @param url - 要修复的 URL 对象
 * @returns 修复后的 URL 对象
 */
export const correctOIDCUrl = (req: NextRequest, url: URL): URL => {
  const requestHost = req.headers.get('host');

  // 如果 URL 指向本地地址，但请求来自外部域名，则修正 URL
  if (
    (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '0.0.0.0') &&
    requestHost &&
    !requestHost.includes('localhost') &&
    !requestHost.includes('127.0.0.1') &&
    !requestHost.includes('0.0.0.0')
  ) {
    const forwardedProto =
      req.headers.get('x-forwarded-proto') || req.headers.get('x-forwarded-protocol') || 'https'; // Default to 'https' when behind a proxy

    const correctedUrl = new URL(url.toString());
    correctedUrl.protocol = forwardedProto;
    correctedUrl.host = requestHost;
    return correctedUrl;
  }

  return url;
};
