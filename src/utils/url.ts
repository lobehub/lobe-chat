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
  },
) => {
  const url = new URL(path);

  if (hash) url.hash = hash;
  if (search) url.search = search;
  return url.toString();
};
