import { createHash, randomBytes } from 'node:crypto';

/**
 * API Key 工具类
 * 用于生成和验证 API Key
 */
export const ApiKeyUtils = {
  /**
   * 从 API Key 中提取前缀
   * @param key - API Key
   * @returns 前缀部分
   */
  extractPrefix(key: string): string | null {
    const match = key.match(/^sk-([\da-z]+)-/);
    return match ? match[1] : null;
  },

  /**
   * 生成 API Key
   * 格式: sk-{prefix}-{random}
   * @param prefix - API Key 前缀，用于标识不同的用途
   * @returns 生成的 API Key
   */
  generateKey(prefix: string = 'lobe'): string {
    // 生成 32 字节的随机数
    const random = randomBytes(32).toString('hex');
    // 使用 SHA-256 生成哈希
    const hash = createHash('sha256').update(random).digest('hex');
    // 取前 16 位作为随机部分
    const randomPart = hash.slice(0, 16);
    // 组合成最终的 API Key
    return `sk-${prefix}-${randomPart}`;
  },

  /**
   * 检查 API Key 是否过期
   * @param expiresAt - 过期时间
   * @returns 是否已过期
   */
  isExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return false;
    return new Date() > expiresAt;
  },

  /**
   * 验证 API Key 格式
   * @param key - 要验证的 API Key
   * @returns 是否是有效的 API Key 格式
   */
  validateKeyFormat(key: string): boolean {
    // 检查格式: sk-{prefix}-{random}
    const pattern = /^sk-[\da-z]+-[\da-f]{16}$/;
    return pattern.test(key);
  },
};
