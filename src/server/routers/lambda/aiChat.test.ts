import { describe, expect, it, vi } from 'vitest';

import { MessageModel } from '@/database/models/message';
import { TopicModel } from '@/database/models/topic';
import { AiChatService } from '@/server/services/aiChat';

import { aiChatRouter } from './aiChat';

vi.mock('@/database/models/message');
vi.mock('@/database/models/topic');
vi.mock('@/server/services/aiChat');
vi.mock('@/server/services/file', () => ({
  FileService: vi.fn(),
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

    expect(mockCreateMessage).toHaveBeenNthCalledWith(1, {
      content: 'hi',
      files: ['f1'],
      role: 'user',
      sessionId: 's1',
      topicId: 't1',
    });

    expect(mockCreateMessage).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        content: expect.any(String),
        fromModel: 'gpt-4o',
        parentId: 'm-user',
        role: 'assistant',
        sessionId: 's1',
        topicId: 't1',
      }),
    );

    expect(mockGet).toHaveBeenCalledWith({ includeTopic: true, sessionId: 's1', topicId: 't1' });
    expect(res.assistantMessageId).toBe('m-assistant');
    expect(res.userMessageId).toBe('m-user');
    expect(res.isCreatNewTopic).toBe(true);
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
    expect(mockGet).toHaveBeenCalledWith({
      includeTopic: false,
      sessionId: 's1',
      topicId: 't-exist',
    });
    expect(res.isCreatNewTopic).toBe(false);
    expect(res.topicId).toBe('t-exist');
  });
});
