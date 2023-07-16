import { DEFAULT_AVATAR } from '@/store/session/slices/agentConfig';
import { MetaData } from '@/types/meta';

export const getAgentAvatar = (s: MetaData) => s.avatar || DEFAULT_AVATAR;
