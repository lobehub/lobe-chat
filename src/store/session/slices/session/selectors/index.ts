import { chatListSel, currentSessionSel, sessionTreeSel } from './list';

export const chatSelectors = {
  currentChat: currentSessionSel,
  chatList: chatListSel,
  sessionTree: sessionTreeSel,
};
