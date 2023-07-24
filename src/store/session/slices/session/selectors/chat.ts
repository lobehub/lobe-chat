import { DEFAULT_AVATAR } from '@/const/meta';
import { MetaData } from '@/types/meta';

export const getAgentAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
