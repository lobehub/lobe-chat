import { DEFAULT_AGENT_META } from '@/const/meta';
import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { LobeAgentSession, LobeSessionType } from '@/types/session';

export const initLobeSession: LobeAgentSession = {
  config: DEFAULT_AGENT_CONFIG,
  createdAt: Date.now(),
  id: '',
  meta: DEFAULT_AGENT_META,
  type: LobeSessionType.Agent,
  updatedAt: Date.now(),
};
