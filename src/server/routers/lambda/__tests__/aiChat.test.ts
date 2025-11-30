// @vitest-environment node
import { ThreadType } from '@lobechat/types';
import { describe, expect, it, vi } from 'vitest';

import { MessageModel } from '@/database/models/message';
import { ThreadModel } from '@/database/models/thread';
import { TopicModel } from '@/database/models/topic';
import { AiChatService } from '@/server/services/aiChat';

import { aiChatRouter } from '../aiChat';

vi.mock('@/database/models/message');
vi.mock('@/database/models/thread');
vi.mock('@/database/models/topic');
vi.mock('@/server/services/aiChat');
vi.mock('@/server/services/file', () => ({
  FileService: vi.fn(),
}));
vi.mock('@/utils/server', () => ({
  getXorPayload: vi.fn(),
}));
vi.mock('@/server/modules/ModelRuntime', () => ({
  initModelRuntimeWithUserPayload: vi.fn(),
}));

describe('aiChatRouter', () => {
  const mockCtx = { userId: 'u1' };

  it('should create topic optionally, create user/assistant messages, and return payload', async () => {
    const mockCreateTopic = vi.fn().mockResolvedValue({ id: 't1' });
    const mockCreateMessage = vi
      .fn()
      .mockResolvedValueOnce({ id: 'm-user' })
      .mockResolvedValueOnce({ id: 'm-assistant' });
    const mockGet = vi
      .fn()
      .mockResolvedValue({ messages: [{ id: 'm-user' }, { id: 'm-assistant' }], topics: [{}] });

    vi.mocked(TopicModel).mockImplementation(() => ({ create: mockCreateTopic }) as any);
    vi.mocked(MessageModel).mockImplementation(() => ({ create: mockCreateMessage }) as any);
    vi.mocked(AiChatService).mockImplementation(() => ({ getMessagesAndTopics: mockGet }) as any);

    const caller = aiChatRouter.createCaller(mockCtx as any);

    const input = {
      newAssistantMessage: { model: 'gpt-4o', provider: 'openai' },
      newTopic: { title: 'T', topicMessageIds: ['a', 'b'] },
      newUserMessage: { content: 'hi', files: ['f1'] },
      sessionId: 's1',
    } as any;

    const res = await caller.sendMessageInServer(input);

    expect(mockCreateTopic).toHaveBeenCalledWith({
      messages: ['a', 'b'],
      sessionId: 's1',
      title: 'T',
    });

    expect(mockCreateMessage).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        content: 'hi',
        files: ['f1'],
        role: 'user',
        sessionId: 's1',
        topicId: 't1',
      }),
    );

    expect(mockCreateMessage).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        content: expect.any(String),
        model: 'gpt-4o',
        parentId: 'm-user',
        role: 'assistant',
        sessionId: 's1',
        topicId: 't1',
      }),
    );

    expect(mockGet).toHaveBeenCalledWith(
      expect.objectContaining({ includeTopic: true, sessionId: 's1', topicId: 't1' }),
    );
    expect(res.assistantMessageId).toBe('m-assistant');
    expect(res.userMessageId).toBe('m-user');
    expect(res.isCreateNewTopic).toBe(true);
    expect(res.topicId).toBe('t1');
    expect(res.messages?.length).toBe(2);
    expect(res.topics?.length).toBe(1);
  });

  it('should reuse existing topic when topicId provided', async () => {
    const mockCreateMessage = vi
      .fn()
      .mockResolvedValueOnce({ id: 'm-user' })
      .mockResolvedValueOnce({ id: 'm-assistant' });
    const mockGet = vi.fn().mockResolvedValue({ messages: [], topics: undefined });

    vi.mocked(MessageModel).mockImplementation(() => ({ create: mockCreateMessage }) as any);
    vi.mocked(AiChatService).mockImplementation(() => ({ getMessagesAndTopics: mockGet }) as any);

    const caller = aiChatRouter.createCaller(mockCtx as any);

    const res = await caller.sendMessageInServer({
      newAssistantMessage: { model: 'gpt-4o', provider: 'openai' },
      newUserMessage: { content: 'hi' },
      sessionId: 's1',
      topicId: 't-exist',
    } as any);

    expect(mockCreateMessage).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledWith(
      expect.objectContaining({
        includeTopic: false,
        sessionId: 's1',
        topicId: 't-exist',
      }),
    );
    expect(res.isCreateNewTopic).toBe(false);
    expect(res.topicId).toBe('t-exist');
  });

  it('should pass threadId to both user and assistant messages when provided', async () => {
    const mockCreateMessage = vi
      .fn()
      .mockResolvedValueOnce({ id: 'm-user' })
      .mockResolvedValueOnce({ id: 'm-assistant' });
    const mockGet = vi.fn().mockResolvedValue({ messages: [], topics: undefined });

    vi.mocked(MessageModel).mockImplementation(() => ({ create: mockCreateMessage }) as any);
    vi.mocked(AiChatService).mockImplementation(() => ({ getMessagesAndTopics: mockGet }) as any);

    const caller = aiChatRouter.createCaller(mockCtx as any);

    await caller.sendMessageInServer({
      newAssistantMessage: { model: 'gpt-4o', provider: 'openai' },
      newUserMessage: { content: 'hi' },
      sessionId: 's1',
      threadId: 'thread-123',
      topicId: 't1',
    } as any);

    expect(mockCreateMessage).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        content: 'hi',
        role: 'user',
        sessionId: 's1',
        threadId: 'thread-123',
        topicId: 't1',
      }),
    );

    expect(mockCreateMessage).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        parentId: 'm-user',
        role: 'assistant',
        sessionId: 's1',
        threadId: 'thread-123',
        topicId: 't1',
      }),
    );
  });

  it('should create thread and use its id for messages when newThread is provided', async () => {
    const mockCreateThread = vi.fn().mockResolvedValue({ id: 'thread-new' });
    const mockCreateMessage = vi
      .fn()
      .mockResolvedValueOnce({ id: 'm-user' })
      .mockResolvedValueOnce({ id: 'm-assistant' });
    const mockGet = vi.fn().mockResolvedValue({ messages: [], topics: undefined });

    vi.mocked(ThreadModel).mockImplementation(() => ({ create: mockCreateThread }) as any);
    vi.mocked(MessageModel).mockImplementation(() => ({ create: mockCreateMessage }) as any);
    vi.mocked(AiChatService).mockImplementation(() => ({ getMessagesAndTopics: mockGet }) as any);

    const caller = aiChatRouter.createCaller(mockCtx as any);

    const res = await caller.sendMessageInServer({
      newAssistantMessage: { model: 'gpt-4o', provider: 'openai' },
      newThread: {
        sourceMessageId: 'source-msg-123',
        title: 'Thread Title',
        type: ThreadType.Standalone,
      },
      newUserMessage: { content: 'hi' },
      sessionId: 's1',
      topicId: 't1',
    } as any);

    // Verify thread was created with correct params
    expect(mockCreateThread).toHaveBeenCalledWith({
      parentThreadId: undefined,
      sourceMessageId: 'source-msg-123',
      title: 'Thread Title',
      topicId: 't1',
      type: ThreadType.Standalone,
    });

    // Verify messages use the newly created threadId
    expect(mockCreateMessage).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        content: 'hi',
        role: 'user',
        sessionId: 's1',
        threadId: 'thread-new',
        topicId: 't1',
      }),
    );

    expect(mockCreateMessage).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        parentId: 'm-user',
        role: 'assistant',
        sessionId: 's1',
        threadId: 'thread-new',
        topicId: 't1',
      }),
    );

    // Verify response includes createdThreadId
    expect(res.createdThreadId).toBe('thread-new');
  });

  it('should create both topic and thread in same request', async () => {
    const mockCreateTopic = vi.fn().mockResolvedValue({ id: 't-new' });
    const mockCreateThread = vi.fn().mockResolvedValue({ id: 'thread-new' });
    const mockCreateMessage = vi
      .fn()
      .mockResolvedValueOnce({ id: 'm-user' })
      .mockResolvedValueOnce({ id: 'm-assistant' });
    const mockGet = vi.fn().mockResolvedValue({ messages: [], topics: [{ id: 't-new' }] });

    vi.mocked(TopicModel).mockImplementation(() => ({ create: mockCreateTopic }) as any);
    vi.mocked(ThreadModel).mockImplementation(() => ({ create: mockCreateThread }) as any);
    vi.mocked(MessageModel).mockImplementation(() => ({ create: mockCreateMessage }) as any);
    vi.mocked(AiChatService).mockImplementation(() => ({ getMessagesAndTopics: mockGet }) as any);

    const caller = aiChatRouter.createCaller(mockCtx as any);

    const res = await caller.sendMessageInServer({
      newAssistantMessage: { model: 'gpt-4o', provider: 'openai' },
      newThread: {
        sourceMessageId: 'source-msg-123',
        type: ThreadType.Continuation,
      },
      newTopic: { title: 'New Topic' },
      newUserMessage: { content: 'hi' },
      sessionId: 's1',
    } as any);

    // Topic created first
    expect(mockCreateTopic).toHaveBeenCalledWith({
      messages: undefined,
      sessionId: 's1',
      title: 'New Topic',
    });

    // Thread created with newly created topicId
    expect(mockCreateThread).toHaveBeenCalledWith({
      parentThreadId: undefined,
      sourceMessageId: 'source-msg-123',
      title: undefined,
      topicId: 't-new',
      type: ThreadType.Continuation,
    });

    // Messages use both new topicId and threadId
    expect(mockCreateMessage).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        content: 'hi',
        role: 'user',
        sessionId: 's1',
        threadId: 'thread-new',
        topicId: 't-new',
      }),
    );

    expect(res.isCreateNewTopic).toBe(true);
    expect(res.topicId).toBe('t-new');
    expect(res.createdThreadId).toBe('thread-new');
  });

  it('should not set createdThreadId when newThread is not provided', async () => {
    const mockCreateMessage = vi
      .fn()
      .mockResolvedValueOnce({ id: 'm-user' })
      .mockResolvedValueOnce({ id: 'm-assistant' });
    const mockGet = vi.fn().mockResolvedValue({ messages: [], topics: undefined });

    vi.mocked(MessageModel).mockImplementation(() => ({ create: mockCreateMessage }) as any);
    vi.mocked(AiChatService).mockImplementation(() => ({ getMessagesAndTopics: mockGet }) as any);

    const caller = aiChatRouter.createCaller(mockCtx as any);

    const res = await caller.sendMessageInServer({
      newAssistantMessage: { model: 'gpt-4o', provider: 'openai' },
      newUserMessage: { content: 'hi' },
      sessionId: 's1',
      topicId: 't1',
    } as any);

    expect(res.createdThreadId).toBeUndefined();
  });

  describe('agentId support', () => {
    it('should pass agentId to messages when provided', async () => {
      const mockCreateMessage = vi
        .fn()
        .mockResolvedValueOnce({ id: 'm-user' })
        .mockResolvedValueOnce({ id: 'm-assistant' });
      const mockGet = vi.fn().mockResolvedValue({ messages: [], topics: undefined });

      vi.mocked(MessageModel).mockImplementation(() => ({ create: mockCreateMessage }) as any);
      vi.mocked(AiChatService).mockImplementation(() => ({ getMessagesAndTopics: mockGet }) as any);

      const caller = aiChatRouter.createCaller(mockCtx as any);

      await caller.sendMessageInServer({
        agentId: 'agent-1',
        newAssistantMessage: { model: 'gpt-4o', provider: 'openai' },
        newUserMessage: { content: 'hi' },
        sessionId: 's1',
        topicId: 't1',
      } as any);

      // Verify agentId is passed to user message
      expect(mockCreateMessage).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          agentId: 'agent-1',
          content: 'hi',
          role: 'user',
          sessionId: 's1',
          topicId: 't1',
        }),
      );

      // Verify agentId is passed to assistant message
      expect(mockCreateMessage).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          agentId: 'agent-1',
          role: 'assistant',
          sessionId: 's1',
          topicId: 't1',
        }),
      );

      // Verify agentId is passed to getMessagesAndTopics
      expect(mockGet).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'agent-1',
          sessionId: 's1',
          topicId: 't1',
        }),
      );
    });

    it('should pass agentId to topic creation when provided', async () => {
      const mockCreateTopic = vi.fn().mockResolvedValue({ id: 't1' });
      const mockCreateMessage = vi
        .fn()
        .mockResolvedValueOnce({ id: 'm-user' })
        .mockResolvedValueOnce({ id: 'm-assistant' });
      const mockGet = vi.fn().mockResolvedValue({ messages: [], topics: [{}] });

      vi.mocked(TopicModel).mockImplementation(() => ({ create: mockCreateTopic }) as any);
      vi.mocked(MessageModel).mockImplementation(() => ({ create: mockCreateMessage }) as any);
      vi.mocked(AiChatService).mockImplementation(() => ({ getMessagesAndTopics: mockGet }) as any);

      const caller = aiChatRouter.createCaller(mockCtx as any);

      await caller.sendMessageInServer({
        agentId: 'agent-1',
        newAssistantMessage: { model: 'gpt-4o', provider: 'openai' },
        newTopic: { title: 'New Topic' },
        newUserMessage: { content: 'hi' },
        sessionId: 's1',
      } as any);

      // Verify agentId is passed to topic creation
      expect(mockCreateTopic).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'agent-1',
          sessionId: 's1',
          title: 'New Topic',
        }),
      );
    });
  });

  describe('outputJSON', () => {
    it('should successfully generate structured output', async () => {
      const { getXorPayload } = await import('@/utils/server');
      const { initModelRuntimeWithUserPayload } = await import('@/server/modules/ModelRuntime');

      const mockPayload = { apiKey: 'test-key' };
      const mockResult = { object: { name: 'John', age: 30 } };
      const mockGenerateObject = vi.fn().mockResolvedValue(mockResult);

      vi.mocked(getXorPayload).mockReturnValue(mockPayload);
      vi.mocked(initModelRuntimeWithUserPayload).mockReturnValue({
        generateObject: mockGenerateObject,
      } as any);

      const caller = aiChatRouter.createCaller(mockCtx as any);

      const input = {
        keyVaultsPayload: 'encrypted-payload',
        messages: [{ content: 'test', role: 'user' }],
        model: 'gpt-4o',
        provider: 'openai',
        schema: {
          name: 'Person',
          schema: {
            type: 'object' as const,
            properties: { name: { type: 'string' }, age: { type: 'number' } },
          },
        },
      };

      const result = await caller.outputJSON(input);

      expect(getXorPayload).toHaveBeenCalledWith('encrypted-payload');
      expect(initModelRuntimeWithUserPayload).toHaveBeenCalledWith('openai', mockPayload);
      expect(mockGenerateObject).toHaveBeenCalledWith({
        messages: input.messages,
        model: 'gpt-4o',
        schema: input.schema,
        tools: undefined,
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw error when keyVaultsPayload is invalid', async () => {
      const { getXorPayload } = await import('@/utils/server');

      vi.mocked(getXorPayload).mockReturnValue(undefined as any);

      const caller = aiChatRouter.createCaller(mockCtx as any);

      const input = {
        keyVaultsPayload: 'invalid-payload',
        messages: [],
        model: 'gpt-4o',
        provider: 'openai',
      };

      await expect(caller.outputJSON(input)).rejects.toThrow('keyVaultsPayload is not correct');
    });

    it('should handle tools parameter when provided', async () => {
      const { getXorPayload } = await import('@/utils/server');
      const { initModelRuntimeWithUserPayload } = await import('@/server/modules/ModelRuntime');

      const mockPayload = { apiKey: 'test-key' };
      const mockTools = [
        {
          type: 'function' as const,
          function: {
            name: 'test',
            parameters: {
              type: 'object' as const,
              properties: { input: { type: 'string' } },
            },
          },
        },
      ];
      const mockGenerateObject = vi.fn().mockResolvedValue({ object: {} });

      vi.mocked(getXorPayload).mockReturnValue(mockPayload);
      vi.mocked(initModelRuntimeWithUserPayload).mockReturnValue({
        generateObject: mockGenerateObject,
      } as any);

      const caller = aiChatRouter.createCaller(mockCtx as any);

      const input = {
        keyVaultsPayload: 'encrypted-payload',
        messages: [],
        model: 'gpt-4o',
        provider: 'openai',
        tools: mockTools,
      };

      await caller.outputJSON(input);

      expect(mockGenerateObject).toHaveBeenCalledWith({
        messages: [],
        model: 'gpt-4o',
        schema: undefined,
        tools: mockTools,
      });
    });
  });
});
