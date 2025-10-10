import { OFFICIAL_URL } from '@/_const/url';
import { useSettingStore } from '@/store/setting';

export const DEFAULT_SERVER_URL = process.env.EXPO_PUBLIC_OFFICIAL_CLOUD_SERVER || OFFICIAL_URL;

const normalizeBaseUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Remove trailing slashes to keep URL consistent
  return trimmed.replace(/\/+$/, '');
};

export const isValidServerUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    const normalized = normalizeBaseUrl(url);
    const { protocol } = new URL(normalized);

    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

export const getServerUrl = (): string => {
  const { customServerUrl } = useSettingStore.getState();
  const normalizedDefault = normalizeBaseUrl(DEFAULT_SERVER_URL);

  if (!customServerUrl) return normalizedDefault;

  const normalizedCustom = normalizeBaseUrl(customServerUrl);

  return normalizedCustom || normalizedDefault;
};

export const formatServerUrl = (url: string): string => {
  return normalizeBaseUrl(url);
};
