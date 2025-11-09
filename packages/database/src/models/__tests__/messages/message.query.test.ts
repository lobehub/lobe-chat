import { INBOX_SESSION_ID } from '@lobechat/const';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { uuid } from '@/utils/uuid';

import {
  agents,
  chatGroups,
  chunks,
  documents,
  embeddings,
  fileChunks,
  files,
  messagePlugins,
  messageQueries,
  messageQueryChunks,
  messageTTS,
  messageTranslates,
  messages,
  messagesFiles,
  sessions,
  topics,
  users,
} from '../../../schemas';
import { LobeChatDatabase } from '../../../type';
import { MessageModel } from '../../message';
import { getTestDB } from '../_util';
import { codeEmbedding } from '../fixtures/embedding';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'message-query-test';
const otherUserId = 'message-query-test-other';
const messageModel = new MessageModel(serverDB, userId);
const embeddingsId = uuid();

beforeEach(async () => {
  // Clear tables before each test case
  await serverDB.transaction(async (trx) => {
    await trx.delete(users).where(eq(users.id, userId));
    await trx.delete(users).where(eq(users.id, otherUserId));
    await trx.insert(users).values([{ id: userId }, { id: otherUserId }]);

    await trx.insert(sessions).values([
      // { id: 'session1', userId },
      // { id: 'session2', userId },
      { id: '1', userId },
    ]);
    await trx.insert(files).values({
      id: 'f1',
      userId: userId,
      url: 'abc',
      name: 'file-1',
      fileType: 'image/png',
      size: 1000,
    });

    await trx.insert(embeddings).values({
      id: embeddingsId,
      embeddings: codeEmbedding,
      userId,
    });
  });
});

afterEach(async () => {
  // Clear tables after each test case
  await serverDB.delete(users).where(eq(users.id, userId));
  await serverDB.delete(users).where(eq(users.id, otherUserId));
});

describe('MessageModel Query Tests', () => {
  describe('query', () => {
    it('should query messages by user ID', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        { id: '1', userId, role: 'user', content: 'message 1', createdAt: new Date('2023-01-01') },
        { id: '2', userId, role: 'user', content: 'message 2', createdAt: new Date('2023-02-01') },
        {
          id: '3',
          userId: otherUserId,
          role: 'user',
          content: 'message 3',
          createdAt: new Date('2023-03-01'),
        },
      ]);

      // Call query method
      const result = await messageModel.query();

      // Assert result
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should return empty messages if not match the user ID', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        {
          id: '1',
          userId: otherUserId,
          role: 'user',
          content: '1',
          createdAt: new Date('2023-01-01'),
        },
        {
          id: '2',
          userId: otherUserId,
          role: 'user',
          content: '2',
          createdAt: new Date('2023-02-01'),
        },
        {
          id: '3',
          userId: otherUserId,
          role: 'user',
          content: '3',
          createdAt: new Date('2023-03-01'),
        },
      ]);

      // Call query method
      const result = await messageModel.query();

      // Assert result
      expect(result).toHaveLength(0);
    });

    it('should query messages with pagination', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        { id: '1', userId, role: 'user', content: 'message 1', createdAt: new Date('2023-01-01') },
        { id: '2', userId, role: 'user', content: 'message 2', createdAt: new Date('2023-02-01') },
        { id: '3', userId, role: 'user', content: 'message 3', createdAt: new Date('2023-03-01') },
      ]);

      // Test pagination
      const result1 = await messageModel.query({ current: 0, pageSize: 2 });
      expect(result1).toHaveLength(2);

      const result2 = await messageModel.query({ current: 1, pageSize: 1 });
      expect(result2).toHaveLength(1);
      expect(result2[0].id).toBe('2');
    });

    it('should filter messages by sessionId', async () => {
      // Create test data
      await serverDB.insert(sessions).values([
        { id: 'session1', userId },
        { id: 'session2', userId },
      ]);
      await serverDB.insert(messages).values([
        {
          id: '1',
          userId,
          role: 'user',
          sessionId: 'session1',
          content: 'message 1',
          createdAt: new Date('2022-02-01'),
        },
        {
          id: '2',
          userId,
          role: 'user',
          sessionId: 'session1',
          content: 'message 2',
          createdAt: new Date('2023-02-02'),
        },
        { id: '3', userId, role: 'user', sessionId: 'session2', content: 'message 3' },
      ]);

      // Test filtering by sessionId
      const result = await messageModel.query({ sessionId: 'session1' });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should filter messages by topicId', async () => {
      // Create test data
      const sessionId = 'session1';
      await serverDB.insert(sessions).values([{ id: sessionId, userId }]);
      const topicId = 'topic1';
      await serverDB.insert(topics).values([
        { id: topicId, sessionId, userId },
        { id: 'topic2', sessionId, userId },
      ]);

      await serverDB.insert(messages).values([
        { id: '1', userId, role: 'user', topicId, content: '1', createdAt: new Date('2022-04-01') },
        { id: '2', userId, role: 'user', topicId, content: '2', createdAt: new Date('2023-02-01') },
        { id: '3', userId, role: 'user', topicId: 'topic2', content: 'message 3' },
      ]);

      // Test filtering by topicId
      const result = await messageModel.query({ topicId });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should filter messages by groupId and expose group metadata', async () => {
      await serverDB.transaction(async (trx) => {
        await trx.insert(chatGroups).values([
          { id: 'group-1', userId, title: 'Group 1' },
          { id: 'group-2', userId, title: 'Group 2' },
        ]);

        await trx.insert(agents).values([
          { id: 'agent-group', userId, title: 'Agent Group' },
          { id: 'agent-other', userId, title: 'Agent Other' },
        ]);

        await trx.insert(messages).values([
          {
            id: 'group-message',
            userId,
            role: 'assistant',
            content: 'group message',
            groupId: 'group-1',
            agentId: 'agent-group',
            targetId: 'user',
            createdAt: new Date('2024-01-01'),
          },
          {
            id: 'other-message',
            userId,
            role: 'assistant',
            content: 'other group message',
            groupId: 'group-2',
            agentId: 'agent-other',
            targetId: 'user',
            createdAt: new Date('2024-01-02'),
          },
        ]);
      });

      const result = await messageModel.query({ groupId: 'group-1' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('group-message');
      expect(result[0].groupId).toBe('group-1');
      expect(result[0].agentId).toBe('agent-group');
      expect(result[0].targetId).toBe('user');
    });

    it('should query messages with join', async () => {
      // Create test data
      await serverDB.transaction(async (trx) => {
        await trx.insert(messages).values([
          {
            id: '1',
            userId,
            role: 'user',
            content: 'message 1',
            createdAt: new Date('2023-01-01'),
          },
          {
            id: '2',
            userId,
            role: 'user',
            content: 'message 2',
            createdAt: new Date('2023-02-01'),
          },
          {
            id: '3',
            userId: otherUserId,
            role: 'user',
            content: 'message 3',
            createdAt: new Date('2023-03-01'),
          },
        ]);
        await trx.insert(files).values([
          { id: 'f-0', url: 'abc', name: 'file-1', userId, fileType: 'image/png', size: 1000 },
          { id: 'f-1', url: 'abc', name: 'file-1', userId, fileType: 'image/png', size: 100 },
          { id: 'f-3', url: 'abc', name: 'file-3', userId, fileType: 'image/png', size: 400 },
        ]);
        await trx.insert(messageTTS).values([
          { id: '1', userId },
          { id: '2', voice: 'a', fileId: 'f-1', contentMd5: 'abc', userId },
        ]);

        await trx.insert(messagesFiles).values([
          { fileId: 'f-0', messageId: '1', userId },
          { fileId: 'f-3', messageId: '1', userId },
        ]);
      });

      const domain = 'http://abc.com';
      // Call query method
      const result = await messageModel.query(
        {},
        { postProcessUrl: async (path) => `${domain}/${path}` },
      );

      // Assert result
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].imageList).toEqual([
        { alt: 'file-1', id: 'f-0', url: `${domain}/abc` },
        { alt: 'file-3', id: 'f-3', url: `${domain}/abc` },
      ]);

      expect(result[1].id).toBe('2');
      expect(result[1].imageList).toEqual([]);
    });

    it('should include translate, tts and other extra fields in query result', async () => {
      // Create test data
      await serverDB.transaction(async (trx) => {
        await trx.insert(messages).values([
          {
            id: '1',
            userId,
            role: 'user',
            content: 'message 1',
            createdAt: new Date('2023-01-01'),
          },
        ]);
        await trx
          .insert(messageTranslates)
          .values([{ id: '1', content: 'translated', from: 'en', to: 'zh', userId }]);
        await trx
          .insert(messageTTS)
          .values([{ id: '1', voice: 'voice1', fileId: 'f1', contentMd5: 'md5', userId }]);
      });

      // Call query method
      const result = await messageModel.query();

      // Assert result
      expect(result[0].extra!.translate).toEqual({ content: 'translated', from: 'en', to: 'zh' });
      expect(result[0].extra!.tts).toEqual({
        contentMd5: 'md5',
        file: 'f1',
        voice: 'voice1',
      });
    });

    it('should handle edge cases of pagination parameters', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        { id: '1', userId, role: 'user', content: 'message 1' },
        { id: '2', userId, role: 'user', content: 'message 2' },
        { id: '3', userId, role: 'user', content: 'message 3' },
      ]);

      // 测试 current 和 pageSize 的边界情况
      const result1 = await messageModel.query({ current: 0, pageSize: 2 });
      expect(result1).toHaveLength(2);

      const result2 = await messageModel.query({ current: 1, pageSize: 2 });
      expect(result2).toHaveLength(1);

      const result3 = await messageModel.query({ current: 2, pageSize: 2 });
      expect(result3).toHaveLength(0);
    });

    describe('query with messageQueries', () => {
      it('should include ragQuery, ragQueryId and ragRawQuery in query results', async () => {
        // Create test data
        const messageId = 'msg-with-query';
        const queryId = uuid();

        await serverDB.insert(messages).values({
          id: messageId,
          userId,
          role: 'user',
          content: 'test message',
        });

        await serverDB.insert(messageQueries).values({
          id: queryId,
          messageId,
          userQuery: 'original query',
          rewriteQuery: 'rewritten query',
          userId,
        });

        // Call query method
        const result = await messageModel.query();

        // Assert result
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(messageId);
        expect(result[0].ragQueryId).toBe(queryId);
        expect(result[0].ragQuery).toBe('rewritten query');
        expect(result[0].ragRawQuery).toBe('original query');
      });

      it('should handle multiple message queries for the same message', async () => {
        // Create test data
        const messageId = 'msg-multi-query';
        const queryId1 = uuid();
        const queryId2 = uuid();

        await serverDB.insert(messages).values({
          id: messageId,
          userId,
          role: 'user',
          content: 'test message',
        });

        // 创建两个查询，查询结果应该只包含其中一个
        // Note: 由于 messageQueries 表没有排序字段，返回哪个 query 是不确定的
        // 但应该只返回一个
        await serverDB.insert(messageQueries).values([
          {
            id: queryId1,
            messageId,
            userQuery: 'original query 1',
            rewriteQuery: 'rewritten query 1',
            userId,
          },
          {
            id: queryId2,
            messageId,
            userQuery: 'original query 2',
            rewriteQuery: 'rewritten query 2',
            userId,
          },
        ]);

        // Call query method
        const result = await messageModel.query();

        // Assert result - 应该只包含一个查询（具体是哪个取决于数据库实现）
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(messageId);
        // 验证返回的是两个 query 中的一个
        expect([queryId1, queryId2]).toContain(result[0].ragQueryId);
        expect(['rewritten query 1', 'rewritten query 2']).toContain(result[0].ragQuery);
        expect(['original query 1', 'original query 2']).toContain(result[0].ragRawQuery);
      });
    });

    it('should handle complex query with multiple joins and file chunks', async () => {
      await serverDB.transaction(async (trx) => {
        const chunk1Id = uuid();
        const query1Id = uuid();
        // 创建基础消息
        await trx.insert(messages).values({
          id: 'msg1',
          userId,
          role: 'user',
          content: 'test message',
          createdAt: new Date('2023-01-01'),
        });

        // 创建文件
        await trx.insert(files).values([
          {
            id: 'file1',
            userId,
            name: 'test.txt',
            url: 'test-url',
            fileType: 'text/plain',
            size: 100,
          },
        ]);

        // 创建文件块
        await trx.insert(chunks).values({
          id: chunk1Id,
          text: 'chunk content',
        });

        // 关联消息和文件
        await trx.insert(messagesFiles).values({
          messageId: 'msg1',
          userId,
          fileId: 'file1',
        });

        // 创建文件块关联
        await trx.insert(fileChunks).values({
          fileId: 'file1',
          userId,
          chunkId: chunk1Id,
        });

        // 创建消息查询
        await trx.insert(messageQueries).values({
          id: query1Id,
          messageId: 'msg1',
          userId,
          userQuery: 'original query',
          rewriteQuery: 'rewritten query',
        });

        // 创建消息查询块关联
        await trx.insert(messageQueryChunks).values({
          messageId: 'msg1',
          queryId: query1Id,
          chunkId: chunk1Id,
          similarity: '0.95',
          userId,
        });
      });

      const result = await messageModel.query();

      expect(result).toHaveLength(1);
      expect(result[0].chunksList).toHaveLength(1);
      expect(result[0].chunksList![0]).toMatchObject({
        text: 'chunk content',
        similarity: 0.95,
      });
    });

    it('should handle null similarity in chunks and convert to number', async () => {
      await serverDB.transaction(async (trx) => {
        const chunk1Id = uuid();
        const query1Id = uuid();

        await trx.insert(messages).values({
          id: 'msg1',
          userId,
          role: 'user',
          content: 'test message',
        });

        await trx.insert(files).values({
          id: 'file1',
          userId,
          name: 'test.txt',
          url: 'test-url',
          fileType: 'text/plain',
          size: 100,
        });

        await trx.insert(chunks).values({
          id: chunk1Id,
          text: 'chunk content',
        });

        await trx.insert(fileChunks).values({
          fileId: 'file1',
          userId,
          chunkId: chunk1Id,
        });

        await trx.insert(messageQueries).values({
          id: query1Id,
          messageId: 'msg1',
          userId,
          userQuery: 'query',
          rewriteQuery: 'rewritten',
        });

        // Insert chunk with null similarity
        await trx.insert(messageQueryChunks).values({
          messageId: 'msg1',
          queryId: query1Id,
          chunkId: chunk1Id,
          similarity: null as any,
          userId,
        });
      });

      const result = await messageModel.query();

      expect(result).toHaveLength(1);
      expect(result[0].chunksList).toHaveLength(1);
      // null should be converted to undefined
      expect(result[0].chunksList![0].similarity).toBeUndefined();
    });

    it('should return empty arrays for files and chunks if none exist', async () => {
      await serverDB.insert(messages).values({
        id: 'msg1',
        userId,
        role: 'user',
        content: 'test message',
      });

      const result = await messageModel.query();

      expect(result).toHaveLength(1);
      expect(result[0].fileList).toEqual([]);
      expect(result[0].imageList).toEqual([]);
      expect(result[0].chunksList).toEqual([]);
    });

    it('should query messages in session with null topicId (only non-topic messages)', async () => {
      await serverDB.insert(sessions).values([{ id: 'session1', userId }]);
      await serverDB.insert(topics).values([
        { id: 'topic1', sessionId: 'session1', userId },
        { id: 'topic2', sessionId: 'session1', userId },
      ]);

      await serverDB.insert(messages).values([
        {
          id: 'msg-no-topic-1',
          userId,
          sessionId: 'session1',
          topicId: null,
          role: 'user',
          content: 'message without topic 1',
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'msg-no-topic-2',
          userId,
          sessionId: 'session1',
          topicId: null,
          role: 'assistant',
          content: 'message without topic 2',
          createdAt: new Date('2023-01-02'),
        },
        {
          id: 'msg-topic1',
          userId,
          sessionId: 'session1',
          topicId: 'topic1',
          role: 'user',
          content: 'message in topic1',
          createdAt: new Date('2023-01-03'),
        },
        {
          id: 'msg-topic2',
          userId,
          sessionId: 'session1',
          topicId: 'topic2',
          role: 'assistant',
          content: 'message in topic2',
          createdAt: new Date('2023-01-04'),
        },
      ]);

      // Query with explicit null topicId should return only non-topic messages
      const result = await messageModel.query({ sessionId: 'session1', topicId: null });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg-no-topic-1');
      expect(result[1].id).toBe('msg-no-topic-2');
    });

    it('should query messages in session with null groupId (only non-group messages)', async () => {
      await serverDB.insert(sessions).values([{ id: 'session1', userId }]);
      await serverDB.insert(chatGroups).values([
        { id: 'group1', userId, title: 'Group 1' },
        { id: 'group2', userId, title: 'Group 2' },
      ]);

      await serverDB.insert(messages).values([
        {
          id: 'msg-no-group-1',
          userId,
          sessionId: 'session1',
          groupId: null,
          role: 'user',
          content: 'message without group 1',
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'msg-no-group-2',
          userId,
          sessionId: 'session1',
          groupId: null,
          role: 'assistant',
          content: 'message without group 2',
          createdAt: new Date('2023-01-02'),
        },
        {
          id: 'msg-group1',
          userId,
          sessionId: 'session1',
          groupId: 'group1',
          role: 'user',
          content: 'message in group1',
          createdAt: new Date('2023-01-03'),
        },
        {
          id: 'msg-group2',
          userId,
          sessionId: 'session1',
          groupId: 'group2',
          role: 'assistant',
          content: 'message in group2',
          createdAt: new Date('2023-01-04'),
        },
      ]);

      // Query with explicit null groupId should return only non-group messages
      const result = await messageModel.query({ sessionId: 'session1', groupId: null });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg-no-group-1');
      expect(result[1].id).toBe('msg-no-group-2');
    });

    it('should query inbox messages with null topicId when no sessionId specified', async () => {
      await serverDB.insert(sessions).values([{ id: 'session1', userId }]);
      await serverDB.insert(topics).values([{ id: 'topic1', sessionId: 'session1', userId }]);

      await serverDB.insert(messages).values([
        {
          id: 'msg-inbox-no-topic',
          userId,
          sessionId: null, // inbox message
          topicId: null,
          role: 'user',
          content: 'inbox message without topic',
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'msg-session-no-topic',
          userId,
          sessionId: 'session1',
          topicId: null,
          role: 'user',
          content: 'session message without topic',
          createdAt: new Date('2023-01-02'),
        },
        {
          id: 'msg-session-with-topic',
          userId,
          sessionId: 'session1',
          topicId: 'topic1',
          role: 'user',
          content: 'session message with topic',
          createdAt: new Date('2023-01-03'),
        },
      ]);

      // When no sessionId specified (defaults to inbox), query with topicId null
      // should return only inbox messages without topics
      const result = await messageModel.query({ topicId: null });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('msg-inbox-no-topic');
    });

    it('should query messages with combined sessionId and topicId filters', async () => {
      await serverDB.insert(sessions).values([
        { id: 'session1', userId },
        { id: 'session2', userId },
      ]);
      await serverDB.insert(topics).values([
        { id: 'topic1', sessionId: 'session1', userId },
        { id: 'topic2', sessionId: 'session1', userId },
      ]);

      await serverDB.insert(messages).values([
        {
          id: 'msg-s1-t1',
          userId,
          sessionId: 'session1',
          topicId: 'topic1',
          role: 'user',
          content: 'session1 topic1',
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'msg-s1-t2',
          userId,
          sessionId: 'session1',
          topicId: 'topic2',
          role: 'user',
          content: 'session1 topic2',
          createdAt: new Date('2023-01-02'),
        },
        {
          id: 'msg-s2',
          userId,
          sessionId: 'session2',
          topicId: null,
          role: 'user',
          content: 'session2 no topic',
          createdAt: new Date('2023-01-03'),
        },
      ]);

      // Query specific session and topic combination
      const result = await messageModel.query({ sessionId: 'session1', topicId: 'topic1' });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('msg-s1-t1');
    });
  });

  describe('queryAll', () => {
    it('should return all messages belonging to the user in ascending order', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        {
          id: '1',
          userId,
          role: 'user',
          content: 'message 1',
          createdAt: new Date('2023-01-01'),
        },
        {
          id: '2',
          userId,
          role: 'user',
          content: 'message 2',
          createdAt: new Date('2023-02-01'),
        },
        {
          id: '3',
          userId: otherUserId,
          role: 'user',
          content: 'message 3',
          createdAt: new Date('2023-03-01'),
        },
      ]);

      // Call queryAll method
      const result = await messageModel.queryAll();

      // Assert result
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });

  describe('findById', () => {
    it('should find message by ID', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        { id: '1', userId, role: 'user', content: 'message 1' },
        { id: '2', userId: otherUserId, role: 'user', content: 'message 2' },
      ]);

      // Call findById method
      const result = await messageModel.findById('1');

      // Assert result
      expect(result?.id).toBe('1');
      expect(result?.content).toBe('message 1');
    });

    it('should return undefined if message does not belong to user', async () => {
      // Create test data
      await serverDB
        .insert(messages)
        .values([{ id: '1', userId: otherUserId, role: 'user', content: 'message 1' }]);

      // Call findById method
      const result = await messageModel.findById('1');

      // Assert result
      expect(result).toBeUndefined();
    });
  });

  describe('queryBySessionId', () => {
    it('should query messages by sessionId', async () => {
      // Create test data
      const sessionId = 'session1';
      await serverDB.insert(sessions).values([
        { id: 'session1', userId },
        { id: 'session2', userId },
      ]);
      await serverDB.insert(messages).values([
        {
          id: '1',
          userId,
          role: 'user',
          sessionId,
          content: 'message 1',
          createdAt: new Date('2022-01-01'),
        },
        {
          id: '2',
          userId,
          role: 'user',
          sessionId,
          content: 'message 2',
          createdAt: new Date('2023-02-01'),
        },
        { id: '3', userId, role: 'user', sessionId: 'session2', content: 'message 3' },
      ]);

      // Call queryBySessionId method
      const result = await messageModel.queryBySessionId(sessionId);

      // Assert result
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should query inbox messages when sessionId is null', async () => {
      await serverDB.insert(sessions).values([{ id: 'session1', userId }]);

      await serverDB.insert(messages).values([
        {
          id: 'inbox-msg-1',
          userId,
          sessionId: null, // inbox message
          role: 'user',
          content: 'inbox message 1',
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'inbox-msg-2',
          userId,
          sessionId: null, // inbox message
          role: 'assistant',
          content: 'inbox message 2',
          createdAt: new Date('2023-01-02'),
        },
        {
          id: 'session-msg',
          userId,
          sessionId: 'session1',
          role: 'user',
          content: 'session message',
          createdAt: new Date('2023-01-03'),
        },
      ]);

      // Query with null sessionId should return only inbox messages
      const result = await messageModel.queryBySessionId(null);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('inbox-msg-1');
      expect(result[1].id).toBe('inbox-msg-2');
    });

    it('should query inbox messages when sessionId is undefined', async () => {
      await serverDB.insert(sessions).values([{ id: 'session1', userId }]);

      await serverDB.insert(messages).values([
        {
          id: 'inbox-msg',
          userId,
          sessionId: null,
          role: 'user',
          content: 'inbox message',
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'session-msg',
          userId,
          sessionId: 'session1',
          role: 'user',
          content: 'session message',
          createdAt: new Date('2023-01-02'),
        },
      ]);

      // Query with undefined sessionId should also return inbox messages
      const result = await messageModel.queryBySessionId(undefined);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('inbox-msg');
    });

    it('should query inbox messages when sessionId is INBOX_SESSION_ID', async () => {
      await serverDB.insert(sessions).values([{ id: 'session1', userId }]);

      await serverDB.insert(messages).values([
        {
          id: 'inbox-msg-1',
          userId,
          sessionId: null,
          role: 'user',
          content: 'inbox message 1',
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'inbox-msg-2',
          userId,
          sessionId: null,
          role: 'assistant',
          content: 'inbox message 2',
          createdAt: new Date('2023-01-02'),
        },
        {
          id: 'session-msg',
          userId,
          sessionId: 'session1',
          role: 'user',
          content: 'session message',
          createdAt: new Date('2023-01-03'),
        },
      ]);

      // Query with INBOX_SESSION_ID should return only inbox messages
      const result = await messageModel.queryBySessionId(INBOX_SESSION_ID);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('inbox-msg-1');
      expect(result[1].id).toBe('inbox-msg-2');
    });
  });

  describe('queryByKeyWord', () => {
    it('should query messages by keyword', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        { id: '1', userId, role: 'user', content: 'apple', createdAt: new Date('2022-02-01') },
        { id: '2', userId, role: 'user', content: 'banana' },
        { id: '3', userId, role: 'user', content: 'pear' },
        { id: '4', userId, role: 'user', content: 'apple pie', createdAt: new Date('2024-02-01') },
      ]);

      // Test querying messages with specific keyword
      const result = await messageModel.queryByKeyword('apple');

      // Assert result
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('4');
      expect(result[1].id).toBe('1');
    });

    it('should return empty array when keyword is empty', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        { id: '1', userId, role: 'user', content: 'apple' },
        { id: '2', userId, role: 'user', content: 'banana' },
        { id: '3', userId, role: 'user', content: 'pear' },
        { id: '4', userId, role: 'user', content: 'apple pie' },
      ]);

      // Test returning empty array when keyword is empty
      const result = await messageModel.queryByKeyword('');

      // Assert result
      expect(result).toHaveLength(0);
    });
  });

  describe('query with files edge cases', () => {
    it('should handle files with empty fileType', async () => {
      await serverDB.transaction(async (trx) => {
        await trx.insert(sessions).values({ id: 'session1', userId });

        // Create files with empty string fileType (tests the || '' branch)
        await trx.insert(files).values([
          {
            id: 'file-empty-type',
            userId,
            url: 'unknown.bin',
            name: 'unknown file',
            fileType: '',
            size: 1000,
          },
          {
            id: 'file-image',
            userId,
            url: 'image.png',
            name: 'test image',
            fileType: 'image/png',
            size: 2000,
          },
          {
            id: 'file-video',
            userId,
            url: 'video.mp4',
            name: 'test video',
            fileType: 'video/mp4',
            size: 3000,
          },
        ]);

        const messageId = uuid();
        await trx.insert(messages).values({
          id: messageId,
          userId,
          role: 'user',
          content: 'Message with various fileTypes',
          sessionId: 'session1',
        });

        await trx.insert(messagesFiles).values([
          { messageId, fileId: 'file-empty-type', userId },
          { messageId, fileId: 'file-image', userId },
          { messageId, fileId: 'file-video', userId },
        ]);
      });

      const result = await messageModel.query({ sessionId: 'session1' });

      expect(result).toHaveLength(1);
      expect(result[0].fileList).toHaveLength(1); // empty fileType should go to fileList
      expect(result[0].fileList![0].id).toBe('file-empty-type');
      expect(result[0].imageList).toHaveLength(1);
      expect(result[0].imageList![0].id).toBe('file-image');
      expect(result[0].videoList).toHaveLength(1);
      expect(result[0].videoList![0].id).toBe('file-video');
    });
  });

  describe('query with documents', () => {
    it('should include document content when files have associated documents', async () => {
      // Create a file with an associated document
      const fileId = uuid();

      await serverDB.transaction(async (trx) => {
        await trx.insert(sessions).values({ id: 'session1', userId });

        await trx.insert(files).values({
          id: fileId,
          userId,
          url: 'document.pdf',
          name: 'test.pdf',
          fileType: 'application/pdf',
          size: 5000,
        });

        await trx.insert(documents).values({
          fileId,
          userId,
          content: 'This is the document content for testing',
          fileType: 'application/pdf',
          sourceType: 'file',
          source: 'document.pdf',
          totalCharCount: 42,
          totalLineCount: 1,
        });

        const messageId = uuid();
        await trx.insert(messages).values({
          id: messageId,
          userId,
          role: 'user',
          content: 'Message with document',
          sessionId: 'session1',
        });

        await trx.insert(messagesFiles).values({
          messageId,
          fileId,
          userId,
        });
      });

      // Query messages - this should trigger the documents processing code
      const result = await messageModel.query({ sessionId: 'session1' });

      expect(result).toHaveLength(1);
      expect(result[0].fileList).toBeDefined();
      expect(result[0].fileList).toHaveLength(1);
      expect(result[0].fileList![0].id).toBe(fileId);
      expect(result[0].fileList![0].content).toBe('This is the document content for testing');
    });
  });

  describe('findMessageQueriesById', () => {
    it('should return undefined for non-existent message query', async () => {
      const result = await messageModel.findMessageQueriesById('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should return message query with embeddings', async () => {
      const query1Id = uuid();
      const embeddings1Id = uuid();

      await serverDB.transaction(async (trx) => {
        await trx.insert(messages).values({ id: 'msg1', userId, role: 'user', content: 'abc' });

        await trx.insert(embeddings).values({
          id: embeddings1Id,
          embeddings: codeEmbedding,
        });

        await trx.insert(messageQueries).values({
          id: query1Id,
          messageId: 'msg1',
          userQuery: 'test query',
          rewriteQuery: 'rewritten query',
          embeddingsId: embeddings1Id,
          userId,
        });
      });

      const result = await messageModel.findMessageQueriesById('msg1');

      expect(result).toBeDefined();
      expect(result).toMatchObject({
        id: query1Id,
        userQuery: 'test query',
        rewriteQuery: 'rewritten query',
        embeddings: codeEmbedding,
      });
    });
  });
});
