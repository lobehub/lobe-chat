import { defaultAvatar } from '@/store/session/slices/agentConfig';
import { MetaData } from '@/types/meta';

export const getAgentAvatar = (s: MetaData) => s.avatar || defaultAvatar;
