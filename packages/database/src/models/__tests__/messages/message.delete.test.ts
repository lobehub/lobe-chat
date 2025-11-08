import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { uuid } from '@/utils/uuid';

import {
  chatGroups,
  messagePlugins,
  messageQueries,
  messageTTS,
  messageTranslates,
  messages,
  sessions,
  topics,
  users,
} from '../../../schemas';
import { LobeChatDatabase } from '../../../type';
import { MessageModel } from '../../message';
import { getTestDB } from '../_util';
import { codeEmbedding } from '../fixtures/embedding';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'message-delete-test';
const otherUserId = 'message-delete-test-other';
const messageModel = new MessageModel(serverDB, userId);
const embeddingsId = uuid();

beforeEach(async () => {
  // Clear tables before each test case
  await serverDB.transaction(async (trx) => {
    await trx.delete(users).where(eq(users.id, userId));
    await trx.delete(users).where(eq(users.id, otherUserId));
    await trx.insert(users).values([{ id: userId }, { id: otherUserId }]);

    await trx.insert(sessions).values([{ id: '1', userId }]);
  });
});

afterEach(async () => {
  // Clear tables after each test case
  await serverDB.delete(users).where(eq(users.id, userId));
  await serverDB.delete(users).where(eq(users.id, otherUserId));
});

describe('MessageModel Delete Tests', () => {
  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      // Create test data
      await serverDB
        .insert(messages)
        .values([{ id: '1', userId, role: 'user', content: 'message 1' }]);

      // 调用 deleteMessage 方法
      await messageModel.deleteMessage('1');

      // Assert result
      const result = await serverDB.select().from(messages).where(eq(messages.id, '1'));
      expect(result).toHaveLength(0);
    });

    it('should delete a message with tool calls', async () => {
      // Create test data
      await serverDB.transaction(async (trx) => {
        await trx.insert(messages).values([
          { id: '1', userId, role: 'user', content: 'message 1', tools: [{ id: 'tool1' }] },
          { id: '2', userId, role: 'tool', content: 'message 1' },
        ]);
        await trx
          .insert(messagePlugins)
          .values([{ id: '2', toolCallId: 'tool1', identifier: 'plugin-1', userId }]);
      });

      // 调用 deleteMessage 方法
      await messageModel.deleteMessage('1');

      // Assert result
      const result = await serverDB.select().from(messages).where(eq(messages.id, '1'));
      expect(result).toHaveLength(0);

      const result2 = await serverDB
        .select()
        .from(messagePlugins)
        .where(eq(messagePlugins.id, '2'));

      expect(result2).toHaveLength(0);
    });

    it('should only delete messages belonging to the user', async () => {
      // Create test data
      await serverDB
        .insert(messages)
        .values([{ id: '1', userId: otherUserId, role: 'user', content: 'message 1' }]);

      // 调用 deleteMessage 方法
      await messageModel.deleteMessage('1');

      // Assert result
      const result = await serverDB.select().from(messages).where(eq(messages.id, '1'));
      expect(result).toHaveLength(1);
    });
  });

  describe('deleteMessages', () => {
    it('should delete 2 messages', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        { id: '1', userId, role: 'user', content: 'message 1' },
        { id: '2', userId, role: 'user', content: 'message 2' },
      ]);

      // 调用 deleteMessage 方法
      await messageModel.deleteMessages(['1', '2']);

      // Assert result
      const result = await serverDB.select().from(messages).where(eq(messages.id, '1'));
      expect(result).toHaveLength(0);
      const result2 = await serverDB.select().from(messages).where(eq(messages.id, '2'));
      expect(result2).toHaveLength(0);
    });

    it('should only delete messages belonging to the user', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        { id: '1', userId: otherUserId, role: 'user', content: 'message 1' },
        { id: '2', userId: otherUserId, role: 'user', content: 'message 1' },
      ]);

      // 调用 deleteMessage 方法
      await messageModel.deleteMessages(['1', '2']);

      // Assert result
      const result = await serverDB.select().from(messages).where(eq(messages.id, '1'));
      expect(result).toHaveLength(1);
    });
  });
  describe('deleteMessageTranslate', () => {
    it('should delete the message translate record', async () => {
      // Create test data
      await serverDB.insert(messages).values([{ id: '1', role: 'abc', userId }]);
      await serverDB.insert(messageTranslates).values([{ id: '1', userId }]);

      // 调用 deleteMessageTranslate 方法
      await messageModel.deleteMessageTranslate('1');

      // Assert result
      const result = await serverDB
        .select()
        .from(messageTranslates)
        .where(eq(messageTranslates.id, '1'));

      expect(result).toHaveLength(0);
    });
  });

  describe('deleteMessageTTS', () => {
    it('should delete the message TTS record', async () => {
      // Create test data
      await serverDB.insert(messages).values([{ id: '1', role: 'abc', userId }]);
      await serverDB.insert(messageTTS).values([{ userId, id: '1' }]);

      // 调用 deleteMessageTTS 方法
      await messageModel.deleteMessageTTS('1');

      // Assert result
      const result = await serverDB.select().from(messageTTS).where(eq(messageTTS.id, '1'));
      expect(result).toHaveLength(0);
    });
  });
  describe('deleteMessagesBySession', () => {
    it('should delete messages by session ID', async () => {
      await serverDB.insert(sessions).values([
        { id: 'session1', userId },
        { id: 'session2', userId },
      ]);

      await serverDB.insert(messages).values([
        {
          id: '1',
          userId,
          sessionId: 'session1',
          role: 'user',
          content: 'message 1',
        },
        {
          id: '2',
          userId,
          sessionId: 'session1',
          role: 'assistant',
          content: 'message 2',
        },
        {
          id: '3',
          userId,
          sessionId: 'session2',
          role: 'user',
          content: 'message 3',
        },
      ]);

      await messageModel.deleteMessagesBySession('session1');

      const remainingMessages = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.userId, userId));

      expect(remainingMessages).toHaveLength(1);
      expect(remainingMessages[0].id).toBe('3');
    });

    it('should delete messages by session ID and topic ID', async () => {
      await serverDB.insert(sessions).values([{ id: 'session1', userId }]);
      await serverDB.insert(topics).values([
        { id: 'topic1', sessionId: 'session1', userId },
        { id: 'topic2', sessionId: 'session1', userId },
      ]);

      await serverDB.insert(messages).values([
        {
          id: '1',
          userId,
          sessionId: 'session1',
          topicId: 'topic1',
          role: 'user',
          content: 'message 1',
        },
        {
          id: '2',
          userId,
          sessionId: 'session1',
          topicId: 'topic2',
          role: 'assistant',
          content: 'message 2',
        },
      ]);

      await messageModel.deleteMessagesBySession('session1', 'topic1');

      const remainingMessages = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.userId, userId));

      expect(remainingMessages).toHaveLength(1);
      expect(remainingMessages[0].id).toBe('2');
    });

    it('should delete only non-topic messages when topicId is null', async () => {
      await serverDB.insert(sessions).values([{ id: 'session1', userId }]);
      await serverDB.insert(topics).values([
        { id: 'topic1', sessionId: 'session1', userId },
        { id: 'topic2', sessionId: 'session1', userId },
      ]);

      await serverDB.insert(messages).values([
        {
          id: '1',
          userId,
          sessionId: 'session1',
          topicId: null,
          role: 'user',
          content: 'message without topic 1',
        },
        {
          id: '2',
          userId,
          sessionId: 'session1',
          topicId: null,
          role: 'assistant',
          content: 'message without topic 2',
        },
        {
          id: '3',
          userId,
          sessionId: 'session1',
          topicId: 'topic1',
          role: 'user',
          content: 'message in topic1',
        },
        {
          id: '4',
          userId,
          sessionId: 'session1',
          topicId: 'topic2',
          role: 'assistant',
          content: 'message in topic2',
        },
      ]);

      // Delete messages in session1 with null topicId
      await messageModel.deleteMessagesBySession('session1', null);

      const remainingMessages = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.userId, userId))
        .orderBy(messages.id);

      // Should only keep messages with topics
      expect(remainingMessages).toHaveLength(2);
      expect(remainingMessages[0].id).toBe('3');
      expect(remainingMessages[1].id).toBe('4');
    });

    it('should delete messages with specific groupId in session', async () => {
      await serverDB.insert(sessions).values([{ id: 'session1', userId }]);
      await serverDB.insert(chatGroups).values([
        { id: 'group1', userId, title: 'Group 1' },
        { id: 'group2', userId, title: 'Group 2' },
      ]);

      await serverDB.insert(messages).values([
        {
          id: 'msg-group1',
          userId,
          sessionId: 'session1',
          groupId: 'group1',
          role: 'user',
          content: 'message in group1',
        },
        {
          id: 'msg-group2',
          userId,
          sessionId: 'session1',
          groupId: 'group2',
          role: 'assistant',
          content: 'message in group2',
        },
        {
          id: 'msg-no-group',
          userId,
          sessionId: 'session1',
          groupId: null,
          role: 'user',
          content: 'message without group',
        },
      ]);

      // Delete messages with specific groupId
      await messageModel.deleteMessagesBySession('session1', null, 'group1');

      const remainingMessages = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.userId, userId))
        .orderBy(messages.id);

      expect(remainingMessages).toHaveLength(2);
      expect(remainingMessages[0].id).toBe('msg-group2');
      expect(remainingMessages[1].id).toBe('msg-no-group');
    });

    it('should delete messages with combined topicId and groupId filters', async () => {
      await serverDB.insert(sessions).values([{ id: 'session1', userId }]);
      await serverDB.insert(topics).values([{ id: 'topic1', sessionId: 'session1', userId }]);
      await serverDB.insert(chatGroups).values([{ id: 'group1', userId, title: 'Group 1' }]);

      await serverDB.insert(messages).values([
        {
          id: 'msg-t1-g1',
          userId,
          sessionId: 'session1',
          topicId: 'topic1',
          groupId: 'group1',
          role: 'user',
          content: 'topic1 group1',
        },
        {
          id: 'msg-t1-no-group',
          userId,
          sessionId: 'session1',
          topicId: 'topic1',
          groupId: null,
          role: 'user',
          content: 'topic1 no group',
        },
        {
          id: 'msg-no-topic-g1',
          userId,
          sessionId: 'session1',
          topicId: null,
          groupId: 'group1',
          role: 'user',
          content: 'no topic group1',
        },
      ]);

      // Delete messages with specific topic and group combination
      await messageModel.deleteMessagesBySession('session1', 'topic1', 'group1');

      const remainingMessages = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.userId, userId))
        .orderBy(messages.id);

      expect(remainingMessages).toHaveLength(2);
      expect(remainingMessages[0].id).toBe('msg-no-topic-g1');
      expect(remainingMessages[1].id).toBe('msg-t1-no-group');
    });
  });
  describe('deleteMessageQuery', () => {
    it('should delete a message query by ID', async () => {
      // Create test data
      const queryId = uuid();
      await serverDB.insert(messages).values({
        id: 'msg4',
        userId,
        role: 'user',
        content: 'test message',
      });

      await serverDB.insert(messageQueries).values({
        id: queryId,
        messageId: 'msg4',
        userQuery: 'test query',
        rewriteQuery: 'rewritten query',
        userId,
      });

      // 验证查询已创建
      const beforeDelete = await serverDB
        .select()
        .from(messageQueries)
        .where(eq(messageQueries.id, queryId));

      expect(beforeDelete).toHaveLength(1);

      // 调用 deleteMessageQuery 方法
      await messageModel.deleteMessageQuery(queryId);

      // 验证查询已删除
      const afterDelete = await serverDB
        .select()
        .from(messageQueries)
        .where(eq(messageQueries.id, queryId));

      expect(afterDelete).toHaveLength(0);
    });

    it('should only delete message queries belonging to the user', async () => {
      // Create test data - 其他用户的查询
      const queryId = uuid();
      await serverDB.insert(messages).values({
        id: 'msg5',
        userId: otherUserId,
        role: 'user',
        content: 'test message',
      });

      await serverDB.insert(messageQueries).values({
        id: queryId,
        messageId: 'msg5',
        userQuery: 'test query',
        rewriteQuery: 'rewritten query',
        userId: otherUserId, // 其他用户
      });

      // 调用 deleteMessageQuery 方法
      await messageModel.deleteMessageQuery(queryId);

      // 验证查询未被删除
      const afterDelete = await serverDB
        .select()
        .from(messageQueries)
        .where(eq(messageQueries.id, queryId));

      expect(afterDelete).toHaveLength(1);
    });

    it('should throw error when deleting non-existent message query', async () => {
      // 调用 deleteMessageQuery 方法删除不存在的查询
      try {
        await messageModel.deleteMessageQuery('non-existent-id');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });
});
