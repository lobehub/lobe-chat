import { getAgentAvatar } from './chat';
import { chatListSel, currentSessionSel, getSessionById, getSessionMetaById } from './list';

export const sessionSelectors = {
  currentChat: currentSessionSel,
  chatList: chatListSel,
  // sessionTree: sessionTreeSel,
  getSessionMetaById,
  getSessionById,
  getAgentAvatar,
};
