import { fileEnv } from '@/config/file';

/**
 * 给文件添加URL前缀
 * @param file 文件对象
 * @returns 添加了URL前缀的文件对象
 */
export function addFileUrlPrefix<T extends { url?: string }>(file: T): T {
  // 从 fileEnv 中获取公共域名前缀
  const publicDomain = fileEnv.S3_PUBLIC_DOMAIN;

  if (!publicDomain) {
    return file;
  }

  // 如果已经有完整的URL，直接返回
  if (file.url && (file.url.startsWith('http://') || file.url.startsWith('https://'))) {
    return file;
  }

  return {
    ...file,
    url: `${publicDomain}/${file.url}`,
  };
}

/**
 * 批量给文件数组添加URL前缀
 * @param files 文件数组
 * @returns 添加了URL前缀的文件数组
 */
export function addFilesUrlPrefix<T extends { path?: string; url?: string }>(files: T[]): T[] {
  return files.map(addFileUrlPrefix);
}
