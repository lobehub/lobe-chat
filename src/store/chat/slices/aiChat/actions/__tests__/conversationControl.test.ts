import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useChatStore } from '../../../../store';
import { messageMapKey } from '../../../../utils/messageMapKey';
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

describe('ConversationControl actions', () => {
  describe('stopGenerateMessage', () => {
    it('should abort generation and clear loading state when controller exists', () => {
      const abortController = new AbortController();

      act(() => {
        useChatStore.setState({ chatLoadingIdsAbortController: abortController });
      });

      const { result } = renderHook(() => useChatStore());
      const toggleLoadingSpy = vi.spyOn(result.current, 'internal_toggleChatLoading');

      act(() => {
        result.current.stopGenerateMessage();
      });

      expect(abortController.signal.aborted).toBe(true);
      expect(toggleLoadingSpy).toHaveBeenCalledWith(false, undefined, expect.any(String));
    });

    it('should do nothing when abort controller is not set', () => {
      act(() => {
        useChatStore.setState({ chatLoadingIdsAbortController: undefined });
      });

      const { result } = renderHook(() => useChatStore());
      const toggleLoadingSpy = vi.spyOn(result.current, 'internal_toggleChatLoading');

      act(() => {
        result.current.stopGenerateMessage();
      });

      expect(toggleLoadingSpy).not.toHaveBeenCalled();
    });
  });

  describe('cancelSendMessageInServer', () => {
    it('should abort operation and restore editor state when cancelling', () => {
      const { result } = renderHook(() => useChatStore());
      const mockAbort = vi.fn();
      const mockSetJSONState = vi.fn();

      act(() => {
        useChatStore.setState({
          activeId: TEST_IDS.SESSION_ID,
          activeTopicId: TEST_IDS.TOPIC_ID,
          mainSendMessageOperations: {
            [messageMapKey(TEST_IDS.SESSION_ID, TEST_IDS.TOPIC_ID)]: {
              isLoading: true,
              abortController: { abort: mockAbort, signal: {} as any },
              inputEditorTempState: { content: 'saved content' },
            },
          },
          mainInputEditor: { setJSONState: mockSetJSONState } as any,
        });
      });

      act(() => {
        result.current.cancelSendMessageInServer();
      });

      expect(mockAbort).toHaveBeenCalledWith('User cancelled sendMessage operation');
      expect(
        result.current.mainSendMessageOperations[
          messageMapKey(TEST_IDS.SESSION_ID, TEST_IDS.TOPIC_ID)
        ]?.isLoading,
      ).toBe(false);
      expect(mockSetJSONState).toHaveBeenCalledWith({ content: 'saved content' });
    });

    it('should cancel operation for specified topic ID', () => {
      const { result } = renderHook(() => useChatStore());
      const mockAbort = vi.fn();
      const customTopicId = 'custom-topic-id';

      act(() => {
        useChatStore.setState({
          activeId: TEST_IDS.SESSION_ID,
          mainSendMessageOperations: {
            [messageMapKey(TEST_IDS.SESSION_ID, customTopicId)]: {
              isLoading: true,
              abortController: { abort: mockAbort, signal: {} as any },
            },
          },
        });
      });

      act(() => {
        result.current.cancelSendMessageInServer(customTopicId);
      });

      expect(mockAbort).toHaveBeenCalledWith('User cancelled sendMessage operation');
    });

    it('should handle gracefully when operation does not exist', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({ mainSendMessageOperations: {} });
      });

      expect(() => {
        act(() => {
          result.current.cancelSendMessageInServer('non-existing-topic');
        });
      }).not.toThrow();
    });
  });

  describe('clearSendMessageError', () => {
    it('should clear error state for current topic', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({
          activeId: TEST_IDS.SESSION_ID,
          activeTopicId: TEST_IDS.TOPIC_ID,
          mainSendMessageOperations: {
            [messageMapKey(TEST_IDS.SESSION_ID, TEST_IDS.TOPIC_ID)]: {
              isLoading: false,
              inputSendErrorMsg: 'Some error',
            },
          },
        });
      });

      act(() => {
        result.current.clearSendMessageError();
      });

      expect(
        result.current.mainSendMessageOperations[
          messageMapKey(TEST_IDS.SESSION_ID, TEST_IDS.TOPIC_ID)
        ],
      ).toBeUndefined();
    });

    it('should handle gracefully when no error operation exists', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({ mainSendMessageOperations: {} });
      });

      expect(() => {
        act(() => {
          result.current.clearSendMessageError();
        });
      }).not.toThrow();
    });
  });

  describe('internal_toggleSendMessageOperation', () => {
    it('should create new send operation with abort controller', () => {
      const { result } = renderHook(() => useChatStore());
      let abortController: AbortController | undefined;

      act(() => {
        abortController = result.current.internal_toggleSendMessageOperation('test-key', true);
      });

      expect(abortController!).toBeInstanceOf(AbortController);
      expect(result.current.mainSendMessageOperations['test-key']?.isLoading).toBe(true);
      expect(result.current.mainSendMessageOperations['test-key']?.abortController).toBe(
        abortController,
      );
    });

    it('should stop send operation and clear abort controller', () => {
      const { result } = renderHook(() => useChatStore());
      const mockAbortController = { abort: vi.fn() } as any;

      let abortController: AbortController | undefined;
      act(() => {
        result.current.internal_updateSendMessageOperation('test-key', {
          isLoading: true,
          abortController: mockAbortController,
        });

        abortController = result.current.internal_toggleSendMessageOperation('test-key', false);
      });

      expect(abortController).toBeUndefined();
      expect(result.current.mainSendMessageOperations['test-key']?.isLoading).toBe(false);
      expect(result.current.mainSendMessageOperations['test-key']?.abortController).toBeNull();
    });

    it('should call abort with cancel reason when stopping', () => {
      const { result } = renderHook(() => useChatStore());
      const mockAbortController = { abort: vi.fn() } as any;

      act(() => {
        result.current.internal_updateSendMessageOperation('test-key', {
          isLoading: true,
          abortController: mockAbortController,
        });

        result.current.internal_toggleSendMessageOperation('test-key', false, 'Test cancel reason');
      });

      expect(mockAbortController.abort).toHaveBeenCalledWith('Test cancel reason');
    });

    it('should support multiple parallel operations', () => {
      const { result } = renderHook(() => useChatStore());

      let abortController1, abortController2;
      act(() => {
        abortController1 = result.current.internal_toggleSendMessageOperation('key1', true);
        abortController2 = result.current.internal_toggleSendMessageOperation('key2', true);
      });

      expect(result.current.mainSendMessageOperations['key1']?.isLoading).toBe(true);
      expect(result.current.mainSendMessageOperations['key2']?.isLoading).toBe(true);
      expect(abortController1).not.toBe(abortController2);
    });
  });

  describe('internal_updateSendMessageOperation', () => {
    it('should update operation state', () => {
      const { result } = renderHook(() => useChatStore());
      const mockAbortController = new AbortController();

      act(() => {
        result.current.internal_updateSendMessageOperation('test-key', {
          isLoading: true,
          abortController: mockAbortController,
          inputSendErrorMsg: 'test error',
        });
      });

      expect(result.current.mainSendMessageOperations['test-key']).toEqual({
        isLoading: true,
        abortController: mockAbortController,
        inputSendErrorMsg: 'test error',
      });
    });

    it('should support partial update of operation state', () => {
      const { result } = renderHook(() => useChatStore());
      const initialController = new AbortController();

      act(() => {
        result.current.internal_updateSendMessageOperation('test-key', {
          isLoading: true,
          abortController: initialController,
        });

        result.current.internal_updateSendMessageOperation('test-key', {
          inputSendErrorMsg: 'new error',
        });
      });

      expect(result.current.mainSendMessageOperations['test-key']).toEqual({
        isLoading: true,
        abortController: initialController,
        inputSendErrorMsg: 'new error',
      });
    });
  });

  describe('switchMessageBranch', () => {
    it('should switch to a different message branch', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = TEST_IDS.MESSAGE_ID;
      const branchIndex = 1;

      const optimisticUpdateSpy = vi
        .spyOn(result.current, 'optimisticUpdateMessageMetadata')
        .mockResolvedValue(undefined);

      await act(async () => {
        await result.current.switchMessageBranch(messageId, branchIndex);
      });

      expect(optimisticUpdateSpy).toHaveBeenCalledWith(messageId, { activeBranchIndex: branchIndex });
    });

    it('should handle switching to branch 0', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = TEST_IDS.MESSAGE_ID;
      const branchIndex = 0;

      const optimisticUpdateSpy = vi
        .spyOn(result.current, 'optimisticUpdateMessageMetadata')
        .mockResolvedValue(undefined);

      await act(async () => {
        await result.current.switchMessageBranch(messageId, branchIndex);
      });

      expect(optimisticUpdateSpy).toHaveBeenCalledWith(messageId, { activeBranchIndex: 0 });
    });

    it('should handle errors gracefully when optimistic update fails', async () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = TEST_IDS.MESSAGE_ID;
      const branchIndex = 2;

      const optimisticUpdateSpy = vi
        .spyOn(result.current, 'optimisticUpdateMessageMetadata')
        .mockRejectedValue(new Error('Update failed'));

      await expect(
        act(async () => {
          await result.current.switchMessageBranch(messageId, branchIndex);
        }),
      ).rejects.toThrow('Update failed');

      expect(optimisticUpdateSpy).toHaveBeenCalledWith(messageId, { activeBranchIndex: branchIndex });
    });
  });
});
