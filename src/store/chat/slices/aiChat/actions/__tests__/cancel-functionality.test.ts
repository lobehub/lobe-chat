import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useChatStore } from '../../../../store';

describe('取消发送消息功能测试', () => {
  describe('cancelSendMessageInServer', () => {
    it('应该可以正常调用取消方法', () => {
      const { result } = renderHook(() => useChatStore());

      // 初始状态设置
      act(() => {
        useChatStore.setState({
          activeId: 'session-1',
          activeTopicId: 'topic-1',
          mainSendMessageOperations: {},
        });
      });

      // 测试方法存在
      expect(typeof result.current.cancelSendMessageInServer).toBe('function');

      // 测试方法可以安全调用
      expect(() => {
        act(() => {
          result.current.cancelSendMessageInServer();
        });
      }).not.toThrow();
    });

    it('应该可以使用指定主题ID调用', () => {
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
    it('应该可以正常调用清除错误方法', () => {
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

  describe('内部方法', () => {
    it('应该有内部状态管理方法', () => {
      const { result } = renderHook(() => useChatStore());

      expect(typeof result.current.internal_toggleSendMessageOperation).toBe('function');
      expect(typeof result.current.internal_updateSendMessageOperation).toBe('function');
    });

    it('internal_toggleSendMessageOperation 应该可以正常工作', () => {
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

  describe('状态结构', () => {
    it('应该有 mainSendMessageOperations 状态', () => {
      const { result } = renderHook(() => useChatStore());

      // 确保状态存在
      expect(result.current.mainSendMessageOperations).toBeDefined();
      expect(typeof result.current.mainSendMessageOperations).toBe('object');
    });
  });
});
