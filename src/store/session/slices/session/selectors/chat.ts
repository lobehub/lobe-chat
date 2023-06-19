import { MetaData } from '@/types/meta';

export const getAgentAvatar = (s: MetaData) =>
  s.avatar || 'https://raw.githubusercontent.com/lobehub/favicon/main/icon.png';
