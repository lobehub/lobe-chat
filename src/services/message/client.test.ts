import { and, eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { clientDB, initializeDB } from '@/database/client/db';
import {
  files,
  messagePlugins,
  messageTTS,
  messageTranslates,
  messages,
  sessions,
  topics,
  users,
} from '@/database/schemas';
import {
  ChatMessageError,
  ChatTTS,
  ChatTranslate,
  CreateMessageParams,
  MessageItem,
} from '@/types/message';

import { ClientService } from './client';

const userId = 'message-db';
const sessionId = '1';
const topicId = 'topic-id';

// Mock data
const mockMessageId = 'mock-message-id';

beforeEach(async () => {
  await initializeDB();

  // 在每个测试用例之前，清空表
  await clientDB.transaction(async (trx) => {
    await trx.delete(users);
    await trx.insert(users).values([{ id: userId }, { id: '456' }]);

    await trx.insert(sessions).values([{ id: sessionId, userId }]);
    await trx.insert(topics).values([{ id: topicId, sessionId, userId }]);
    await trx.insert(files).values({
      fileType: 'image/png',
      id: 'f1',
      name: 'file-1',
      size: 1000,
      url: 'abc',
      userId: userId,
    });
  });
});

afterEach(async () => {
  // 在每个测试用例之后，清空表
  await clientDB.delete(users);
});

const messageService = new ClientService(userId);

describe('MessageClientService', () => {
  describe('create', () => {
    it('should create a message and return its id', async () => {
      // Setup
      const createParams: CreateMessageParams = {
        content: 'New message content',
        role: 'user',
        sessionId,
      };

      // Execute
      const messageId = await messageService.createMessage(createParams);

      // Assert
      expect(messageId).toMatch(/^msg_/);
    });
  });

  describe('batchCreate', () => {
    it('should batch create messages', async () => {
      // Execute
      await messageService.batchCreateMessages([
        {
          content: 'Mock message content',
          role: 'user',
          sessionId,
        },
        {
          content: 'Mock message content',
          role: 'user',
          sessionId,
        },
      ] as MessageItem[]);
      const count = await clientDB.$count(messages);

      // Assert
      expect(count).toBe(2);
    });
  });

  describe('removeMessage', () => {
    it('should remove a message by id', async () => {
      // Execute
      await clientDB.insert(messages).values({ id: mockMessageId, role: 'user', userId });
      await messageService.removeMessage(mockMessageId);

      // Assert
      const count = await clientDB.$count(messages);

      expect(count).toBe(0);
    });
  });
  describe('removeMessages', () => {
    it('should remove a message by id', async () => {
      // Setup
      await clientDB.insert(messages).values([
        { id: mockMessageId, role: 'user', userId },
        { role: 'assistant', userId },
      ]);

      // Execute
      await messageService.removeMessages([mockMessageId]);

      // Assert
      const count = await clientDB.$count(messages);

      expect(count).toBe(1);
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages by sessionId and topicId', async () => {
      // Setup
      await clientDB
        .insert(messages)
        .values({ id: mockMessageId, role: 'user', sessionId, topicId, userId });

      // Execute
      const data = await messageService.getMessages(sessionId, topicId);

      // Assert
      expect(data[0]).toMatchObject({ id: mockMessageId, role: 'user' });
    });
  });

  describe('getAllMessagesInSession', () => {
    it('should retrieve all messages in a session', async () => {
      // Setup
      const sessionId = 'session-id';
      await clientDB.insert(sessions).values([
        { id: 'bbb', userId },
        { id: sessionId, userId },
      ]);
      await clientDB.insert(messages).values([
        { role: 'user', sessionId, topicId, userId },
        { role: 'assistant', sessionId, topicId, userId },
        { role: 'assistant', sessionId: 'bbb', topicId, userId },
      ]);

      // Execute
      const data = await messageService.getAllMessagesInSession(sessionId);

      // Assert
      expect(data.length).toBe(2);
    });
  });

  describe('removeMessagesByAssistant', () => {
    it('should batch remove messages by assistantId and topicId', async () => {
      // Setup
      const sessionId = 'session-id';
      await clientDB.insert(sessions).values([
        { id: 'bbb', userId },
        { id: sessionId, userId },
      ]);
      await clientDB.insert(messages).values([
        { role: 'user', sessionId, topicId, userId },
        { role: 'assistant', sessionId, topicId, userId },
        { role: 'assistant', sessionId: 'bbb', topicId, userId },
      ]);

      // Execute
      await messageService.removeMessagesByAssistant(sessionId, topicId);

      // Assert
      const result = await clientDB.query.messages.findMany({
        where: and(eq(messages.sessionId, sessionId), eq(messages.topicId, topicId)),
      });

      expect(result.length).toBe(0);
    });
  });

  describe('clearAllMessage', () => {
    it('should clear all messages from the table', async () => {
      // Setup
      await clientDB.insert(users).values({ id: 'another' });
      await clientDB.insert(messages).values([
        { id: mockMessageId, role: 'user', userId },
        { role: 'user', userId: 'another' },
      ]);

      // Execute
      await messageService.removeAllMessages();

      // Assert
      const result = await clientDB.query.messages.findMany({
        where: eq(messages.userId, userId),
      });
      expect(result.length).toBe(0);
    });
  });

  describe('getAllMessages', () => {
    it('should retrieve all messages', async () => {
      await clientDB.insert(messages).values([
        { content: '1', role: 'user', sessionId, topicId, userId },
        { content: '2', role: 'assistant', sessionId, topicId, userId },
      ]);

      // Execute
      const data = await messageService.getAllMessages();

      // Assert
      expect(data).toMatchObject([
        { content: '1', role: 'user', sessionId, topicId, userId },
        { content: '2', role: 'assistant', sessionId, topicId, userId },
      ]);
    });
  });

  describe('updateMessageError', () => {
    it('should update the error field of a message', async () => {
      // Setup
      await clientDB.insert(messages).values({ id: mockMessageId, role: 'user', userId });
      const newError = {
        message: 'Error occurred',
        type: 'InvalidProviderAPIKey',
      } as ChatMessageError;

      // Execute
      await messageService.updateMessageError(mockMessageId, newError);

      // Assert
      const result = await clientDB.query.messages.findFirst({
        where: eq(messages.id, mockMessageId),
      });

      expect(result!.error).toEqual(newError);
    });
  });

  // describe('updateMessagePlugin', () => {
  // it('should update the plugin payload of a message', async () => {
  //   // Setup
  //   const newPlugin = {
  //     type: 'default',
  //     apiName: 'abc',
  //     arguments: '',
  //     identifier: 'plugin1',
  //   } as ChatPluginPayload;
  //
  //   (MessageModel.update as Mock).mockResolvedValue({ ...mockMessage, plugin: newPlugin });
  //
  //   // Execute
  //   const result = await messageService.updateMessagePlugin(mockMessageId, newPlugin);
  //
  //   // Assert
  //   expect(MessageModel.update).toHaveBeenCalledWith(mockMessageId, { plugin: newPlugin });
  //   expect(result).toEqual({ ...mockMessage, plugin: newPlugin });
  // });
  // });

  describe('updateMessagePluginState', () => {
    it('should update the plugin state of a message', async () => {
      // Setup
      await clientDB.insert(messages).values({ id: mockMessageId, role: 'user', userId });
      await clientDB.insert(messagePlugins).values({ id: mockMessageId, userId });
      const key = 'stateKey';
      const value = 'stateValue';
      const newPluginState = { [key]: value };

      // Execute
      await messageService.updateMessagePluginState(mockMessageId, { stateKey: value });

      // Assert
      const result = await clientDB.query.messagePlugins.findFirst({
        where: eq(messagePlugins.id, mockMessageId),
      });
      expect(result!.state).toEqual(newPluginState);
    });
  });

  describe('updateMessagePluginArguments', () => {
    it('should update the plugin arguments object of a message', async () => {
      // Setup
      await clientDB.insert(messages).values({ id: mockMessageId, role: 'user', userId });
      await clientDB.insert(messagePlugins).values({ id: mockMessageId, userId });
      const value = 'stateValue';

      // Execute
      await messageService.updateMessagePluginArguments(mockMessageId, { key: value });

      // Assert
      const result = await clientDB.query.messagePlugins.findFirst({
        where: eq(messagePlugins.id, mockMessageId),
      });
      expect(result).toMatchObject({ arguments: '{"key":"stateValue"}' });
    });
    it('should update the plugin arguments string of a message', async () => {
      // Setup
      await clientDB.insert(messages).values({ id: mockMessageId, role: 'user', userId });
      await clientDB.insert(messagePlugins).values({ id: mockMessageId, userId });
      const value = 'stateValue';
      // Execute
      await messageService.updateMessagePluginArguments(
        mockMessageId,
        JSON.stringify({ abc: value }),
      );

      // Assert
      const result = await clientDB.query.messagePlugins.findFirst({
        where: eq(messagePlugins.id, mockMessageId),
      });
      expect(result).toMatchObject({ arguments: '{"abc":"stateValue"}' });
    });
  });

  describe('countMessages', () => {
    it('should count the total number of messages', async () => {
      // Setup
      await clientDB.insert(messages).values({ id: mockMessageId, role: 'user', userId });

      // Execute
      const count = await messageService.countMessages();

      // Assert
      expect(count).toBe(1);
    });
  });

  describe('updateMessageTTS', () => {
    it('should update the TTS field of a message', async () => {
      // Setup
      await clientDB
        .insert(files)
        .values({ fileType: 'text', id: 'file-abc', name: 'abc', size: 100, url: 'abc', userId });
      await clientDB.insert(messages).values({ id: mockMessageId, role: 'user', userId });
      const newTTS: ChatTTS = { contentMd5: 'abc', file: 'file-abc' };

      // Execute
      await messageService.updateMessageTTS(mockMessageId, newTTS);

      // Assert
      const result = await clientDB.query.messageTTS.findFirst({
        where: eq(messageTTS.id, mockMessageId),
      });

      expect(result).toMatchObject({ contentMd5: 'abc', fileId: 'file-abc', id: mockMessageId });
    });
  });

  describe('updateMessageTranslate', () => {
    it('should update the translate field of a message', async () => {
      // Setup
      await clientDB.insert(messages).values({ id: mockMessageId, role: 'user', userId });
      const newTranslate: ChatTranslate = { content: 'Translated text', to: 'es' };

      // Execute
      await messageService.updateMessageTranslate(mockMessageId, newTranslate);

      // Assert
      const result = await clientDB.query.messageTranslates.findFirst({
        where: eq(messageTranslates.id, mockMessageId),
      });

      expect(result).toMatchObject(newTranslate);
    });
  });

  describe('hasMessages', () => {
    it('should return true if there are messages', async () => {
      // Setup
      await clientDB.insert(messages).values({ id: mockMessageId, role: 'user', userId });

      // Execute
      const result = await messageService.hasMessages();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false if there are no messages', async () => {
      // Execute
      const result = await messageService.hasMessages();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('updateMessageMetadata', () => {
    it('should update the metadata field of a message', async () => {
      // Setup
      await clientDB.insert(messages).values({ id: mockMessageId, role: 'user', userId });
      const newMetadata = {
        autoSuggestions: {
          choice: 0,
          suggestions: ['What can you do?', 'Tell me more'],
        },
      };

      // Execute
      await messageService.updateMessageMetadata(mockMessageId, newMetadata);

      // Assert
      const result = await clientDB.query.messages.findFirst({
        where: eq(messages.id, mockMessageId),
      });

      expect(result!.metadata).toMatchObject(newMetadata);
    });

    it('should merge new metadata with existing metadata (shallow merge)', async () => {
      // Setup
      const existingMetadata = { customField: 'test' } as any;
      await clientDB.insert(messages).values({
        id: mockMessageId,
        metadata: existingMetadata,
        role: 'user',
        userId,
      });

      const newMetadata = {
        autoSuggestions: {
          choice: 1,
          suggestions: ['New suggestion'],
        },
      };

      // Execute
      await messageService.updateMessageMetadata(mockMessageId, newMetadata);

      // Assert
      const result = await clientDB.query.messages.findFirst({
        where: eq(messages.id, mockMessageId),
      });

      expect(result!.metadata).toMatchObject({
        ...existingMetadata,
        ...newMetadata,
      });
    });

    it('should deep merge nested metadata objects', async () => {
      // Setup - existing metadata with nested structure
      const existingMetadata = {
        autoSuggestions: {
          choice: 0,
          suggestions: ['old1', 'old2'],
        },
        otherData: 'preserved',
      };
      await clientDB.insert(messages).values({
        id: mockMessageId,
        metadata: existingMetadata as any,
        role: 'user',
        userId,
      });

      // New metadata updates autoSuggestions and adds new field
      const newMetadata = {
        autoSuggestions: {
          choice: 1,
          suggestions: ['new1', 'new2', 'new3'],
        },
        newField: 'added',
      };

      // Execute
      await messageService.updateMessageMetadata(mockMessageId, newMetadata);

      // Assert - deep merge should update autoSuggestions and preserve otherData
      const result = await clientDB.query.messages.findFirst({
        where: eq(messages.id, mockMessageId),
      });

      expect(result!.metadata).toEqual({
        autoSuggestions: {
          choice: 1, // updated
          suggestions: ['new1', 'new2', 'new3'], // updated
        },
        newField: 'added', // new field added
        otherData: 'preserved', // existing field preserved
      });
    });

    it('should handle empty metadata update', async () => {
      // Setup
      await clientDB.insert(messages).values({ id: mockMessageId, role: 'user', userId });

      // Execute
      await messageService.updateMessageMetadata(mockMessageId, {});

      // Assert
      const result = await clientDB.query.messages.findFirst({
        where: eq(messages.id, mockMessageId),
      });

      expect(result).toBeTruthy();
    });
  });
});
