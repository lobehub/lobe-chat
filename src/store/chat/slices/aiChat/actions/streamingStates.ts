import isEqual from 'fast-deep-equal';
import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';
import { Action } from '@/utils/storeDebug';

/**
 * Manages loading states during streaming operations
 */
export interface StreamingStatesAction {
  /**
   * Toggles the loading state for AI message generation, managing the UI feedback
   */
  internal_toggleChatLoading: (
    loading: boolean,
    id?: string,
    action?: Action,
  ) => AbortController | undefined;
  /**
   * Toggles the loading state for messages in tools calling
   */
  internal_toggleMessageInToolsCalling: (
    loading: boolean,
    id?: string,
    action?: Action,
  ) => AbortController | undefined;
  /**
   * Toggles the loading state for search workflow
   */
  internal_toggleSearchWorkflow: (loading: boolean, id?: string) => void;
  /**
   * Controls the streaming state of tool calling processes, updating the UI accordingly
   */
  internal_toggleToolCallingStreaming: (id: string, streaming: boolean[] | undefined) => void;
}

export const streamingStates: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  StreamingStatesAction
> = (set, get) => ({
  internal_toggleChatLoading: (loading) => {
    // Legacy method kept for backward compatibility
    // Loading state is now tracked via operation system
    // Just return a new AbortController for code that still expects it
    return loading ? new AbortController() : undefined;
  },
  internal_toggleMessageInToolsCalling: (loading, id) => {
    return get().internal_toggleLoadingArrays('messageInToolsCallingIds', loading, id);
  },
  internal_toggleSearchWorkflow: (loading, id) => {
    return get().internal_toggleLoadingArrays('searchWorkflowLoadingIds', loading, id);
  },

  internal_toggleToolCallingStreaming: (id, streaming) => {
    const previous = get().toolCallingStreamIds;
    const next = produce(previous, (draft) => {
      if (!!streaming) {
        draft[id] = streaming;
      } else {
        delete draft[id];
      }
    });

    if (isEqual(previous, next)) return;

    set(
      { toolCallingStreamIds: next },

      false,
      `toggleToolCallingStreaming/${!!streaming ? 'start' : 'end'}`,
    );
  },
});
