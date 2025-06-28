import mime from 'mime';

/**
 * Build a path string from a path and a hash/search object
 * @param path
 * @param hash
 * @param search
 */
export const pathString = (
  path: string,
  {
    hash = '',
    search = '',
  }: {
    hash?: string;
    search?: string;
  } = {},
) => {
  const tempBase = 'https://a.com';
  const url = new URL(path, tempBase);

  if (hash) url.hash = hash;
  if (search) url.search = search;
  return url.toString().replace(tempBase, '');
};

export function inferContentTypeFromImageUrl(url: string) {
  const extension = url.split('.').pop();
  if (!extension) {
    throw new Error(`Invalid image url: ${url}`);
  }
  return mime.getType(extension);
}

/**
 * Get file extension from URL
 * @param url - The URL to extract extension from
 * @returns file extension without dot (e.g., 'jpg', 'png', 'webp')
 */
export const getFileExtensionFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // 找到最后一个点并获取其后的子字符串
    const lastDotIndex = pathname.lastIndexOf('.');
    if (lastDotIndex === -1) return 'png'; // 如果没有找到点，则返回默认值

    const extension = pathname.slice(Math.max(0, lastDotIndex + 1)).toLowerCase();

    // 验证是否是常见的图片扩展名
    const validImageExtensions = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff', 'tif'];
    if (validImageExtensions.includes(extension)) {
      return extension;
    }
  } catch {
    // 无效 URL, 忽略
  }

  // 默认回退
  return 'png';
};
