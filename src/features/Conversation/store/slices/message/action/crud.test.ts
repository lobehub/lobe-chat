import type { UIChatMessage } from '@lobechat/types';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as messageServiceModule from '@/services/message';

import type { ConversationContext } from '../../../../types';
import { createStore } from '../../../index';

// Mock conversation-flow parse function (必须 mock，因为这是外部库)
vi.mock('@lobechat/conversation-flow', () => ({
  parse: (messages: UIChatMessage[]) => {
    const messageMap: Record<string, UIChatMessage> = {};
    for (const msg of messages) {
      messageMap[msg.id] = msg;
    }
    const flatList = [...messages].sort((a, b) => a.createdAt - b.createdAt);
    return { flatList, messageMap };
  },
}));

// Create a test store
const createTestStore = (context?: Partial<ConversationContext>) =>
  createStore({
    context: {
      agentId: 'test-session',
      topicId: null,
      threadId: null,
      ...context,
    },
  });

describe('Message CRUD Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  describe('createMessage', () => {
    it('should create a message with optimistic update', async () => {
      const createMessageSpy = vi
        .spyOn(messageServiceModule.messageService, 'createMessage')
        .mockResolvedValue({
          id: 'msg-1',
          messages: [
            {
              id: 'msg-1',
              content: 'Hello',
              role: 'user',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              meta: {},
            },
          ],
        });

      const store = createTestStore();

      let result: string | undefined;
      await act(async () => {
        result = await store.getState().createMessage({
          content: 'Hello',
          role: 'user',
          sessionId: 'test-session',
        });
      });

      expect(result).toBe('msg-1');
      expect(createMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Hello',
          role: 'user',
          sessionId: 'test-session',
        }),
      );
    });

    it('should handle creation error', async () => {
      vi.spyOn(messageServiceModule.messageService, 'createMessage').mockRejectedValue(
        new Error('Creation failed'),
      );

      const store = createTestStore();

      let result: string | undefined;
      await act(async () => {
        result = await store.getState().createMessage({
          content: 'Hello',
          role: 'user',
          sessionId: 'test-session',
        });
      });

      expect(result).toBeUndefined();
    });
  });

  describe('createTempMessage', () => {
    it('should create a temporary message for optimistic update', () => {
      const store = createTestStore();

      let tempId: string;
      act(() => {
        tempId = store.getState().createTempMessage({
          content: 'Temp message',
          role: 'user',
          sessionId: 'test-session',
        });
      });

      expect(tempId!).toMatch(/^tmp_/);

      const state = store.getState();
      expect(state.displayMessages.length).toBe(1);
      expect(state.displayMessages[0].content).toBe('Temp message');
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      const removeMessagesSpy = vi
        .spyOn(messageServiceModule.messageService, 'removeMessages')
        .mockResolvedValue({
          success: true,
          messages: [],
        });

      const store = createTestStore();

      const testMessage = {
        id: 'msg-1',
        content: 'Hello',
        role: 'user' as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        meta: {},
      };

      act(() => {
        store.getState().replaceMessages([testMessage]);
      });

      expect(store.getState().displayMessages.length).toBe(1);
      expect(store.getState().displayMessages[0].id).toBe('msg-1');

      await store.getState().deleteMessage('msg-1');

      expect(removeMessagesSpy).toHaveBeenCalledWith(['msg-1'], {
        sessionId: 'test-session',
        topicId: undefined,
      });
    });

    it('should delete assistantGroup with children and tool results', async () => {
      const removeMessagesSpy = vi
        .spyOn(messageServiceModule.messageService, 'removeMessages')
        .mockResolvedValue({
          success: true,
          messages: [],
        });

      const store = createTestStore();

      const groupMessage: UIChatMessage = {
        id: 'group-1',
        content: '',
        role: 'assistantGroup',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        meta: {},
        children: [
          {
            id: 'child-1',
            content: 'Response',
            tools: [
              {
                id: 'tool-1',
                type: 'default',
                identifier: 'test',
                apiName: 'test',
                arguments: '',
                result: { id: 'tool-result-1', content: 'tool result content' },
              },
            ],
          },
        ],
      };

      act(() => {
        store.getState().replaceMessages([groupMessage]);
      });

      await act(async () => {
        await store.getState().deleteMessage('group-1');
      });

      expect(removeMessagesSpy).toHaveBeenCalledWith(
        ['group-1', 'child-1', 'tool-result-1'],
        expect.any(Object),
      );
    });

    it('should do nothing if message not found', async () => {
      const removeMessagesSpy = vi.spyOn(messageServiceModule.messageService, 'removeMessages');

      const store = createTestStore();

      await act(async () => {
        await store.getState().deleteMessage('nonexistent');
      });

      expect(removeMessagesSpy).not.toHaveBeenCalled();
    });
  });

  describe('deleteMessages', () => {
    it('should delete multiple messages', async () => {
      const removeMessagesSpy = vi
        .spyOn(messageServiceModule.messageService, 'removeMessages')
        .mockResolvedValue({
          success: true,
          messages: [],
        });

      const store = createTestStore();

      act(() => {
        store.getState().internal_dispatchMessage({
          type: 'createMessage',
          id: 'msg-1',
          value: { content: 'Hello', role: 'user', sessionId: 'test-session' },
        });
        store.getState().internal_dispatchMessage({
          type: 'createMessage',
          id: 'msg-2',
          value: { content: 'World', role: 'assistant', sessionId: 'test-session' },
        });
      });

      expect(store.getState().displayMessages.length).toBe(2);

      await act(async () => {
        await store.getState().deleteMessages(['msg-1', 'msg-2']);
      });

      expect(removeMessagesSpy).toHaveBeenCalledWith(['msg-1', 'msg-2'], expect.any(Object));
    });
  });

  describe('deleteToolMessage', () => {
    it('should delete tool message and remove from parent', async () => {
      const removeMessageSpy = vi
        .spyOn(messageServiceModule.messageService, 'removeMessage')
        .mockResolvedValue({
          success: true,
          messages: [],
        });

      const store = createTestStore();

      act(() => {
        store.getState().internal_dispatchMessage({
          type: 'createMessage',
          id: 'assistant-1',
          value: {
            content: '',
            role: 'assistant',
            sessionId: 'test-session',
          },
        });
        store.getState().internal_dispatchMessage({
          type: 'addMessageTool',
          id: 'assistant-1',
          value: {
            id: 'tool-call-1',
            type: 'default',
            identifier: 'test',
            apiName: 'testFunc',
            arguments: '{}',
          },
        });
        store.getState().internal_dispatchMessage({
          type: 'createMessage',
          id: 'tool-msg-1',
          value: {
            content: 'Tool result',
            role: 'tool',
            sessionId: 'test-session',
            parentId: 'assistant-1',
            tool_call_id: 'tool-call-1',
          },
        });
      });

      await act(async () => {
        await store.getState().deleteToolMessage('tool-msg-1');
      });

      expect(removeMessageSpy).toHaveBeenCalledWith('tool-msg-1', expect.any(Object));
    });
  });

  describe('clearMessages', () => {
    it('should clear all messages in the conversation', async () => {
      const removeMessagesByAssistantSpy = vi
        .spyOn(messageServiceModule.messageService, 'removeMessagesByAssistant')
        .mockResolvedValue({ rowsAffected: 1 } as any);

      const store = createTestStore();

      act(() => {
        store.getState().internal_dispatchMessage({
          type: 'createMessage',
          id: 'msg-1',
          value: { content: 'Hello', role: 'user', sessionId: 'test-session' },
        });
      });

      await act(async () => {
        await store.getState().clearMessages();
      });

      expect(removeMessagesByAssistantSpy).toHaveBeenCalledWith('test-session', undefined);
      expect(store.getState().displayMessages.length).toBe(0);
    });
  });

  describe('updateMessageContent', () => {
    it('should update message content', async () => {
      const updateMessageSpy = vi
        .spyOn(messageServiceModule.messageService, 'updateMessage')
        .mockResolvedValue({
          success: true,
          messages: [
            {
              id: 'msg-1',
              content: 'Updated content',
              role: 'user',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              meta: {},
            },
          ],
        });

      const store = createTestStore();

      act(() => {
        store.getState().internal_dispatchMessage({
          type: 'createMessage',
          id: 'msg-1',
          value: { content: 'Hello', role: 'user', sessionId: 'test-session' },
        });
      });

      await act(async () => {
        await store.getState().updateMessageContent('msg-1', 'Updated content');
      });

      expect(updateMessageSpy).toHaveBeenCalledWith(
        'msg-1',
        expect.objectContaining({ content: 'Updated content' }),
        expect.any(Object),
      );
    });
  });

  describe('updateMessageMetadata', () => {
    it('should update message metadata', async () => {
      const updateMessageMetadataSpy = vi
        .spyOn(messageServiceModule.messageService, 'updateMessageMetadata')
        .mockResolvedValue({
          success: true,
          messages: [],
        });

      const store = createTestStore();

      act(() => {
        store.getState().internal_dispatchMessage({
          type: 'createMessage',
          id: 'msg-1',
          value: { content: 'Hello', role: 'user', sessionId: 'test-session' },
        });
      });

      await act(async () => {
        await store.getState().updateMessageMetadata('msg-1', { collapsed: true });
      });

      expect(updateMessageMetadataSpy).toHaveBeenCalledWith(
        'msg-1',
        { collapsed: true },
        expect.any(Object),
      );
    });
  });

  describe('toggleMessageCollapsed', () => {
    it('should toggle message collapsed state', async () => {
      const updateMessageMetadataSpy = vi
        .spyOn(messageServiceModule.messageService, 'updateMessageMetadata')
        .mockResolvedValue({
          success: true,
          messages: [],
        });

      const store = createTestStore();

      act(() => {
        store.getState().internal_dispatchMessage({
          type: 'createMessage',
          id: 'msg-1',
          value: { content: 'Hello', role: 'assistant', sessionId: 'test-session' },
        });
      });

      await act(async () => {
        await store.getState().toggleMessageCollapsed('msg-1', true);
      });

      expect(updateMessageMetadataSpy).toHaveBeenCalledWith(
        'msg-1',
        { collapsed: true },
        expect.any(Object),
      );
    });
  });

  describe('internal_toggleMessageLoading', () => {
    it('should toggle message loading state', () => {
      const store = createTestStore();

      act(() => {
        store.getState().internal_toggleMessageLoading(true, 'msg-1');
      });

      expect(store.getState().messageLoadingIds).toContain('msg-1');

      act(() => {
        store.getState().internal_toggleMessageLoading(false, 'msg-1');
      });

      expect(store.getState().messageLoadingIds).not.toContain('msg-1');
    });
  });

  describe('copyMessage', () => {
    it('should copy message content and call hook', async () => {
      const onMessageCopied = vi.fn();

      const store = createStore({
        context: { agentId: 'test-session', topicId: null, threadId: null },
        hooks: { onMessageCopied },
      });

      await act(async () => {
        await store.getState().copyMessage('msg-1', 'Content to copy');
      });

      expect(onMessageCopied).toHaveBeenCalledWith('msg-1');
    });
  });

  describe('modifyMessageContent', () => {
    it('should modify message content and call hook', async () => {
      vi.spyOn(messageServiceModule.messageService, 'updateMessage').mockResolvedValue({
        success: true,
        messages: [],
      });

      const onMessageModified = vi.fn();

      const store = createStore({
        context: { agentId: 'test-session', topicId: null, threadId: null },
        hooks: { onMessageModified },
      });

      act(() => {
        store.getState().replaceMessages([
          {
            id: 'msg-1',
            content: 'Original',
            role: 'user',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            meta: {},
          },
        ]);
      });

      await act(async () => {
        await store.getState().modifyMessageContent('msg-1', 'Modified');
      });

      expect(onMessageModified).toHaveBeenCalledWith('msg-1', 'Modified', 'Original');
    });
  });

  describe('addToolToMessage', () => {
    it('should add tool to message', async () => {
      const updateMessageSpy = vi
        .spyOn(messageServiceModule.messageService, 'updateMessage')
        .mockResolvedValue({
          success: true,
          messages: [],
        });

      const store = createTestStore();

      act(() => {
        store.getState().internal_dispatchMessage({
          type: 'createMessage',
          id: 'msg-1',
          value: { content: '', role: 'assistant', sessionId: 'test-session' },
        });
      });

      const tool = {
        id: 'tool-1',
        type: 'default' as const,
        identifier: 'test',
        apiName: 'testFunc',
        arguments: '{}',
      };

      await act(async () => {
        await store.getState().addToolToMessage('msg-1', tool);
      });

      expect(updateMessageSpy).toHaveBeenCalledWith(
        'msg-1',
        expect.objectContaining({ tools: [tool] }),
        expect.any(Object),
      );
    });
  });
});
