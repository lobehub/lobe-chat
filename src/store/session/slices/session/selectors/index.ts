import {
  chatListSel,
  currentSessionSel,
  getSessionById,
  getSessionMetaById,
  sessionTreeSel,
} from './list';

export const chatSelectors = {
  currentChat: currentSessionSel,
  chatList: chatListSel,
  sessionTree: sessionTreeSel,
  getSessionMetaById,
  getSessionById,
};
