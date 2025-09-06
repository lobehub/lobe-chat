import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useChatStore } from '../../../../store';

describe('Cancel send message functionality tests', () => {
  describe('cancelSendMessageInServer', () => {
    it('should be able to call cancel method normally', () => {
      const { result } = renderHook(() => useChatStore());

      // Initial state setup
      act(() => {
        useChatStore.setState({
          activeId: 'session-1',
          activeTopicId: 'topic-1',
          mainSendMessageOperations: {},
        });
      });

      // Test method exists
      expect(typeof result.current.cancelSendMessageInServer).toBe('function');

      // Test method can be called safely
      expect(() => {
        act(() => {
          result.current.cancelSendMessageInServer();
        });
      }).not.toThrow();
    });

    it('should be able to call with specified topic ID', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({
          activeId: 'session-1',
          mainSendMessageOperations: {},
        });
      });

      expect(() => {
        act(() => {
          result.current.cancelSendMessageInServer('topic-2');
        });
      }).not.toThrow();
    });
  });

  describe('clearSendMessageError', () => {
    it('should be able to call clear error method normally', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({
          activeId: 'session-1',
          activeTopicId: 'topic-1',
          mainSendMessageOperations: {},
        });
      });

      expect(typeof result.current.clearSendMessageError).toBe('function');

      expect(() => {
        act(() => {
          result.current.clearSendMessageError();
        });
      }).not.toThrow();
    });
  });

  describe('Internal methods', () => {
    it('should have internal state management methods', () => {
      const { result } = renderHook(() => useChatStore());

      expect(typeof result.current.internal_toggleSendMessageOperation).toBe('function');
      expect(typeof result.current.internal_updateSendMessageOperation).toBe('function');
    });

    it('internal_toggleSendMessageOperation should work normally', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        useChatStore.setState({ mainSendMessageOperations: {} });
      });

      expect(() => {
        act(() => {
          const abortController = result.current.internal_toggleSendMessageOperation(
            'test-key',
            true,
          );
          expect(abortController).toBeInstanceOf(AbortController);
        });
      }).not.toThrow();
    });
  });

  describe('State structure', () => {
    it('should have mainSendMessageOperations state', () => {
      const { result } = renderHook(() => useChatStore());

      // Ensure state exists
      expect(result.current.mainSendMessageOperations).toBeDefined();
      expect(typeof result.current.mainSendMessageOperations).toBe('object');
    });
  });
});
