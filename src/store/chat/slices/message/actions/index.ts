import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';

import { MessageInternalsAction, messageInternals } from './internals';
import { MessageOptimisticUpdateAction, messageOptimisticUpdate } from './optimisticUpdate';
import { MessagePublicApiAction, messagePublicApi } from './publicApi';
import { MessageQueryAction, messageQuery } from './query';
import { MessageRuntimeStateAction, messageRuntimeState } from './runtimeState';

/**
 * Combined message action interface
 * Aggregates all message-related actions
 */
export interface ChatMessageAction
  extends MessagePublicApiAction,
    MessageOptimisticUpdateAction,
    MessageQueryAction,
    MessageRuntimeStateAction,
    MessageInternalsAction {
  /**/
}

/**
 * Combined message action creator
 * Merges all message action modules
 */
export const chatMessage: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatMessageAction
> = (...params) => ({
  ...messagePublicApi(...params),
  ...messageOptimisticUpdate(...params),
  ...messageQuery(...params),
  ...messageRuntimeState(...params),
  ...messageInternals(...params),
});
