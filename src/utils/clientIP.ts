/**
 * 获取客户端 IP
 * @param headers HTTP 请求头
 */
export const getClientIP = (headers: Headers): string => {
  // 按优先级顺序检查各种 IP 头
  const ipHeaders = [
    'cf-connecting-ip', // Cloudflare
    'x-real-ip', // Nginx proxy
    'x-forwarded-for', // 标准代理头
    'x-client-ip', // Apache
    'true-client-ip', // Akamai and Cloudflare
    'x-cluster-client-ip', // 负载均衡
    'forwarded', // RFC 7239
    'fastly-client-ip', // Fastly CDN
    'x-forwarded', // General forward
    'x-original-forwarded-for', // Original forwarded
  ];

  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (!value) continue;

    // 处理可能包含多个 IP 的情况（比如 x-forwarded-for）
    if (header.toLowerCase() === 'x-forwarded-for') {
      const firstIP = value.split(',')[0].trim();
      if (firstIP) return firstIP;
    }

    return value.trim();
  }

  return '';
};
