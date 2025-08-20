// Mobile端不需要复杂的basePath处理，直接返回原始路径

import { OFFICIAL_URL } from '@/const/url';

const remoteUrl = process.env.EXPO_PUBLIC_OFFICIAL_CLOUD_SERVER || OFFICIAL_URL;

export const withBasePath = (path: string): string => {
  return `${remoteUrl}${path}`;
};
