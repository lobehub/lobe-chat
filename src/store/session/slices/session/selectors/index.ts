import { getAgentAvatar } from './chat';
import { chatListSel, currentSessionSel, getSessionById, getSessionMetaById } from './list';

export const sessionSelectors = {
  chatList: chatListSel,
  currentChat: currentSessionSel,

  getAgentAvatar,

  getSessionById,
  // sessionTree: sessionTreeSel,
  getSessionMetaById,
};
