import debug from 'debug';

const log = debug('lobe-oidc:validateRedirectHost');

/**
 * 验证重定向主机是否在允许的白名单中
 * 防止 Open Redirect 攻击
 */
export const validateRedirectHost = (targetHost: string): boolean => {
  if (!targetHost || targetHost === 'null') {
    log('Invalid target host: %s', targetHost);
    return false;
  }

  // 获取配置的 APP_URL 作为基准域名
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    log('Warning: APP_URL not configured, rejecting redirect to: %s', targetHost);
    return false;
  }

  try {
    const appUrlObj = new URL(appUrl);
    const appHost = appUrlObj.host;

    log('Validating target host: %s against app host: %s', targetHost, appHost);

    // 完全匹配
    if (targetHost === appHost) {
      log('Host validation passed: exact match');
      return true;
    }

    // 允许 localhost 和本地地址（开发环境）
    const isLocalhost =
      targetHost === 'localhost' ||
      targetHost.startsWith('localhost:') ||
      targetHost === '127.0.0.1' ||
      targetHost.startsWith('127.0.0.1:') ||
      targetHost === '0.0.0.0' ||
      targetHost.startsWith('0.0.0.0:');

    if (
      isLocalhost &&
      (appHost.includes('localhost') ||
        appHost.includes('127.0.0.1') ||
        appHost.includes('0.0.0.0'))
    ) {
      log('Host validation passed: localhost environment');
      return true;
    }

    // 检查是否为配置域名的子域名
    const appDomain = appHost.split(':')[0]; // 移除端口号
    const targetDomain = targetHost.split(':')[0]; // 移除端口号

    if (targetDomain.endsWith('.' + appDomain)) {
      log('Host validation passed: subdomain of %s', appDomain);
      return true;
    }

    console.error('Host validation failed: %s is not allowed', targetHost);
    return false;
  } catch (error) {
    console.error('Error parsing APP_URL %s: %O', appUrl, error);
    return false;
  }
};
