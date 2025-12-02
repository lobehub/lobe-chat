import { parse } from '@lobechat/conversation-flow';
import { TraceEventPayloads } from '@lobechat/types';
import debug from 'debug';
import isEqual from 'fast-deep-equal';
import { StateCreator } from 'zustand/vanilla';

import { traceService } from '@/services/trace';
import { ChatStore } from '@/store/chat/store';

import { displayMessageSelectors } from '../../../selectors';
import { messageMapKey } from '../../../utils/messageMapKey';
import { MessageDispatch, messagesReducer } from '../reducer';

const log = debug('lobe-store:message-internals');

/**
 * Internal core methods that serve as building blocks for other actions
 */
export interface MessageInternalsAction {
  /**
   * update message at the frontend
   * this method will not update messages to database
   */
  internal_dispatchMessage: (payload: MessageDispatch, context?: { operationId?: string }) => void;

  /**
   * trace message events for analytics
   */
  internal_traceMessage: (id: string, payload: TraceEventPayloads) => Promise<void>;
}

export const messageInternals: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  MessageInternalsAction
> = (set, get) => ({
  // the internal process method of the AI message
  internal_dispatchMessage: (payload, context) => {
    let agentId: string;
    let topicId: string | null | undefined;
    let threadId: string | null | undefined;

    // Get context from operation if operationId is provided
    if (context?.operationId) {
      const operation = get().operations[context.operationId];
      if (!operation) {
        log('[internal_dispatchMessage] ERROR: Operation not found: %s', context.operationId);
        throw new Error(`Operation not found: ${context.operationId}`);
      }
      agentId = operation.context.agentId!;
      topicId = operation.context.topicId;
      threadId = operation.context.threadId;
      log(
        '[internal_dispatchMessage] get context from operation %s: agentId=%s, topicId=%s, threadId=%s',
        context.operationId,
        agentId,
        topicId,
        threadId,
      );
    } else {
      // Fallback to global state
      agentId = get().activeAgentId;
      topicId = get().activeTopicId;
      threadId = get().activeThreadId;
      log(
        '[internal_dispatchMessage] use global context: agentId=%s, topicId=%s, threadId=%s',
        agentId,
        topicId,
        threadId,
      );
    }

    const messagesKey = messageMapKey({ agentId, threadId, topicId });

    // Get raw messages from dbMessagesMap and apply reducer
    const rawMessages = get().dbMessagesMap[messagesKey] || [];
    const updatedRawMessages = messagesReducer(rawMessages, payload);

    const nextDbMap = { ...get().dbMessagesMap, [messagesKey]: updatedRawMessages };

    if (isEqual(nextDbMap, get().dbMessagesMap)) return;

    // parse to get display messages
    const { flatList } = parse(updatedRawMessages);
    const nextDisplayMap = { ...get().messagesMap, [messagesKey]: flatList };

    set({ dbMessagesMap: nextDbMap, messagesMap: nextDisplayMap }, false, {
      payload,
      type: `dispatchMessage/${payload.type}`,
    });
  },

  internal_traceMessage: async (id, payload) => {
    // tracing the diff of update
    const message = displayMessageSelectors.getDisplayMessageById(id)(get());
    if (!message) return;

    const traceId = message?.traceId;
    const observationId = message?.observationId;

    if (traceId && message?.role === 'assistant') {
      traceService
        .traceEvent({ content: message.content, observationId, traceId, ...payload })
        .catch();
    }
  },
});
