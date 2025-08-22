import debug from 'debug';
import { NextRequest } from 'next/server';

const log = debug('lobe-oidc:correctOIDCUrl');

/**
 * 修复 OIDC 重定向 URL 在代理环境下的问题
 * @param req - Next.js 请求对象
 * @param url - 要修复的 URL 对象
 * @returns 修复后的 URL 对象
 */
export const correctOIDCUrl = (req: NextRequest, url: URL): URL => {
  const requestHost = req.headers.get('host');
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto =
    req.headers.get('x-forwarded-proto') || req.headers.get('x-forwarded-protocol');

  log('Input URL: %s', url.toString());
  log(
    'Request headers - host: %s, x-forwarded-host: %s, x-forwarded-proto: %s',
    requestHost,
    forwardedHost,
    forwardedProto,
  );

  // 确定实际的主机名和协议，提供后备值
  const actualHost = forwardedHost || requestHost;
  const actualProto = forwardedProto || (url.protocol === 'https:' ? 'https' : 'http');

  // 如果无法确定有效的主机名，直接返回原URL
  if (!actualHost || actualHost === 'null') {
    log('Warning: Cannot determine valid host, returning original URL');
    return url;
  }

  // 如果 URL 指向本地地址，或者主机名与实际请求主机不匹配，则修正 URL
  const needsCorrection =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname === '0.0.0.0' ||
    url.hostname !== actualHost;

  if (needsCorrection) {
    log('URL needs correction. Original hostname: %s, correcting to: %s', url.hostname, actualHost);

    try {
      const correctedUrl = new URL(url.toString());
      correctedUrl.protocol = actualProto + ':';
      correctedUrl.host = actualHost;

      log('Corrected URL: %s', correctedUrl.toString());
      return correctedUrl;
    } catch (error) {
      log('Error creating corrected URL, returning original: %O', error);
      return url;
    }
  }

  log('URL does not need correction, returning original: %s', url.toString());
  return url;
};
