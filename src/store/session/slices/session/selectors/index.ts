import { getAgentAvatar } from './chat';
import { chatListSel, currentSessionSafe, currentSessionSel, getSessionById, getSessionMetaById } from './list';

export const sessionSelectors = {
  currentSession: currentSessionSel,
  currentSessionSafe,
  chatList: chatListSel,
  // sessionTree: sessionTreeSel,
  getSessionMetaById,
  getSessionById,
  getAgentAvatar,
};
