'use client';

import type { UIChatMessage } from '@lobechat/types';
import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useConversationStoreApi } from './store';
import type { ConversationContext, ConversationHooks, OperationState } from './types';

export interface StoreUpdaterProps {
  context: ConversationContext;
  /**
   * Whether external messages have been initialized
   */
  hasInitMessages?: boolean;
  hooks?: ConversationHooks;
  /**
   * External messages to sync into the store
   */
  messages?: UIChatMessage[];
  /**
   * Callback when messages are fetched or changed internally
   */
  onMessagesChange?: (messages: UIChatMessage[]) => void;
  /**
   * External operation state (from ChatStore)
   */
  operationState?: OperationState;
}

const StoreUpdater = memo<StoreUpdaterProps>(
  ({ context, hasInitMessages, hooks, messages, onMessagesChange, operationState }) => {
    const storeApi = useConversationStoreApi();
    const useStoreUpdater = createStoreUpdater(storeApi);

    useStoreUpdater('context', context);
    useStoreUpdater('hooks', hooks!);
    useStoreUpdater('messagesInit', hasInitMessages ?? false);
    useStoreUpdater('onMessagesChange', onMessagesChange);
    useStoreUpdater('operationState', operationState!);

    // Sync external messages into store
    useEffect(() => {
      if (messages) {
        storeApi.getState().replaceMessages(messages);
      }
    }, [messages, storeApi]);

    return null;
  },
);

StoreUpdater.displayName = 'ConversationStoreUpdater';

export default StoreUpdater;
