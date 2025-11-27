import { LobeChatDatabase } from '@lobechat/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MessageModel } from '@/database/models/message';
import { FileService } from '@/server/services/file';

import { MessageService } from '../index';

vi.mock('@/database/models/message');
vi.mock('@/server/services/file');

describe('MessageService', () => {
  let messageService: MessageService;
  let mockDB: LobeChatDatabase;
  let mockMessageModel: MessageModel;
  let mockFileService: FileService;
  const userId = 'test-user-id';

  beforeEach(() => {
    mockDB = {} as LobeChatDatabase;
    mockMessageModel = {
      create: vi.fn(),
      deleteMessage: vi.fn(),
      deleteMessages: vi.fn(),
      query: vi.fn(),
      update: vi.fn(),
      updateMessagePlugin: vi.fn(),
      updateMessageRAG: vi.fn(),
      updateMetadata: vi.fn(),
      updatePluginState: vi.fn(),
    } as any;

    mockFileService = {
      getFullFileUrl: vi.fn().mockImplementation((path) => Promise.resolve(`/files${path}`)),
    } as any;

    // Mock constructors
    vi.mocked(MessageModel).mockImplementation(() => mockMessageModel);
    vi.mocked(FileService).mockImplementation(() => mockFileService);

    messageService = new MessageService(mockDB, userId);
  });

  describe('removeMessage', () => {
    it('should delete message and return { success: true } when no sessionId/topicId provided', async () => {
      const messageId = 'msg-1';

      const result = await messageService.removeMessage(messageId);

      expect(mockMessageModel.deleteMessage).toHaveBeenCalledWith(messageId);
      expect(result).toEqual({ success: true });
      expect(mockMessageModel.query).not.toHaveBeenCalled();
    });

    it('should delete message and return message list when sessionId provided', async () => {
      const messageId = 'msg-1';
      const mockMessages = [{ id: 'msg-2', content: 'test' }];
      vi.mocked(mockMessageModel.query).mockResolvedValue(mockMessages as any);

      const result = await messageService.removeMessage(messageId, { sessionId: 'session-1' });

      expect(mockMessageModel.deleteMessage).toHaveBeenCalledWith(messageId);
      expect(mockMessageModel.query).toHaveBeenCalledWith(
        { groupId: undefined, sessionId: 'session-1', topicId: undefined },
        expect.objectContaining({
          groupAssistantMessages: false,
        }),
      );
      expect(result).toEqual({ messages: mockMessages, success: true });
    });

    it('should delete message and return message list when topicId provided', async () => {
      const messageId = 'msg-1';
      const mockMessages = [{ id: 'msg-2', content: 'test' }];
      vi.mocked(mockMessageModel.query).mockResolvedValue(mockMessages as any);

      const result = await messageService.removeMessage(messageId, { topicId: 'topic-1' });

      expect(mockMessageModel.deleteMessage).toHaveBeenCalledWith(messageId);
      expect(mockMessageModel.query).toHaveBeenCalledWith(
        { groupId: undefined, sessionId: undefined, topicId: 'topic-1' },
        expect.objectContaining({
          groupAssistantMessages: false,
        }),
      );
      expect(result).toEqual({ messages: mockMessages, success: true });
    });
  });

  describe('removeMessages', () => {
    it('should delete messages and return { success: true } when no sessionId/topicId provided', async () => {
      const messageIds = ['msg-1', 'msg-2'];

      const result = await messageService.removeMessages(messageIds);

      expect(mockMessageModel.deleteMessages).toHaveBeenCalledWith(messageIds);
      expect(result).toEqual({ success: true });
      expect(mockMessageModel.query).not.toHaveBeenCalled();
    });

    it('should delete messages and return message list when sessionId provided', async () => {
      const messageIds = ['msg-1', 'msg-2'];
      const mockMessages = [{ id: 'msg-3', content: 'test' }];
      vi.mocked(mockMessageModel.query).mockResolvedValue(mockMessages as any);

      const result = await messageService.removeMessages(messageIds, { sessionId: 'session-1' });

      expect(mockMessageModel.deleteMessages).toHaveBeenCalledWith(messageIds);
      expect(mockMessageModel.query).toHaveBeenCalled();
      expect(result).toEqual({ messages: mockMessages, success: true });
    });
  });

  describe('updateMessageRAG', () => {
    it('should update RAG and return { success: true } when no sessionId/topicId provided', async () => {
      const messageId = 'msg-1';
      const ragValue = { fileChunks: [{ id: 'chunk-1', similarity: 0.95 }] };

      const result = await messageService.updateMessageRAG(messageId, ragValue);

      expect(mockMessageModel.updateMessageRAG).toHaveBeenCalledWith(messageId, ragValue);
      expect(result).toEqual({ success: true });
      expect(mockMessageModel.query).not.toHaveBeenCalled();
    });

    it('should update RAG and return message list when sessionId provided', async () => {
      const messageId = 'msg-1';
      const ragValue = { fileChunks: [{ id: 'chunk-1', similarity: 0.95 }] };
      const mockMessages = [{ id: 'msg-1', content: 'test' }];
      vi.mocked(mockMessageModel.query).mockResolvedValue(mockMessages as any);

      const result = await messageService.updateMessageRAG(messageId, ragValue, {
        sessionId: 'session-1',
      });

      expect(mockMessageModel.updateMessageRAG).toHaveBeenCalledWith(messageId, ragValue);
      expect(mockMessageModel.query).toHaveBeenCalled();
      expect(result).toEqual({ messages: mockMessages, success: true });
    });
  });

  describe('updatePluginError', () => {
    it('should update plugin error and return { success: true } when no sessionId/topicId provided', async () => {
      const messageId = 'msg-1';
      const error = { type: 'TestError', message: 'Test error message' };

      const result = await messageService.updatePluginError(messageId, error);

      expect(mockMessageModel.updateMessagePlugin).toHaveBeenCalledWith(messageId, { error });
      expect(result).toEqual({ success: true });
      expect(mockMessageModel.query).not.toHaveBeenCalled();
    });

    it('should update plugin error and return message list when sessionId provided', async () => {
      const messageId = 'msg-1';
      const error = { type: 'TestError', message: 'Test error message' };
      const mockMessages = [{ id: 'msg-1', content: 'test' }];
      vi.mocked(mockMessageModel.query).mockResolvedValue(mockMessages as any);

      const result = await messageService.updatePluginError(messageId, error, {
        sessionId: 'session-1',
      });

      expect(mockMessageModel.updateMessagePlugin).toHaveBeenCalledWith(messageId, { error });
      expect(mockMessageModel.query).toHaveBeenCalled();
      expect(result).toEqual({ messages: mockMessages, success: true });
    });
  });

  describe('updatePluginState', () => {
    it('should update plugin state and return { success: true } when no sessionId/topicId provided', async () => {
      const messageId = 'msg-1';
      const state = { key: 'value' };

      const result = await messageService.updatePluginState(messageId, state, {});

      expect(mockMessageModel.updatePluginState).toHaveBeenCalledWith(messageId, state);
      expect(result).toEqual({ success: true });
      expect(mockMessageModel.query).not.toHaveBeenCalled();
    });

    it('should update plugin state and return message list when sessionId provided', async () => {
      const messageId = 'msg-1';
      const state = { key: 'value' };
      const mockMessages = [{ id: 'msg-1', content: 'test' }];
      vi.mocked(mockMessageModel.query).mockResolvedValue(mockMessages as any);

      const result = await messageService.updatePluginState(messageId, state, {
        sessionId: 'session-1',
      });

      expect(mockMessageModel.updatePluginState).toHaveBeenCalledWith(messageId, state);
      expect(mockMessageModel.query).toHaveBeenCalled();
      expect(result).toEqual({ messages: mockMessages, success: true });
    });
  });

  describe('updateMessage', () => {
    it('should update message and return { success: true } when no sessionId/topicId provided', async () => {
      const messageId = 'msg-1';
      const value = { content: 'updated content' };

      const result = await messageService.updateMessage(messageId, value as any, {});

      expect(mockMessageModel.update).toHaveBeenCalledWith(messageId, value);
      expect(result).toEqual({ success: true });
      expect(mockMessageModel.query).not.toHaveBeenCalled();
    });

    it('should update message and return message list when sessionId provided', async () => {
      const messageId = 'msg-1';
      const value = { content: 'updated content' };
      const mockMessages = [{ id: 'msg-1', content: 'updated content' }];
      vi.mocked(mockMessageModel.query).mockResolvedValue(mockMessages as any);

      const result = await messageService.updateMessage(messageId, value as any, {
        sessionId: 'session-1',
      });

      expect(mockMessageModel.update).toHaveBeenCalledWith(messageId, value);
      expect(mockMessageModel.query).toHaveBeenCalled();
      expect(result).toEqual({ messages: mockMessages, success: true });
    });
  });

  describe('updateMetadata', () => {
    it('should update metadata and return { success: true } when no sessionId/topicId provided', async () => {
      const messageId = 'msg-1';
      const metadata = { someKey: 'someValue', count: 42 };

      const result = await messageService.updateMetadata(messageId, metadata);

      expect(mockMessageModel.updateMetadata).toHaveBeenCalledWith(messageId, metadata);
      expect(result).toEqual({ success: true });
      expect(mockMessageModel.query).not.toHaveBeenCalled();
    });

    it('should update metadata and return message list when sessionId provided', async () => {
      const messageId = 'msg-1';
      const metadata = { someKey: 'someValue', count: 42 };
      const mockMessages = [{ id: 'msg-1', content: 'test' }];
      vi.mocked(mockMessageModel.query).mockResolvedValue(mockMessages as any);

      const result = await messageService.updateMetadata(messageId, metadata, {
        sessionId: 'session-1',
      });

      expect(mockMessageModel.updateMetadata).toHaveBeenCalledWith(messageId, metadata);
      expect(mockMessageModel.query).toHaveBeenCalled();
      expect(result).toEqual({ messages: mockMessages, success: true });
    });

    it('should update metadata and return message list when topicId provided', async () => {
      const messageId = 'msg-1';
      const metadata = { key: 'value' };
      const mockMessages = [{ id: 'msg-1', content: 'test' }];
      vi.mocked(mockMessageModel.query).mockResolvedValue(mockMessages as any);

      const result = await messageService.updateMetadata(messageId, metadata, {
        topicId: 'topic-1',
      });

      expect(mockMessageModel.updateMetadata).toHaveBeenCalledWith(messageId, metadata);
      expect(mockMessageModel.query).toHaveBeenCalledWith(
        { groupId: undefined, sessionId: undefined, topicId: 'topic-1' },
        expect.objectContaining({
          groupAssistantMessages: false,
        }),
      );
      expect(result).toEqual({ messages: mockMessages, success: true });
    });
  });

  describe('createMessage', () => {
    it('should create message and return message list', async () => {
      const params = {
        content: 'Hello',
        role: 'user' as const,
        sessionId: 'session-1',
      };
      const createdMessage = { id: 'msg-1', ...params };
      const mockMessages = [createdMessage, { id: 'msg-2', content: 'Hi' }];

      vi.mocked(mockMessageModel.create).mockResolvedValue(createdMessage as any);
      vi.mocked(mockMessageModel.query).mockResolvedValue(mockMessages as any);

      const result = await messageService.createMessage(params as any);

      expect(mockMessageModel.create).toHaveBeenCalledWith(params);
      expect(mockMessageModel.query).toHaveBeenCalledWith(
        {
          current: 0,
          groupId: undefined,
          pageSize: 9999,
          sessionId: 'session-1',
          topicId: undefined,
        },
        expect.objectContaining({
          groupAssistantMessages: false,
        }),
      );
      expect(result).toEqual({
        id: 'msg-1',
        messages: mockMessages,
      });
    });

    it('should create message with topicId and groupId', async () => {
      const params = {
        content: 'Hello',
        groupId: 'group-1',
        role: 'user' as const,
        sessionId: 'session-1',
        topicId: 'topic-1',
      };
      const createdMessage = { id: 'msg-1', ...params };
      const mockMessages = [createdMessage];

      vi.mocked(mockMessageModel.create).mockResolvedValue(createdMessage as any);
      vi.mocked(mockMessageModel.query).mockResolvedValue(mockMessages as any);

      const result = await messageService.createMessage(params as any);

      expect(mockMessageModel.query).toHaveBeenCalledWith(
        {
          current: 0,
          groupId: 'group-1',
          pageSize: 9999,
          sessionId: 'session-1',
          topicId: 'topic-1',
        },
        expect.anything(),
      );
      expect(result.id).toBe('msg-1');
      expect(result.messages).toEqual(mockMessages);
    });
  });
});
