import { Mock, describe, expect, it, vi } from 'vitest';

import { CreateMessageParams, MessageModel } from '@/database/models/message';
import {
  ChatMessage,
  ChatMessageError,
  ChatPluginPayload,
  ChatTTS,
  ChatTranslate,
} from '@/types/chatMessage';

import { messageService } from '../message';

// Mock the MessageModel
vi.mock('@/database/models/message', () => {
  return {
    MessageModel: {
      create: vi.fn(),
      batchCreate: vi.fn(),
      isEmpty: vi.fn(),
      query: vi.fn(),
      delete: vi.fn(),
      queryBySessionId: vi.fn(),
      update: vi.fn(),
      batchDelete: vi.fn(),
      clearTable: vi.fn(),
      batchUpdate: vi.fn(),
      queryAll: vi.fn(),
    },
  };
});

describe('MessageService', () => {
  // Mock data
  const mockMessageId = 'mock-message-id';
  const mockMessage = {
    id: mockMessageId,
    content: 'Mock message content',
    sessionId: 'mock-session-id',
    createdAt: 100,
    updatedAt: 100,
    role: 'user',
    // ... other properties
  } as ChatMessage;
  const mockMessages = [mockMessage];

  beforeEach(() => {
    // Reset all mocks before running each test case
    vi.resetAllMocks();
  });

  describe('create', () => {
    it('should create a message and return its id', async () => {
      // Setup
      const createParams = {
        content: 'New message content',
        sessionId: '1',
        // ... other properties
      } as CreateMessageParams;
      (MessageModel.create as Mock).mockResolvedValue({ id: mockMessageId });

      // Execute
      const messageId = await messageService.create(createParams);

      // Assert
      expect(MessageModel.create).toHaveBeenCalledWith(createParams);
      expect(messageId).toBe(mockMessageId);
    });
  });

  describe('batchCreate', () => {
    it('should batch create messages', async () => {
      // Setup
      (MessageModel.batchCreate as Mock).mockResolvedValue(mockMessages);

      // Execute
      const result = await messageService.batchCreate(mockMessages);

      // Assert
      expect(MessageModel.batchCreate).toHaveBeenCalledWith(mockMessages);
      expect(result).toBe(mockMessages);
    });
  });

  describe('hasMessages', () => {
    it('should return true if there are messages', async () => {
      // Setup
      (MessageModel.isEmpty as Mock).mockResolvedValue(false);

      // Execute
      const hasMessages = await messageService.hasMessages();

      // Assert
      expect(MessageModel.isEmpty).toHaveBeenCalled();
      expect(hasMessages).toBe(true);
    });

    it('should return false if there are no messages', async () => {
      // Setup
      (MessageModel.isEmpty as Mock).mockResolvedValue(true);

      // Execute
      const hasMessages = await messageService.hasMessages();

      // Assert
      expect(MessageModel.isEmpty).toHaveBeenCalled();
      expect(hasMessages).toBe(false);
    });
  });

  describe('removeMessage', () => {
    it('should remove a message by id', async () => {
      // Setup
      (MessageModel.delete as Mock).mockResolvedValue(true);

      // Execute
      const result = await messageService.removeMessage(mockMessageId);

      // Assert
      expect(MessageModel.delete).toHaveBeenCalledWith(mockMessageId);
      expect(result).toBe(true);
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages by sessionId and topicId', async () => {
      // Setup
      const sessionId = 'session-id';
      const topicId = 'topic-id';
      (MessageModel.query as Mock).mockResolvedValue(mockMessages);

      // Execute
      const messages = await messageService.getMessages(sessionId, topicId);

      // Assert
      expect(MessageModel.query).toHaveBeenCalledWith({ sessionId, topicId });
      expect(messages).toBe(mockMessages);
    });
  });

  describe('getAllMessagesInSession', () => {
    it('should retrieve all messages in a session', async () => {
      // Setup
      const sessionId = 'session-id';
      (MessageModel.queryBySessionId as Mock).mockResolvedValue(mockMessages);

      // Execute
      const messages = await messageService.getAllMessagesInSession(sessionId);

      // Assert
      expect(MessageModel.queryBySessionId).toHaveBeenCalledWith(sessionId);
      expect(messages).toBe(mockMessages);
    });
  });

  describe('updateMessageContent', () => {
    it('should update the content of a message', async () => {
      // Setup
      const newContent = 'Updated message content';
      (MessageModel.update as Mock).mockResolvedValue({ ...mockMessage, content: newContent });

      // Execute
      const result = await messageService.updateMessageContent(mockMessageId, newContent);

      // Assert
      expect(MessageModel.update).toHaveBeenCalledWith(mockMessageId, { content: newContent });
      expect(result).toEqual({ ...mockMessage, content: newContent });
    });
  });

  describe('removeMessages', () => {
    it('should batch remove messages by assistantId and topicId', async () => {
      // Setup
      const assistantId = 'assistant-id';
      const topicId = 'topic-id';
      (MessageModel.batchDelete as Mock).mockResolvedValue(true);

      // Execute
      const result = await messageService.removeMessages(assistantId, topicId);

      // Assert
      expect(MessageModel.batchDelete).toHaveBeenCalledWith(assistantId, topicId);
      expect(result).toBe(true);
    });
  });

  describe('clearAllMessage', () => {
    it('should clear all messages from the table', async () => {
      // Setup
      (MessageModel.clearTable as Mock).mockResolvedValue(true);

      // Execute
      const result = await messageService.clearAllMessage();

      // Assert
      expect(MessageModel.clearTable).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('bindMessagesToTopic', () => {
    it('should batch update messages to bind them to a topic', async () => {
      // Setup
      const topicId = 'topic-id';
      const messageIds = [mockMessageId];
      (MessageModel.batchUpdate as Mock).mockResolvedValue(mockMessages);

      // Execute
      const result = await messageService.bindMessagesToTopic(topicId, messageIds);

      // Assert
      expect(MessageModel.batchUpdate).toHaveBeenCalledWith(messageIds, { topicId });
      expect(result).toBe(mockMessages);
    });
  });

  describe('getAllMessages', () => {
    it('should retrieve all messages', async () => {
      // Setup
      (MessageModel.queryAll as Mock).mockResolvedValue(mockMessages);

      // Execute
      const messages = await messageService.getAllMessages();

      // Assert
      expect(MessageModel.queryAll).toHaveBeenCalled();
      expect(messages).toBe(mockMessages);
    });
  });

  describe('updateMessageError', () => {
    it('should update the error field of a message', async () => {
      // Setup
      const newError = { type: 'NoAPIKey', message: 'Error occurred' } as ChatMessageError;
      (MessageModel.update as Mock).mockResolvedValue({ ...mockMessage, error: newError });

      // Execute
      const result = await messageService.updateMessageError(mockMessageId, newError);

      // Assert
      expect(MessageModel.update).toHaveBeenCalledWith(mockMessageId, { error: newError });
      expect(result).toEqual({ ...mockMessage, error: newError });
    });
  });

  describe('updateMessageTranslate', () => {
    it('should update the translate field of a message', async () => {
      // Setup
      const newTranslate = { content: 'Translated text', to: 'es' } as ChatTranslate;
      (MessageModel.update as Mock).mockResolvedValue({ ...mockMessage, translate: newTranslate });

      // Execute
      const result = await messageService.updateMessageTranslate(mockMessageId, newTranslate);

      // Assert
      expect(MessageModel.update).toHaveBeenCalledWith(mockMessageId, { translate: newTranslate });
      expect(result).toEqual({ ...mockMessage, translate: newTranslate });
    });
  });

  describe('updateMessageTTS', () => {
    it('should update the tts field of a message', async () => {
      // Setup
      const newTTS = { init: false } as ChatTTS;
      (MessageModel.update as Mock).mockResolvedValue({ ...mockMessage, tts: newTTS });

      // Execute
      const result = await messageService.updateMessageTTS(mockMessageId, newTTS);

      // Assert
      expect(MessageModel.update).toHaveBeenCalledWith(mockMessageId, { tts: newTTS });
      expect(result).toEqual({ ...mockMessage, tts: newTTS });
    });
  });

  describe('updateMessageRole', () => {
    it('should update the role of a message', async () => {
      // Setup
      const newRole = 'user';
      (MessageModel.update as Mock).mockResolvedValue({ ...mockMessage, role: newRole });

      // Execute
      const result = await messageService.updateMessageRole(mockMessageId, newRole);

      // Assert
      expect(MessageModel.update).toHaveBeenCalledWith(mockMessageId, { role: newRole });
      expect(result).toEqual({ ...mockMessage, role: newRole });
    });
  });

  describe('updateMessagePlugin', () => {
    it('should update the plugin payload of a message', async () => {
      // Setup
      const newPlugin = {
        type: 'default',
        apiName: 'abc',
        arguments: '',
        identifier: 'plugin1',
      } as ChatPluginPayload;

      (MessageModel.update as Mock).mockResolvedValue({ ...mockMessage, plugin: newPlugin });

      // Execute
      const result = await messageService.updateMessagePlugin(mockMessageId, newPlugin);

      // Assert
      expect(MessageModel.update).toHaveBeenCalledWith(mockMessageId, { plugin: newPlugin });
      expect(result).toEqual({ ...mockMessage, plugin: newPlugin });
    });
  });

  describe('updateMessagePluginState', () => {
    it('should update the plugin state of a message', async () => {
      // Setup
      const key = 'stateKey';
      const value = 'stateValue';
      const newPluginState = { [key]: value };
      (MessageModel.update as Mock).mockResolvedValue({
        ...mockMessage,
        pluginState: newPluginState,
      });

      // Execute
      const result = await messageService.updateMessagePluginState(mockMessageId, key, value);

      // Assert
      expect(MessageModel.update).toHaveBeenCalledWith(mockMessageId, {
        pluginState: newPluginState,
      });
      expect(result).toEqual({ ...mockMessage, pluginState: newPluginState });
    });
  });
});
