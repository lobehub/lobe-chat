import { createHash } from 'node:crypto';

/**
 * 文件访问类型枚举
 */
export enum FileAccessType {
  PRIVATE = 'private',
  PUBLIC = 'public',
  SHARED = 'shared',
}

/**
 * 生成带访问权限的安全文件哈希
 * 相同内容但不同访问权限的文件会有不同的哈希值，确保访问权限隔离
 *
 * @param contentHash - 文件内容的原始哈希值
 * @param accessType - 文件访问类型
 * @param userId - 用户ID (用于私有文件的额外隔离)
 * @returns 安全的复合哈希值
 */
export const generateSecureFileHash = (
  contentHash: string,
  accessType: FileAccessType,
  userId: string,
): string => {
  // 创建安全盐值，包含访问类型和用户ID
  const securitySalt = `${accessType}:${userId}`;

  // 生成复合哈希：原始哈希 + 安全盐值
  const secureHash = createHash('sha256')
    .update(contentHash + ':' + securitySalt)
    .digest('hex');

  return secureHash;
};

/**
 * 根据文件访问权限推断访问类型
 * @param url - 文件URL或存储路径
 * @param metadata - 文件元数据
 * @returns 推断的访问类型
 */
export const inferAccessType = (url: string, metadata?: any): FileAccessType => {
  // 根据URL模式推断访问类型
  if (url.includes('private') || url.includes('user-only')) {
    return FileAccessType.PRIVATE;
  }

  if (url.includes('public') || url.includes('cdn')) {
    return FileAccessType.PUBLIC;
  }

  // 检查元数据中的访问权限标识
  if (metadata?.isPublic === true) {
    return FileAccessType.PUBLIC;
  }

  if (metadata?.isShared === true) {
    return FileAccessType.SHARED;
  }

  // 默认为私有访问
  return FileAccessType.PRIVATE;
};

/**
 * 验证哈希值是否为安全复合哈希
 *
 * @param hash - 待验证的哈希值
 * @returns 是否为安全复合哈希
 */
export const isSecureHash = (hash: string): boolean => {
  // 安全复合哈希应该是64位的SHA256哈希
  return /^[\da-f]{64}$/i.test(hash);
};
