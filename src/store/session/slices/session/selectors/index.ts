import { getAgentAvatar } from './chat';
import {
  chatListSel,
  currentSessionSafe,
  currentSessionSel,
  getSessionById,
  getSessionMetaById,
} from './list';

export const sessionSelectors = {
  chatList: chatListSel,
  currentSession: currentSessionSel,
  currentSessionSafe,

  getAgentAvatar,

  getSessionById,
  // sessionTree: sessionTreeSel,
  getSessionMetaById,
};
