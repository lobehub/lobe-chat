import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useChatStore } from '../../../../store';
import { TEST_IDS } from './fixtures';
import { resetTestEnvironment } from './helpers';

// Keep zustand mock as it's needed globally
vi.mock('zustand/traditional');

beforeEach(() => {
  resetTestEnvironment();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('StreamingStates actions', () => {
  describe('internal_toggleChatLoading', () => {
    it('should enable loading state with new abort controller', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleChatLoading(true, TEST_IDS.MESSAGE_ID, 'test-action');
      });

      const state = useChatStore.getState();
      expect(state.chatLoadingIdsAbortController).toBeInstanceOf(AbortController);
      expect(state.chatLoadingIds).toEqual([TEST_IDS.MESSAGE_ID]);
    });

    it('should disable loading state and clear abort controller', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleChatLoading(true, TEST_IDS.MESSAGE_ID, 'start');
        result.current.internal_toggleChatLoading(false, undefined, 'stop');
      });

      const state = useChatStore.getState();
      expect(state.chatLoadingIdsAbortController).toBeUndefined();
      expect(state.chatLoadingIds).toEqual([]);
    });

    it('should manage beforeunload event listener', () => {
      const { result } = renderHook(() => useChatStore());
      const addListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeListenerSpy = vi.spyOn(window, 'removeEventListener');

      act(() => {
        result.current.internal_toggleChatLoading(true, TEST_IDS.MESSAGE_ID, 'start');
      });

      expect(addListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

      act(() => {
        result.current.internal_toggleChatLoading(false, undefined, 'stop');
      });

      expect(removeListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('should reuse existing abort controller', () => {
      const existingController = new AbortController();

      act(() => {
        useChatStore.setState({ chatLoadingIdsAbortController: existingController });
      });

      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleChatLoading(true, TEST_IDS.MESSAGE_ID, 'test');
      });

      const state = useChatStore.getState();
      expect(state.chatLoadingIdsAbortController).toStrictEqual(existingController);
    });
  });

  describe('internal_toggleToolCallingStreaming', () => {
    it('should track tool calling stream status', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleToolCallingStreaming(TEST_IDS.MESSAGE_ID, [true]);
      });

      expect(result.current.toolCallingStreamIds[TEST_IDS.MESSAGE_ID]).toEqual([true]);
    });

    it('should clear tool calling stream status', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleToolCallingStreaming(TEST_IDS.MESSAGE_ID, [true]);
        result.current.internal_toggleToolCallingStreaming(TEST_IDS.MESSAGE_ID, undefined);
      });

      expect(result.current.toolCallingStreamIds[TEST_IDS.MESSAGE_ID]).toBeUndefined();
    });
  });

  describe('internal_toggleSearchWorkflow', () => {
    it('should enable search workflow loading state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleSearchWorkflow(true, TEST_IDS.MESSAGE_ID);
      });

      const state = useChatStore.getState();
      expect(state.searchWorkflowLoadingIds).toEqual([TEST_IDS.MESSAGE_ID]);
    });

    it('should disable search workflow loading state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleSearchWorkflow(true, TEST_IDS.MESSAGE_ID);
        result.current.internal_toggleSearchWorkflow(false, TEST_IDS.MESSAGE_ID);
      });

      const state = useChatStore.getState();
      expect(state.searchWorkflowLoadingIds).toEqual([]);
    });
  });

  describe('internal_toggleChatReasoning', () => {
    it('should enable reasoning loading state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleChatReasoning(true, TEST_IDS.MESSAGE_ID, 'test-action');
      });

      const state = useChatStore.getState();
      expect(state.reasoningLoadingIds).toEqual([TEST_IDS.MESSAGE_ID]);
    });

    it('should disable reasoning loading state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleChatReasoning(true, TEST_IDS.MESSAGE_ID, 'start');
        result.current.internal_toggleChatReasoning(false, TEST_IDS.MESSAGE_ID, 'stop');
      });

      const state = useChatStore.getState();
      expect(state.reasoningLoadingIds).toEqual([]);
    });
  });

  describe('internal_toggleMessageInToolsCalling', () => {
    it('should enable tools calling state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleMessageInToolsCalling(true, TEST_IDS.MESSAGE_ID);
      });

      const state = useChatStore.getState();
      expect(state.messageInToolsCallingIds).toEqual([TEST_IDS.MESSAGE_ID]);
    });

    it('should disable tools calling state', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.internal_toggleMessageInToolsCalling(true, TEST_IDS.MESSAGE_ID);
        result.current.internal_toggleMessageInToolsCalling(false, TEST_IDS.MESSAGE_ID);
      });

      const state = useChatStore.getState();
      expect(state.messageInToolsCallingIds).toEqual([]);
    });
  });
});
