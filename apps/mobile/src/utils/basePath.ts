import { getServerUrl } from '@/config/server';

const ensureLeadingSlash = (path: string): string => {
  return path.startsWith('/') ? path : `/${path}`;
};

export const withBasePath = (path: string): string => {
  const baseUrl = getServerUrl();
  const normalizedPath = ensureLeadingSlash(path);

  return `${baseUrl}${normalizedPath}`;
};
