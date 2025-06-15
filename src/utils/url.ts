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
