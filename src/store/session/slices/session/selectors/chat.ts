import { MetaData } from '@/types/meta';

export const getAgentAvatar = (s: MetaData) =>
  s.avatar || 'https://npm.elemecdn.com/@lobehub/assets-logo/assets/logo-3d.webp';
