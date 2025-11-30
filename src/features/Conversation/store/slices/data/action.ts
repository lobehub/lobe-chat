import { parse } from '@lobechat/conversation-flow';
import type { ConversationContext, UIChatMessage } from '@lobechat/types';
import type { SWRResponse } from 'swr';
import type { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { messageService } from '@/services/message';

import type { Store as ConversationStore } from '../../action';
import { type MessageDispatch, messagesReducer } from './reducer';

/**
 * Data Actions
 *
 * Handles message fetching based on conversation context.
 */
export interface DataAction {
  /**
   * Dispatch message updates for optimistic UI updates
   * This method updates the frontend state without persisting to database
   */
  internal_dispatchMessage: (payload: MessageDispatch) => void;

  /**
   * Replace all messages with new data
   * Used for syncing after database operations (optimistic update pattern)
   *
   * @param messages - New messages array from database
   */
  replaceMessages: (messages: UIChatMessage[]) => void;

  /**
   * Fetch messages for this conversation using SWR
   *
   * @param context - Conversation context with sessionId and topicId
   */
  useFetchMessages: (context: ConversationContext) => SWRResponse<UIChatMessage[]>;
}

export const dataSlice: StateCreator<
  ConversationStore,
  [['zustand/devtools', never]],
  [],
  DataAction
> = (set, get) => ({
  internal_dispatchMessage: (payload) => {
    const dbMessages = get().dbMessages;

    // Apply array-based reducer - preserves message order
    const newDbMessages = messagesReducer(dbMessages, payload);

    // Check if anything changed
    if (newDbMessages === dbMessages) return;

    // Re-parse for display order and grouping
    const { flatList } = parse(newDbMessages);

    set({ dbMessages: newDbMessages, displayMessages: flatList }, false, {
      payload,
      type: `dispatchMessage/${payload.type}`,
    });

    // Sync changes to external store (ChatStore)
    get().onMessagesChange?.(newDbMessages);
  },

  replaceMessages: (messages) => {
    // Parse messages using conversation-flow
    const { flatList } = parse(messages);

    set({ dbMessages: messages, displayMessages: flatList }, false, 'replaceMessages');

    // Sync changes to external store (ChatStore)
    get().onMessagesChange?.(messages);
  },

  useFetchMessages: (context) => {
    const swrKey: ConversationContext | null = context.agentId ? context : null;
    console.log(swrKey);
    return useClientDataSWR<UIChatMessage[]>(
      context.agentId ? ['CONVERSATION_FETCH_MESSAGES', swrKey] : null,

      async ([, key]: [string, ConversationContext]) => {
        return messageService.getMessages({
          agentId: key.agentId,
          threadId: key.threadId ?? undefined,
          topicId: key.topicId ?? undefined,
        });
      },
      {
        onSuccess: (data) => {
          if (!data) return;

          // Parse messages using conversation-flow
          const { flatList } = parse(data);

          set({
            dbMessages: data,
            displayMessages: flatList,
            messagesInit: true,
          });

          // Call onMessagesChange callback if provided
          get().onMessagesChange?.(data);
        },
      },
    );
  },
});
