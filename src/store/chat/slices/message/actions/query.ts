import { parse } from '@lobechat/conversation-flow';
import { ConversationContext, UIChatMessage } from '@lobechat/types';
import isEqual from 'fast-deep-equal';
import { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { messageService } from '@/services/message';
import { ChatStore } from '@/store/chat/store';
import { setNamespace } from '@/utils/storeDebug';

import { messageMapKey } from '../../../utils/messageMapKey';

const n = setNamespace('m');

const SWR_USE_FETCH_MESSAGES = 'SWR_USE_FETCH_MESSAGES';

/**
 * Data query and synchronization actions
 * Handles fetching, refreshing, and replacing message data
 */
export interface MessageQueryAction {
  /**
   * Manually refresh messages from server
   */
  refreshMessages: (context?: Partial<ConversationContext>) => Promise<void>;

  /**
   * Replace current messages with new data
   */
  replaceMessages: (
    messages: UIChatMessage[],
    params?: {
      action?: any;
      /**
       * Conversation context for message storage key
       * If not provided, uses active context from state
       */
      context?: Partial<ConversationContext>;
      /**
       * Operation ID for context retrieval
       * @deprecated Use context instead
       */
      operationId?: string;
    },
  ) => void;

  /**
   * Fetch messages using SWR
   * @param enable - whether to enable the fetch
   * @param messageContextId - Can be sessionId or groupId
   */
  useFetchMessages: (
    enable: boolean,
    messageContextId: string,
    activeTopicId?: string,
    type?: 'session' | 'group',
  ) => SWRResponse<UIChatMessage[]>;
}

export const messageQuery: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  MessageQueryAction
> = (set, get) => ({
  // TODO: The mutate should only be called once, but since we haven't merge session and group,
  // we need to call it twice
  refreshMessages: async (context?: Partial<ConversationContext>) => {
    const sessionId = context?.sessionId ?? get().activeId;
    const topicId = context?.topicId !== undefined ? context.topicId : get().activeTopicId;
    // TODO: Support threadId refresh when needed
    await mutate([SWR_USE_FETCH_MESSAGES, sessionId, topicId, 'session']);
    await mutate([SWR_USE_FETCH_MESSAGES, sessionId, topicId, 'group']);
  },

  replaceMessages: (messages, params) => {
    let sessionId: string;
    let topicId: string | null | undefined;
    let threadId: string | null | undefined;

    // Priority 1: Use explicit context if provided
    if (params?.context) {
      sessionId = params.context.sessionId ?? get().activeId;
      topicId = params.context.topicId !== undefined ? params.context.topicId : get().activeTopicId;
      threadId = params.context.threadId;
    }
    // Priority 2: Get context from operation if operationId is provided (deprecated)
    else if (params?.operationId) {
      const opContext = get().internal_getSessionContext(params);
      sessionId = opContext.sessionId;
      topicId = opContext.topicId;
      threadId = opContext.threadId;
    }
    // Priority 3: Fallback to global state
    else {
      sessionId = get().activeId;
      topicId = get().activeTopicId;
      threadId = get().activeThreadId;
    }

    const messagesKey = messageMapKey({ sessionId, threadId, topicId });

    // Get raw messages from dbMessagesMap and apply reducer
    const nextDbMap = { ...get().dbMessagesMap, [messagesKey]: messages };

    if (isEqual(nextDbMap, get().dbMessagesMap)) return;

    // Parse messages using conversation-flow
    const { flatList } = parse(messages);

    set(
      {
        // Store raw messages from backend
        dbMessagesMap: nextDbMap,
        // Store parsed messages for display
        messagesMap: { ...get().messagesMap, [messagesKey]: flatList },
      },
      false,
      params?.action ?? 'replaceMessages',
    );
  },

  useFetchMessages: (enable, messageContextId, activeTopicId, type = 'session') =>
    useClientDataSWR<UIChatMessage[]>(
      enable ? [SWR_USE_FETCH_MESSAGES, messageContextId, activeTopicId, type] : null,
      async ([, sessionId, topicId, type]: [string, string, string | undefined, string]) =>
        type === 'session'
          ? messageService.getMessages({ sessionId, topicId })
          : messageService.getGroupMessages(sessionId, topicId),
      {
        onSuccess: (messages, key) => {
          const nextMap = {
            ...get().dbMessagesMap,
            [messageMapKey({ sessionId: messageContextId || '', topicId: activeTopicId })]:
              messages,
          };

          // no need to update map if the messages have been init and the map is the same
          if (get().messagesInit && isEqual(nextMap, get().dbMessagesMap)) return;

          set(
            { messagesInit: true },
            false,
            n('useFetchMessages(success)', { messages, queryKey: key }),
          );
          get().replaceMessages(messages, {
            action: n('useFetchMessages/updateMessages'),
          });
        },
      },
    ),
});
