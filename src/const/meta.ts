import { MetaData as OriginalMetaData } from '@/types/meta';

interface ProcessEnvMeta {
  DEFAULT_AVATAR?: string;
  DEFAULT_BACKGROUND_COLOR?: string;
  DEFAULT_INBOX_AVATAR?: string;
  DEFAULT_USER_AVATAR?: string;
}

const envMeta: ProcessEnvMeta = process.env.META ? JSON.parse(process.env.META) : {};

const {
  DEFAULT_AVATAR = '🤖',
  DEFAULT_USER_AVATAR = '😀',
  DEFAULT_BACKGROUND_COLOR = 'rgba(0,0,0,0)',
  DEFAULT_INBOX_AVATAR = '🤯',
} = envMeta;

export { DEFAULT_AVATAR, DEFAULT_BACKGROUND_COLOR, DEFAULT_INBOX_AVATAR, DEFAULT_USER_AVATAR };

export type MetaData = OriginalMetaData;

export const DEFAULT_USER_AVATAR_URL =
  process.env.DEFAULT_USER_AVATAR_URL ??
  'https://registry.npmmirror.com/@lobehub/assets-logo/1.2.0/files/assets/logo-3d.webp';
