import { NetworkProxySettings } from '@lobechat/electron-client-ipc';

/**
 * 代理配置验证结果
 */
export interface ProxyValidationResult {
  errors: string[];
  isValid: boolean;
}

/**
 * 代理配置验证器
 */
export class ProxyConfigValidator {
  private static readonly SUPPORTED_TYPES = ['http', 'https', 'socks5'] as const;
  private static readonly DEFAULT_BYPASS = 'localhost,127.0.0.1,::1';

  /**
   * 验证代理配置
   */
  static validate(config: NetworkProxySettings): ProxyValidationResult {
    const errors: string[] = [];

    // 如果未启用代理，跳过验证
    if (!config.enableProxy) {
      return { errors: [], isValid: true };
    }

    // 验证代理类型
    if (!this.SUPPORTED_TYPES.includes(config.proxyType as any)) {
      errors.push(
        `Unsupported proxy type: ${config.proxyType}. Supported types: ${this.SUPPORTED_TYPES.join(', ')}`,
      );
    }

    // 验证代理服务器
    if (!config.proxyServer?.trim()) {
      errors.push('Proxy server is required when proxy is enabled');
    } else if (!this.isValidHost(config.proxyServer)) {
      errors.push('Invalid proxy server format');
    }

    // 验证代理端口
    if (!config.proxyPort?.trim()) {
      errors.push('Proxy port is required when proxy is enabled');
    } else {
      const port = parseInt(config.proxyPort, 10);
      if (isNaN(port) || port < 1 || port > 65_535) {
        errors.push('Proxy port must be a valid number between 1 and 65535');
      }
    }

    // 验证认证信息
    if (config.proxyRequireAuth) {
      if (!config.proxyUsername?.trim()) {
        errors.push('Proxy username is required when authentication is enabled');
      }
      if (!config.proxyPassword?.trim()) {
        errors.push('Proxy password is required when authentication is enabled');
      }
    }

    return {
      errors,
      isValid: errors.length === 0,
    };
  }

  /**
   * 验证主机名格式
   */
  private static isValidHost(host: string): boolean {
    // 简单的主机名验证（IP 地址或域名）
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const domainRegex =
      /^[\dA-Za-z]([\dA-Za-z-]*[\dA-Za-z])?(\.[\dA-Za-z]([\dA-Za-z-]*[\dA-Za-z])?)*$/;

    return ipRegex.test(host) || domainRegex.test(host);
  }
}
