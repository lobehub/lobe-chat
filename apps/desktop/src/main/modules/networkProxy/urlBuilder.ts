import { NetworkProxySettings } from '@lobechat/electron-client-ipc';

/**
 * 代理 URL 构建器
 */
export const ProxyUrlBuilder = {
  /**
   * 构建代理 URL
   */
  build(config: NetworkProxySettings): string {
    const { proxyType, proxyServer, proxyPort, proxyRequireAuth, proxyUsername, proxyPassword } =
      config;

    let proxyUrl = `${proxyType}://${proxyServer}:${proxyPort}`;

    // 添加认证信息
    if (proxyRequireAuth && proxyUsername && proxyPassword) {
      const encodedUsername = encodeURIComponent(proxyUsername);
      const encodedPassword = encodeURIComponent(proxyPassword);
      proxyUrl = `${proxyType}://${encodedUsername}:${encodedPassword}@${proxyServer}:${proxyPort}`;
    }

    return proxyUrl;
  },
};
