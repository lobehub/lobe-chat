import { StateCreator } from 'zustand/vanilla';

import { SessionStore } from '@/store/session';

import { ChatMessageAction, chatMessage } from './message';
import { ChatPluginAction, chatPlugin } from './plugin';
import { ShareAction, chatShare } from './share';
import { ChatTopicAction, chatTopic } from './topic';
import { ChatTranslateAction, chatTranslate } from './translate';

/**
 * 聊天操作
 */
export interface ChatAction
  extends ChatTopicAction,
    ChatMessageAction,
    ShareAction,
    ChatTranslateAction,
    ChatPluginAction {}

export const createChatSlice: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  ChatAction
> = (...params) => ({
  ...chatTopic(...params),
  ...chatMessage(...params),
  ...chatShare(...params),
  ...chatTranslate(...params),
  ...chatPlugin(...params),
});
