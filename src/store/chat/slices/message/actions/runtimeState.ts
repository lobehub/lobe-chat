import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';
import { Action, setNamespace } from '@/utils/storeDebug';

import type { ChatStoreState } from '../../../initialState';
import { preventLeavingFn, toggleBooleanList } from '../../../utils';
import { displayMessageSelectors } from '../selectors/displayMessage';

const n = setNamespace('m');

/**
 * Runtime state management for message-related states
 * Handles loading states, active session tracking, etc.
 */
export interface MessageRuntimeStateAction {
  /**
   * Clear message selection
   */
  clearMessageSelection: () => void;

  /**
   * helper to toggle the loading state of the array,used by these three toggleXXXLoading
   */
  internal_toggleLoadingArrays: (
    key: keyof ChatStoreState,
    loading: boolean,
    id?: string,
    action?: Action,
  ) => AbortController | undefined;

  /**
   * method to toggle message create loading state
   * the AI message status is creating -> generating
   * other message role like user and tool , only this method need to be called
   */
  internal_toggleMessageLoading: (loading: boolean, id: string) => void;

  /**
   * Update active session ID with cleanup of pending operations
   */
  internal_updateActiveId: (activeId: string) => void;

  /**
   * Update active session type
   */
  internal_updateActiveSessionType: (sessionType?: 'agent' | 'group') => void;
  /**
   * Toggle message selection mode
   */
  toggleMessageSelectionMode: (enabled: boolean) => void;
  /**
   * Update message selection
   */
  updateMessageSelection: (id: string, selected: boolean) => void;
}

export const messageRuntimeState: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  MessageRuntimeStateAction
> = (set, get) => ({
  clearMessageSelection: () => {
    // Restore original collapse state when clearing selection
    const messages = displayMessageSelectors.activeDisplayMessages(get());
    const originallyCollapsedIds = get().messageOriginallyCollapsedIds;

    // Expand all messages that were not originally collapsed
    messages.forEach((message) => {
      const wasOriginallyCollapsed = originallyCollapsedIds.includes(message.id);
      if (!wasOriginallyCollapsed && message.metadata?.collapsed) {
        get().toggleMessageCollapsed(message.id, false);
      }
    });

    set(
      { isMessageSelectionMode: false, messageOriginallyCollapsedIds: [], messageSelectionIds: [] },
      false,
      n('clearMessageSelection'),
    );
  },

  internal_toggleLoadingArrays: (key, loading, id, action) => {
    const abortControllerKey = `${key}AbortController`;
    if (loading) {
      window.addEventListener('beforeunload', preventLeavingFn);

      const abortController = new AbortController();
      set(
        {
          [abortControllerKey]: abortController,
          [key]: toggleBooleanList(get()[key] as string[], id!, loading),
        },
        false,
        action,
      );

      return abortController;
    } else {
      if (!id) {
        set({ [abortControllerKey]: undefined, [key]: [] }, false, action);
      } else
        set(
          {
            [abortControllerKey]: undefined,
            [key]: toggleBooleanList(get()[key] as string[], id, loading),
          },
          false,
          action,
        );

      window.removeEventListener('beforeunload', preventLeavingFn);
    }
  },

  internal_toggleMessageLoading: (loading, id) => {
    set(
      {
        messageLoadingIds: toggleBooleanList(get().messageLoadingIds, id, loading),
      },
      false,
      `internal_toggleMessageLoading/${loading ? 'start' : 'end'}`,
    );
  },

  internal_updateActiveId: (activeId: string) => {
    const currentActiveId = get().activeId;
    if (currentActiveId === activeId) return;

    // Before switching sessions, cancel all pending supervisor decisions
    get().internal_cancelAllSupervisorDecisions();
    get().clearMessageSelection();

    set({ activeId }, false, n(`updateActiveId/${activeId}`));
  },

  internal_updateActiveSessionType: (sessionType?: 'agent' | 'group') => {
    if (get().activeSessionType === sessionType) return;

    set({ activeSessionType: sessionType }, false, n('updateActiveSessionType'));
  },

  toggleMessageSelectionMode: (enabled) => {
    if (enabled) {
      // When entering selection mode, track originally collapsed messages and collapse all
      const messages = displayMessageSelectors.activeDisplayMessages(get());
      const originallyCollapsedIds: string[] = [];

      // Identify which messages are already collapsed
      messages.forEach((message) => {
        if (message.metadata?.collapsed) {
          originallyCollapsedIds.push(message.id);
        }
      });

      // Collapse all messages that are not already collapsed
      messages.forEach((message) => {
        if (!message.metadata?.collapsed) {
          get().toggleMessageCollapsed(message.id, true);
        }
      });

      set(
        { isMessageSelectionMode: true, messageOriginallyCollapsedIds: originallyCollapsedIds },
        false,
        n('toggleMessageSelectionMode/enter'),
      );
    } else {
      // When exiting selection mode, restore original collapse state
      const messages = displayMessageSelectors.activeDisplayMessages(get());
      const originallyCollapsedIds = get().messageOriginallyCollapsedIds;

      // Expand all messages that were not originally collapsed
      messages.forEach((message) => {
        const wasOriginallyCollapsed = originallyCollapsedIds.includes(message.id);
        if (!wasOriginallyCollapsed && message.metadata?.collapsed) {
          get().toggleMessageCollapsed(message.id, false);
        }
      });

      set(
        { isMessageSelectionMode: false, messageOriginallyCollapsedIds: [] },
        false,
        n('toggleMessageSelectionMode/exit'),
      );
    }
  },

  updateMessageSelection: (id, selected) => {
    set(
      {
        messageSelectionIds: toggleBooleanList(get().messageSelectionIds, id, selected),
      },
      false,
      n('updateMessageSelection'),
    );
  },
});
