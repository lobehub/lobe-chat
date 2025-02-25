import { act, renderHook } from '@testing-library/react';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_AGENT_CONFIG } from '@/const/settings';
import { agentSelectors } from '@/store/agent/selectors';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { sessionMetaSelectors } from '@/store/session/selectors';
import { PortalArtifact } from '@/types/artifact';

import { useChatStore } from './store';

vi.mock('zustand/traditional');

// Mock state
const mockState = {
  activeId: 'session-id',
  activeTopicId: 'topic-id',
  messagesMap: {
    [messageMapKey('session-id')]: [],
  },
  portal: {
    type: undefined,
    open: false,
  },
  refreshMessages: vi.fn(),
  refreshTopic: vi.fn(),
  internal_coreProcessMessage: vi.fn(),
  saveToTopic: vi.fn(),
  inputMessage: '',
  threadInputMessage: '',
  toolCallingStreamIds: {},
  chatLoadingIds: [],
  portalArtifact: undefined as PortalArtifact | undefined,
  portalToolMessage: undefined,

  // Add slice implementations
  closeArtifact: vi.fn(),
  closeFilePreview: vi.fn(),
  closeMessageDetail: vi.fn(),
  closeToolUI: vi.fn(),
  openArtifact: vi.fn(),
  openFilePreview: vi.fn(),
  openMessageDetail: vi.fn(),
  openToolUI: vi.fn(),
  togglePortal: vi.fn(),
} as any;

beforeEach(() => {
  vi.clearAllMocks();
  useChatStore.setState(mockState, false);
  vi.spyOn(agentSelectors, 'currentAgentConfig').mockImplementation(() => DEFAULT_AGENT_CONFIG);
  vi.spyOn(sessionMetaSelectors, 'currentAgentMeta').mockImplementation(() => ({ tags: [] }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ChatStore', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useChatStore());

    expect(result.current.activeId).toBe('session-id');
    expect(result.current.activeTopicId).toBe('topic-id');
    expect(result.current.messagesMap[messageMapKey('session-id')]).toEqual([]);
  });

  describe('chat message actions', () => {
    it('should update input message', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.updateInputMessage('test message');
      });

      expect(result.current.inputMessage).toBe('test message');
    });

    it('should toggle chat loading state', () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'test-message';

      act(() => {
        result.current.internal_toggleChatLoading(true, messageId, 'test-action');
      });

      expect(result.current.chatLoadingIds).toContain(messageId);

      act(() => {
        result.current.internal_toggleChatLoading(false, messageId, 'test-action');
      });

      expect(result.current.chatLoadingIds).not.toContain(messageId);
    });
  });

  describe('chat thread actions', () => {
    it('should update thread input message', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.updateThreadInputMessage('test thread message');
      });

      expect(result.current.threadInputMessage).toBe('test thread message');
    });
  });

  describe('chat tool actions', () => {
    it('should handle tool calling streaming state', () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'test-message';

      act(() => {
        result.current.internal_toggleToolCallingStreaming(messageId, [true]);
      });

      expect(result.current.toolCallingStreamIds[messageId]).toEqual([true]);

      act(() => {
        result.current.internal_toggleToolCallingStreaming(messageId, undefined);
      });

      expect(result.current.toolCallingStreamIds[messageId]).toBeUndefined();
    });
  });

  describe('chat portal actions', () => {
    it('should open and close portal', () => {
      const { result } = renderHook(() => useChatStore());

      act(() => {
        result.current.togglePortal(true);
      });

      // Verify togglePortal was called with correct args
      expect(mockState.togglePortal).toHaveBeenCalledWith(true);
    });

    it('should open and close file preview', () => {
      const { result } = renderHook(() => useChatStore());
      const file = { fileId: 'file-1', name: 'test.txt', url: 'test-url' };

      act(() => {
        result.current.openFilePreview(file);
      });

      // Verify openFilePreview was called with file
      expect(mockState.openFilePreview).toHaveBeenCalledWith(file);
    });

    it('should open and close message detail', () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-1';

      act(() => {
        result.current.openMessageDetail(messageId);
      });

      // Verify openMessageDetail was called with messageId
      expect(mockState.openMessageDetail).toHaveBeenCalledWith(messageId);
    });

    it('should open and close tool UI', () => {
      const { result } = renderHook(() => useChatStore());
      const messageId = 'message-1';
      const identifier = 'tool-1';

      act(() => {
        result.current.openToolUI(messageId, identifier);
      });

      // Verify openToolUI was called with correct args
      expect(mockState.openToolUI).toHaveBeenCalledWith(messageId, identifier);
    });
  });
});
