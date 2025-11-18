import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useChatStore } from '@/store/chat/store';

import { operationSelectors } from '../selectors';

describe('Operation Selectors', () => {
  beforeEach(() => {
    useChatStore.setState(useChatStore.getInitialState());
  });

  describe('getOperationsByType', () => {
    it('should return operations of specific type', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        });

        result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        });

        result.current.startOperation({
          type: 'reasoning',
          context: { sessionId: 'session1' },
        });
      });

      const generateOps = operationSelectors.getOperationsByType('generateAI')(result.current);
      const reasoningOps = operationSelectors.getOperationsByType('reasoning')(result.current);

      expect(generateOps).toHaveLength(2);
      expect(reasoningOps).toHaveLength(1);
    });
  });

  describe('getCurrentContextOperations', () => {
    it('should return operations for current active session/topic', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        // Set active session and topic
        useChatStore.setState({ activeId: 'session1', activeTopicId: 'topic1' });

        result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1', topicId: 'topic1' },
        });

        result.current.startOperation({
          type: 'reasoning',
          context: { sessionId: 'session1', topicId: 'topic1' },
        });

        // Operation in different context
        result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session2', topicId: 'topic2' },
        });
      });

      const currentOps = operationSelectors.getCurrentContextOperations(result.current);

      expect(currentOps).toHaveLength(2);
      expect(currentOps.every((op) => op.context.sessionId === 'session1')).toBe(true);
      expect(currentOps.every((op) => op.context.topicId === 'topic1')).toBe(true);
    });
  });

  describe('hasAnyRunningOperation', () => {
    it('should return true if any operation is running', () => {
      const { result } = renderHook(() => useChatStore());

      expect(operationSelectors.hasAnyRunningOperation(result.current)).toBe(false);

      let opId: string;

      act(() => {
        opId = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        }).operationId;
      });

      expect(operationSelectors.hasAnyRunningOperation(result.current)).toBe(true);

      act(() => {
        result.current.completeOperation(opId!);
      });

      expect(operationSelectors.hasAnyRunningOperation(result.current)).toBe(false);
    });
  });

  describe('hasRunningOperationType', () => {
    it('should return true if specific type is running', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        });
      });

      expect(operationSelectors.hasRunningOperationType('generateAI')(result.current)).toBe(true);
      expect(operationSelectors.hasRunningOperationType('reasoning')(result.current)).toBe(false);
    });
  });

  describe('canSendMessage', () => {
    it('should return false when operations are running in current context', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({ activeId: 'session1', activeTopicId: 'topic1' });
      });

      expect(operationSelectors.canSendMessage(result.current)).toBe(true);

      act(() => {
        result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1', topicId: 'topic1' },
        });
      });

      expect(operationSelectors.canSendMessage(result.current)).toBe(false);
    });
  });

  describe('canInterrupt', () => {
    it('should return true when operations can be cancelled', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({ activeId: 'session1', activeTopicId: 'topic1' });
      });

      expect(operationSelectors.canInterrupt(result.current)).toBe(false);

      act(() => {
        result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1', topicId: 'topic1' },
        });
      });

      expect(operationSelectors.canInterrupt(result.current)).toBe(true);
    });
  });

  describe('getCurrentOperationLabel', () => {
    it('should return label of most recent running operation', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({ activeId: 'session1', activeTopicId: 'topic1' });

        result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1', topicId: 'topic1' },
          label: 'Generating response...',
        });

        // Simulate some time passing
        setTimeout(() => {
          result.current.startOperation({
            type: 'reasoning',
            context: { sessionId: 'session1', topicId: 'topic1' },
            label: 'Thinking...',
          });
        }, 10);
      });

      // Should return the most recent operation's label
      const label = operationSelectors.getCurrentOperationLabel(result.current);
      expect(label).toBeTruthy();
    });
  });

  describe('isMessageProcessing', () => {
    it('should return true if message has running operations', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1', messageId: 'msg1' },
        });
      });

      expect(operationSelectors.isMessageProcessing('msg1')(result.current)).toBe(true);
      expect(operationSelectors.isMessageProcessing('msg2')(result.current)).toBe(false);
    });
  });

  describe('getOperationContextFromMessage', () => {
    it('should return operation context from message ID', () => {
      const { result } = renderHook(() => useChatStore());

      let opId: string;

      act(() => {
        opId = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1', topicId: 'topic1', messageId: 'msg1' },
        }).operationId;

        result.current.associateMessageWithOperation('msg1', opId!);
      });

      const context = operationSelectors.getOperationContextFromMessage('msg1')(result.current);

      expect(context).toBeDefined();
      expect(context?.sessionId).toBe('session1');
      expect(context?.topicId).toBe('topic1');
      expect(context?.messageId).toBe('msg1');
    });
  });

  describe('backward compatibility selectors', () => {
    it('isAIGenerating should work', () => {
      const { result } = renderHook(() => useChatStore());

      expect(operationSelectors.isAIGenerating(result.current)).toBe(false);

      act(() => {
        result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        });
      });

      expect(operationSelectors.isAIGenerating(result.current)).toBe(true);
    });

    it('isSendingMessage should work', () => {
      const { result } = renderHook(() => useChatStore());

      expect(operationSelectors.isSendingMessage(result.current)).toBe(false);

      act(() => {
        result.current.startOperation({
          type: 'sendMessage',
          context: { sessionId: 'session1' },
        });
      });

      expect(operationSelectors.isSendingMessage(result.current)).toBe(true);
    });

    it('isInRAGFlow should work', () => {
      const { result } = renderHook(() => useChatStore());

      expect(operationSelectors.isInRAGFlow(result.current)).toBe(false);

      act(() => {
        result.current.startOperation({
          type: 'rag',
          context: { sessionId: 'session1' },
        });
      });

      expect(operationSelectors.isInRAGFlow(result.current)).toBe(true);
    });
  });
});
