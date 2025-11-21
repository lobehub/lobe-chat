import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useChatStore } from '@/store/chat/store';

import { chatToolSelectors } from './selectors';

describe('chatToolSelectors', () => {
  beforeEach(() => {
    useChatStore.setState(useChatStore.getInitialState());
  });

  describe('isDallEImageGenerating', () => {
    it('should return true when DALL-E image is generating for message', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({
          dalleImageLoading: {
            msg1: true,
            msg2: false,
          },
        });
      });

      expect(chatToolSelectors.isDallEImageGenerating('msg1')(result.current)).toBe(true);
      expect(chatToolSelectors.isDallEImageGenerating('msg2')(result.current)).toBe(false);
    });

    it('should return undefined when message not in loading state', () => {
      const { result } = renderHook(() => useChatStore());

      expect(chatToolSelectors.isDallEImageGenerating('msg1')(result.current)).toBeUndefined();
    });
  });

  describe('isGeneratingDallEImage', () => {
    it('should return true when any DALL-E image is generating', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({
          dalleImageLoading: {
            msg1: false,
            msg2: true,
            msg3: false,
          },
        });
      });

      expect(chatToolSelectors.isGeneratingDallEImage(result.current)).toBe(true);
    });

    it('should return false when no DALL-E images are generating', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({
          dalleImageLoading: {
            msg1: false,
            msg2: false,
          },
        });
      });

      expect(chatToolSelectors.isGeneratingDallEImage(result.current)).toBe(false);
    });

    it('should return false when dalleImageLoading is empty', () => {
      const { result } = renderHook(() => useChatStore());

      expect(chatToolSelectors.isGeneratingDallEImage(result.current)).toBe(false);
    });
  });

  describe('isInterpreterExecuting', () => {
    it('should return true when interpreter is executing for message', () => {
      const { result } = renderHook(() => useChatStore());

      let opId: string;

      act(() => {
        opId = result.current.startOperation({
          type: 'builtinToolInterpreter',
          context: { sessionId: 'session1', messageId: 'msg1' },
        }).operationId;

        result.current.associateMessageWithOperation('msg1', opId);
      });

      expect(chatToolSelectors.isInterpreterExecuting('msg1')(result.current)).toBe(true);
    });

    it('should return false when no operation exists for message', () => {
      const { result } = renderHook(() => useChatStore());

      expect(chatToolSelectors.isInterpreterExecuting('msg1')(result.current)).toBe(false);
    });

    it('should return false when operation is not builtinToolInterpreter', () => {
      const { result } = renderHook(() => useChatStore());

      let opId: string;

      act(() => {
        opId = result.current.startOperation({
          type: 'execAgentRuntime',
          context: { sessionId: 'session1', messageId: 'msg1' },
        }).operationId;

        result.current.associateMessageWithOperation('msg1', opId);
      });

      expect(chatToolSelectors.isInterpreterExecuting('msg1')(result.current)).toBe(false);
    });

    it('should return false when operation is completed', () => {
      const { result } = renderHook(() => useChatStore());

      let opId: string;

      act(() => {
        opId = result.current.startOperation({
          type: 'builtinToolInterpreter',
          context: { sessionId: 'session1', messageId: 'msg1' },
        }).operationId;

        result.current.associateMessageWithOperation('msg1', opId);
      });

      act(() => {
        result.current.completeOperation(opId);
      });

      expect(chatToolSelectors.isInterpreterExecuting('msg1')(result.current)).toBe(false);
    });
  });

  describe('isSearXNGSearching', () => {
    it('should return true when SearXNG search is running for message', () => {
      const { result } = renderHook(() => useChatStore());

      let opId: string;

      act(() => {
        opId = result.current.startOperation({
          type: 'builtinToolSearch',
          context: { sessionId: 'session1', messageId: 'msg1' },
        }).operationId;

        result.current.associateMessageWithOperation('msg1', opId);
      });

      expect(chatToolSelectors.isSearXNGSearching('msg1')(result.current)).toBe(true);
    });

    it('should return false when no operation exists', () => {
      const { result } = renderHook(() => useChatStore());

      expect(chatToolSelectors.isSearXNGSearching('msg1')(result.current)).toBe(false);
    });

    it('should return false when operation type is different', () => {
      const { result } = renderHook(() => useChatStore());

      let opId: string;

      act(() => {
        opId = result.current.startOperation({
          type: 'builtinToolInterpreter',
          context: { sessionId: 'session1', messageId: 'msg1' },
        }).operationId;

        result.current.associateMessageWithOperation('msg1', opId);
      });

      expect(chatToolSelectors.isSearXNGSearching('msg1')(result.current)).toBe(false);
    });

    it('should return false when operation is not running', () => {
      const { result } = renderHook(() => useChatStore());

      let opId: string;

      act(() => {
        opId = result.current.startOperation({
          type: 'builtinToolSearch',
          context: { sessionId: 'session1', messageId: 'msg1' },
        }).operationId;

        result.current.associateMessageWithOperation('msg1', opId);
        result.current.completeOperation(opId);
      });

      expect(chatToolSelectors.isSearXNGSearching('msg1')(result.current)).toBe(false);
    });
  });

  describe('isSearchingLocalFiles', () => {
    it('should return true when local system search is running', () => {
      const { result } = renderHook(() => useChatStore());

      let opId: string;

      act(() => {
        opId = result.current.startOperation({
          type: 'builtinToolLocalSystem',
          context: { sessionId: 'session1', messageId: 'msg1' },
        }).operationId;

        result.current.associateMessageWithOperation('msg1', opId);
      });

      expect(chatToolSelectors.isSearchingLocalFiles('msg1')(result.current)).toBe(true);
    });

    it('should return false when no operation exists', () => {
      const { result } = renderHook(() => useChatStore());

      expect(chatToolSelectors.isSearchingLocalFiles('msg1')(result.current)).toBe(false);
    });

    it('should return false when operation type is different', () => {
      const { result } = renderHook(() => useChatStore());

      let opId: string;

      act(() => {
        opId = result.current.startOperation({
          type: 'builtinToolSearch',
          context: { sessionId: 'session1', messageId: 'msg1' },
        }).operationId;

        result.current.associateMessageWithOperation('msg1', opId);
      });

      expect(chatToolSelectors.isSearchingLocalFiles('msg1')(result.current)).toBe(false);
    });

    it('should return false when operation is completed', () => {
      const { result } = renderHook(() => useChatStore());

      let opId: string;

      act(() => {
        opId = result.current.startOperation({
          type: 'builtinToolLocalSystem',
          context: { sessionId: 'session1', messageId: 'msg1' },
        }).operationId;

        result.current.associateMessageWithOperation('msg1', opId);
        result.current.completeOperation(opId);
      });

      expect(chatToolSelectors.isSearchingLocalFiles('msg1')(result.current)).toBe(false);
    });
  });
});
