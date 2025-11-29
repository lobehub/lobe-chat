import { parse } from '@lobechat/conversation-flow';
import { UIChatMessage } from '@lobechat/types';
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
  refreshMessages: (sessionId?: string, topicId?: string | null) => Promise<void>;

  /**
   * Replace current messages with new data
   */
  replaceMessages: (
    messages: UIChatMessage[],
    params?: {
      action?: any;
      operationId?: string;
      sessionId?: string;
      topicId?: string | null;
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
  refreshMessages: async (sessionId?: string, topicId?: string | null) => {
    const sid = sessionId ?? get().activeId;
    const tid = topicId !== undefined ? topicId : get().activeTopicId;
    await mutate([SWR_USE_FETCH_MESSAGES, sid, tid, 'session']);
    await mutate([SWR_USE_FETCH_MESSAGES, sid, tid, 'group']);
  },

  replaceMessages: (messages, params) => {
    let sessionId: string;
    let topicId: string | null | undefined;

    // Priority 1: Get context from operation if operationId is provided
    if (params?.operationId) {
      const { sessionId: opSessionId, topicId: opTopicId } =
        get().internal_getSessionContext(params);
      sessionId = opSessionId;
      topicId = opTopicId;
    } else {
      // Priority 2: Use explicit sessionId/topicId or fallback to global state
      sessionId = params?.sessionId ?? get().activeId;
      topicId = params?.topicId ?? get().activeTopicId;
    }

    const messagesKey = messageMapKey(sessionId, topicId);

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
          ? messageService.getMessages(sessionId, topicId)
          : messageService.getGroupMessages(sessionId, topicId),
      {
        onSuccess: (messages, key) => {
          const nextMap = {
            ...get().dbMessagesMap,
            [messageMapKey(messageContextId || '', activeTopicId)]: messages,
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
