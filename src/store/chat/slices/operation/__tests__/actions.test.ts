import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useChatStore } from '@/store/chat/store';

describe('Operation Actions', () => {
  beforeEach(() => {
    useChatStore.setState(useChatStore.getInitialState());
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('startOperation', () => {
    it('should create a new operation with correct initial state', () => {
      const { result } = renderHook(() => useChatStore());

      let operationId: string;
      let abortController: AbortController;

      act(() => {
        const res = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1', topicId: 'topic1', messageId: 'msg1' },
          label: 'Generating...',
        });
        operationId = res.operationId;
        abortController = res.abortController;
      });

      const operation = result.current.operations[operationId!];

      expect(operation).toBeDefined();
      expect(operation.type).toBe('generateAI');
      expect(operation.status).toBe('running');
      expect(operation.context.sessionId).toBe('session1');
      expect(operation.context.topicId).toBe('topic1');
      expect(operation.context.messageId).toBe('msg1');
      expect(operation.label).toBe('Generating...');
      expect(operation.abortController).toBe(abortController!);
    });

    it('should inherit context from parent operation', () => {
      const { result } = renderHook(() => useChatStore());

      let parentOpId: string;
      let childOpId: string;

      act(() => {
        // Create parent operation
        const parent = result.current.startOperation({
          type: 'sendMessage',
          context: { sessionId: 'session1', topicId: 'topic1' },
        });
        parentOpId = parent.operationId;

        // Create child operation (inherits context)
        const child = result.current.startOperation({
          type: 'generateAI',
          context: { messageId: 'msg1' }, // Only override messageId
          parentOperationId: parentOpId,
        });
        childOpId = child.operationId;
      });

      const childOp = result.current.operations[childOpId!];

      expect(childOp.context.sessionId).toBe('session1'); // Inherited
      expect(childOp.context.topicId).toBe('topic1'); // Inherited
      expect(childOp.context.messageId).toBe('msg1'); // Overridden
      expect(childOp.parentOperationId).toBe(parentOpId!);
    });

    it('should fully inherit parent context when child context is undefined', () => {
      const { result } = renderHook(() => useChatStore());

      let parentOpId: string;
      let childOpId: string;

      act(() => {
        // Create parent operation with full context
        const parent = result.current.startOperation({
          type: 'sendMessage',
          context: { sessionId: 'session1', topicId: 'topic1', messageId: 'msg1' },
        });
        parentOpId = parent.operationId;

        // Create child operation without context (undefined)
        const child = result.current.startOperation({
          type: 'generateAI',
          parentOperationId: parentOpId,
        });
        childOpId = child.operationId;
      });

      const childOp = result.current.operations[childOpId!];

      // Should fully inherit parent's context
      expect(childOp.context.sessionId).toBe('session1');
      expect(childOp.context.topicId).toBe('topic1');
      expect(childOp.context.messageId).toBe('msg1');
      expect(childOp.parentOperationId).toBe(parentOpId!);
    });

    it('should update indexes correctly', () => {
      const { result } = renderHook(() => useChatStore());

      let operationId: string;

      act(() => {
        operationId = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1', topicId: 'topic1', messageId: 'msg1' },
        }).operationId;
      });

      // Check type index
      expect(result.current.operationsByType.generateAI).toContain(operationId!);

      // Check message index
      expect(result.current.operationsByMessage.msg1).toContain(operationId!);

      // Check context index
      const contextKey = 'session1_topic1';
      expect(result.current.operationsByContext[contextKey]).toContain(operationId!);
    });
  });

  describe('completeOperation', () => {
    it('should mark operation as completed with correct metadata', () => {
      const { result } = renderHook(() => useChatStore());

      let operationId: string;

      act(() => {
        operationId = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        }).operationId;
      });

      const startTime = result.current.operations[operationId!].metadata.startTime;

      act(() => {
        result.current.completeOperation(operationId!);
      });

      const operation = result.current.operations[operationId!];

      expect(operation.status).toBe('completed');
      expect(operation.metadata.endTime).toBeDefined();
      expect(operation.metadata.duration).toBeDefined();
      expect(operation.metadata.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('cancelOperation', () => {
    it('should cancel operation and abort controller', () => {
      const { result } = renderHook(() => useChatStore());

      let operationId: string;
      let abortController: AbortController;

      act(() => {
        const res = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        });
        operationId = res.operationId;
        abortController = res.abortController;
      });

      act(() => {
        result.current.cancelOperation(operationId!, 'User cancelled');
      });

      const operation = result.current.operations[operationId!];

      expect(operation.status).toBe('cancelled');
      expect(operation.metadata.cancelReason).toBe('User cancelled');
      expect(abortController!.signal.aborted).toBe(true);
    });

    it('should recursively cancel child operations', () => {
      const { result } = renderHook(() => useChatStore());

      let parentOpId: string;
      let child1OpId: string;
      let child2OpId: string;

      act(() => {
        parentOpId = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        }).operationId;

        child1OpId = result.current.startOperation({
          type: 'reasoning',
          parentOperationId: parentOpId,
        }).operationId;

        child2OpId = result.current.startOperation({
          type: 'toolCalling',
          parentOperationId: parentOpId,
        }).operationId;
      });

      act(() => {
        result.current.cancelOperation(parentOpId!);
      });

      expect(result.current.operations[parentOpId!].status).toBe('cancelled');
      expect(result.current.operations[child1OpId!].status).toBe('cancelled');
      expect(result.current.operations[child2OpId!].status).toBe('cancelled');
    });
  });

  describe('failOperation', () => {
    it('should mark operation as failed with error', () => {
      const { result } = renderHook(() => useChatStore());

      let operationId: string;

      act(() => {
        operationId = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        }).operationId;
      });

      act(() => {
        result.current.failOperation(operationId!, {
          type: 'NetworkError',
          message: 'Connection failed',
          code: 'ERR_NETWORK',
        });
      });

      const operation = result.current.operations[operationId!];

      expect(operation.status).toBe('failed');
      expect(operation.metadata.error).toEqual({
        type: 'NetworkError',
        message: 'Connection failed',
        code: 'ERR_NETWORK',
      });
    });
  });

  describe('cancelOperations (batch)', () => {
    it('should cancel operations matching filter', () => {
      const { result } = renderHook(() => useChatStore());

      let op1: string;
      let op2: string;
      let op3: string;

      act(() => {
        op1 = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        }).operationId;

        op2 = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        }).operationId;

        op3 = result.current.startOperation({
          type: 'reasoning',
          context: { sessionId: 'session1' },
        }).operationId;
      });

      act(() => {
        const cancelled = result.current.cancelOperations({ type: 'generateAI' });
        expect(cancelled).toHaveLength(2);
      });

      expect(result.current.operations[op1!].status).toBe('cancelled');
      expect(result.current.operations[op2!].status).toBe('cancelled');
      expect(result.current.operations[op3!].status).toBe('running'); // Not cancelled
    });
  });

  describe('associateMessageWithOperation', () => {
    it('should create message-operation mapping', () => {
      const { result } = renderHook(() => useChatStore());

      let operationId: string;

      act(() => {
        operationId = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        }).operationId;

        result.current.associateMessageWithOperation('msg1', operationId!);
      });

      expect(result.current.messageOperationMap.msg1).toBe(operationId!);
      expect(result.current.operationsByMessage.msg1).toContain(operationId!);
    });

    it('should update operationsByMessage index', () => {
      const { result } = renderHook(() => useChatStore());

      let op1: string;
      let op2: string;

      act(() => {
        op1 = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        }).operationId;

        op2 = result.current.startOperation({
          type: 'regenerate',
          context: { sessionId: 'session1' },
        }).operationId;

        // Associate same message with multiple operations
        result.current.associateMessageWithOperation('msg1', op1!);
        result.current.associateMessageWithOperation('msg1', op2!);
      });

      // Both operations should be in the index
      expect(result.current.operationsByMessage.msg1).toContain(op1!);
      expect(result.current.operationsByMessage.msg1).toContain(op2!);
      expect(result.current.operationsByMessage.msg1).toHaveLength(2);
    });

    it('should not duplicate operation IDs in operationsByMessage', () => {
      const { result } = renderHook(() => useChatStore());

      let operationId: string;

      act(() => {
        operationId = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        }).operationId;

        // Associate same operation twice
        result.current.associateMessageWithOperation('msg1', operationId!);
        result.current.associateMessageWithOperation('msg1', operationId!);
      });

      // Should only appear once
      expect(result.current.operationsByMessage.msg1).toHaveLength(1);
      expect(result.current.operationsByMessage.msg1[0]).toBe(operationId!);
    });
  });

  describe('cleanupCompletedOperations', () => {
    it('should remove old completed operations', () => {
      const { result } = renderHook(() => useChatStore());

      let op1: string;
      let op2: string;

      act(() => {
        op1 = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        }).operationId;

        op2 = result.current.startOperation({
          type: 'generateAI',
          context: { sessionId: 'session1' },
        }).operationId;
      });

      act(() => {
        result.current.completeOperation(op1!);
      });

      // Manually set endTime to past
      act(() => {
        useChatStore.setState({
          operations: {
            ...result.current.operations,
            [op1!]: {
              ...result.current.operations[op1!],
              metadata: {
                ...result.current.operations[op1!].metadata,
                endTime: Date.now() - 120000, // 2 minutes ago
              },
            },
          },
        });
      });

      act(() => {
        result.current.cleanupCompletedOperations(60000); // 1 minute threshold
      });

      expect(result.current.operations[op1!]).toBeUndefined(); // Cleaned up
      expect(result.current.operations[op2!]).toBeDefined(); // Still running
    });
  });
});
