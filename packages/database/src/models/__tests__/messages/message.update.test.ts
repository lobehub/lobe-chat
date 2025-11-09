import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { uuid } from '@/utils/uuid';

import {
  agents,
  chatGroups,
  chunks,
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

const userId = 'message-update-test';
const otherUserId = 'message-update-test-other';
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

describe('MessageModel Update Tests', () => {
  describe('updateMessage', () => {
    it('should update message content', async () => {
      // Create test data
      await serverDB
        .insert(messages)
        .values([{ id: '1', userId, role: 'user', content: 'message 1' }]);

      // Call updateMessage method
      await messageModel.update('1', { content: 'updated message' });

      // Assert result
      const result = await serverDB.select().from(messages).where(eq(messages.id, '1'));
      expect(result[0].content).toBe('updated message');
    });

    it('should only update messages belonging to the user', async () => {
      // Create test data
      await serverDB
        .insert(messages)
        .values([{ id: '1', userId: otherUserId, role: 'user', content: 'message 1' }]);

      // Call updateMessage method
      await messageModel.update('1', { content: 'updated message' });

      // Assert result
      const result = await serverDB.select().from(messages).where(eq(messages.id, '1'));
      expect(result[0].content).toBe('message 1');
    });

    it('should update message tools', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        {
          id: '1',
          userId,
          role: 'user',
          content: 'message 1',
          tools: [
            {
              id: 'call_Z8UU8LedZcoJHFGkfqYecjmT',
              type: 'builtin',
              apiName: 'searchWithSearXNG',
              arguments:
                '{"query":"杭州洪水 2023","searchEngines":["google","bing","baidu","duckduckgo","brave"]}',
              identifier: 'lobe-web-browsing',
            },
          ],
        },
      ]);

      // Call updateMessage method
      await messageModel.update('1', {
        tools: [
          {
            id: 'call_Z8UU8LedZcoJHFGkfqYecjmT',
            type: 'builtin',
            apiName: 'searchWithSearXNG',
            arguments: '{"query":"2024 杭州暴雨","searchEngines":["duckduckgo","google","brave"]}',
            identifier: 'lobe-web-browsing',
          },
        ],
      });

      // Assert result
      const result = await serverDB.select().from(messages).where(eq(messages.id, '1'));
      expect((result[0].tools as any)[0].arguments).toBe(
        '{"query":"2024 杭州暴雨","searchEngines":["duckduckgo","google","brave"]}',
      );
    });

    describe('update with imageList', () => {
      it('should update a message and add image files', async () => {
        // Create test data
        await serverDB.insert(messages).values({
          id: 'msg-to-update',
          userId,
          role: 'user',
          content: 'original content',
        });

        await serverDB.insert(files).values([
          {
            id: 'img1',
            name: 'image1.jpg',
            fileType: 'image/jpeg',
            size: 100,
            url: 'url1',
            userId,
          },
          { id: 'img2', name: 'image2.png', fileType: 'image/png', size: 200, url: 'url2', userId },
        ]);

        // Call update method
        await messageModel.update('msg-to-update', {
          content: 'updated content',
          imageList: [
            { id: 'img1', alt: 'image 1', url: 'url1' },
            { id: 'img2', alt: 'image 2', url: 'url2' },
          ],
        });

        // Verify message updated successfully
        const updatedMessage = await serverDB
          .select()
          .from(messages)
          .where(eq(messages.id, 'msg-to-update'));

        expect(updatedMessage[0].content).toBe('updated content');

        // Verify message file associations created successfully
        const messageFiles = await serverDB
          .select()
          .from(messagesFiles)
          .where(eq(messagesFiles.messageId, 'msg-to-update'));

        expect(messageFiles).toHaveLength(2);
        expect(messageFiles[0].fileId).toBe('img1');
        expect(messageFiles[1].fileId).toBe('img2');
      });

      it('should handle empty imageList', async () => {
        // Create test data
        await serverDB.insert(messages).values({
          id: 'msg-no-images',
          userId,
          role: 'user',
          content: 'original content',
        });

        // Call update method without providing imageList
        await messageModel.update('msg-no-images', {
          content: 'updated content',
        });

        // Verify message updated successfully
        const updatedMessage = await serverDB
          .select()
          .from(messages)
          .where(eq(messages.id, 'msg-no-images'));

        expect(updatedMessage[0].content).toBe('updated content');

        // Verify no message file associations created
        const messageFiles = await serverDB
          .select()
          .from(messagesFiles)
          .where(eq(messagesFiles.messageId, 'msg-no-images'));

        expect(messageFiles).toHaveLength(0);
      });

      it('should update multiple fields at once', async () => {
        // Create test data
        await serverDB.insert(messages).values({
          id: 'msg-multi-update',
          userId,
          role: 'user',
          content: 'original content',
          model: 'gpt-3.5',
        });

        // Call update method to update multiple fields
        await messageModel.update('msg-multi-update', {
          content: 'updated content',
          role: 'assistant',
          model: 'gpt-4',
          metadata: { tps: 1 },
        });

        // Verify message updated successfully
        const updatedMessage = await serverDB
          .select()
          .from(messages)
          .where(eq(messages.id, 'msg-multi-update'));

        expect(updatedMessage[0].content).toBe('updated content');
        expect(updatedMessage[0].role).toBe('assistant');
        expect(updatedMessage[0].model).toBe('gpt-4');
        expect(updatedMessage[0].metadata).toEqual({ tps: 1 });
      });
    });
  });

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

  describe('deleteAllMessages', () => {
    it('should delete all messages belonging to the user', async () => {
      // Create test data
      await serverDB.insert(messages).values([
        { id: '1', userId, role: 'user', content: 'message 1' },
        { id: '2', userId, role: 'user', content: 'message 2' },
        { id: '3', userId: otherUserId, role: 'user', content: 'message 3' },
      ]);

      // 调用 deleteAllMessages 方法
      await messageModel.deleteAllMessages();

      // Assert result
      const result = await serverDB.select().from(messages).where(eq(messages.userId, userId));

      expect(result).toHaveLength(0);

      const otherResult = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.userId, otherUserId));

      expect(otherResult).toHaveLength(1);
    });

    it('should handle database errors gracefully', async () => {
      // Create test message
      await serverDB.insert(messages).values({
        id: '1',
        content: 'test message',
        role: 'user',
        userId,
      });

      // Mock database to throw error by trying to update with invalid sessionId reference
      // This should trigger the catch block in the update method
      const result = await messageModel.update('1', {
        // @ts-expect-error - intentionally passing invalid sessionId to trigger error
        sessionId: 'non-existent-session-that-violates-fk',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('updatePluginState', () => {
    it('should update the state field in messagePlugins table', async () => {
      // Create test data
      await serverDB.insert(messages).values({ id: '1', content: 'abc', role: 'user', userId });
      await serverDB.insert(messagePlugins).values([
        {
          id: '1',
          toolCallId: 'tool1',
          identifier: 'plugin1',
          state: { key1: 'value1' },
          userId,
        },
      ]);

      // 调用 updatePluginState 方法
      await messageModel.updatePluginState('1', { key2: 'value2' });

      // Assert result
      const result = await serverDB.select().from(messagePlugins).where(eq(messagePlugins.id, '1'));

      expect(result[0].state).toEqual({ key1: 'value1', key2: 'value2' });
    });

    it('should handle null state in plugin', async () => {
      // Create test data with null state
      await serverDB.insert(messages).values({ id: '1', content: 'abc', role: 'user', userId });
      await serverDB.insert(messagePlugins).values([
        {
          id: '1',
          toolCallId: 'tool1',
          identifier: 'plugin1',
          state: null,
          userId,
        },
      ]);

      // Call updatePluginState method
      await messageModel.updatePluginState('1', { key1: 'value1' });

      // Assert result - should merge with empty object when state is null
      const result = await serverDB.select().from(messagePlugins).where(eq(messagePlugins.id, '1'));

      expect(result[0].state).toEqual({ key1: 'value1' });
    });

    it('should throw an error if plugin does not exist', async () => {
      // 调用 updatePluginState 方法
      await expect(messageModel.updatePluginState('1', { key: 'value' })).rejects.toThrowError(
        'Plugin not found',
      );
    });
  });
  describe('updateMessagePlugin', () => {
    it('should update the state field in messagePlugins table', async () => {
      // Create test data
      await serverDB.insert(messages).values({ id: '1', content: 'abc', role: 'user', userId });
      await serverDB.insert(messagePlugins).values([
        {
          id: '1',
          toolCallId: 'tool1',
          identifier: 'plugin1',
          state: { key1: 'value1' },
          userId,
        },
      ]);

      // 调用 updatePluginState 方法
      await messageModel.updateMessagePlugin('1', { identifier: 'plugin2' });

      // Assert result
      const result = await serverDB.select().from(messagePlugins).where(eq(messagePlugins.id, '1'));

      expect(result[0].identifier).toEqual('plugin2');
    });

    it('should throw an error if plugin does not exist', async () => {
      // 调用 updateMessagePlugin 方法（修复：之前错误地调用了 updatePluginState）
      await expect(
        messageModel.updateMessagePlugin('non-existent-id', { identifier: 'test' }),
      ).rejects.toThrowError('Plugin not found');
    });
  });

  describe('updateMetadata', () => {
    it('should update metadata for an existing message', async () => {
      // Create test data
      await serverDB.insert(messages).values({
        id: 'msg-with-metadata',
        userId,
        role: 'user',
        content: 'test message',
        metadata: { existingKey: 'existingValue' },
      });

      // 调用 updateMetadata 方法
      await messageModel.updateMetadata('msg-with-metadata', { newKey: 'newValue' });

      // Assert result
      const result = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.id, 'msg-with-metadata'));

      expect(result[0].metadata).toEqual({
        existingKey: 'existingValue',
        newKey: 'newValue',
      });
    });

    it('should merge new metadata with existing metadata using lodash merge behavior', async () => {
      // Create test data
      await serverDB.insert(messages).values({
        id: 'msg-merge-metadata',
        userId,
        role: 'assistant',
        content: 'test message',
        metadata: {
          level1: {
            level2a: 'original',
            level2b: { level3: 'deep' },
          },
          array: [1, 2, 3],
        },
      });

      // 调用 updateMetadata 方法
      await messageModel.updateMetadata('msg-merge-metadata', {
        level1: {
          level2a: 'updated',
          level2c: 'new',
        },
        newTopLevel: 'value',
      });

      // Assert result - 应该使用 lodash merge 行为
      const result = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.id, 'msg-merge-metadata'));

      expect(result[0].metadata).toEqual({
        level1: {
          level2a: 'updated',
          level2b: { level3: 'deep' },
          level2c: 'new',
        },
        array: [1, 2, 3],
        newTopLevel: 'value',
      });
    });

    it('should handle non-existent message IDs', async () => {
      // 调用 updateMetadata 方法，尝试更新不存在的消息
      const result = await messageModel.updateMetadata('non-existent-id', { key: 'value' });

      // Assert result - 应该返回 undefined
      expect(result).toBeUndefined();
    });

    it('should handle empty metadata updates', async () => {
      // Create test data
      await serverDB.insert(messages).values({
        id: 'msg-empty-metadata',
        userId,
        role: 'user',
        content: 'test message',
        metadata: { originalKey: 'originalValue' },
      });

      // 调用 updateMetadata 方法，传递空对象
      await messageModel.updateMetadata('msg-empty-metadata', {});

      // Assert result - 原始 metadata 应该保持不变
      const result = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.id, 'msg-empty-metadata'));

      expect(result[0].metadata).toEqual({ originalKey: 'originalValue' });
    });

    it('should handle message with null metadata', async () => {
      // Create test data
      await serverDB.insert(messages).values({
        id: 'msg-null-metadata',
        userId,
        role: 'user',
        content: 'test message',
        metadata: null,
      });

      // 调用 updateMetadata 方法
      await messageModel.updateMetadata('msg-null-metadata', { key: 'value' });

      // Assert result - 应该创建新的 metadata
      const result = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.id, 'msg-null-metadata'));

      expect(result[0].metadata).toEqual({ key: 'value' });
    });

    it('should only update messages belonging to the current user', async () => {
      // Create test data - 其他用户的消息
      await serverDB.insert(messages).values({
        id: 'msg-other-user',
        userId: otherUserId,
        role: 'user',
        content: 'test message',
        metadata: { originalKey: 'originalValue' },
      });

      // 调用 updateMetadata 方法
      const result = await messageModel.updateMetadata('msg-other-user', {
        hackedKey: 'hackedValue',
      });

      // Assert result - 应该返回 undefined
      expect(result).toBeUndefined();

      // 验证原始 metadata 未被修改
      const dbResult = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.id, 'msg-other-user'));

      expect(dbResult[0].metadata).toEqual({ originalKey: 'originalValue' });
    });

    it('should handle complex nested metadata updates', async () => {
      // Create test data
      await serverDB.insert(messages).values({
        id: 'msg-complex-metadata',
        userId,
        role: 'assistant',
        content: 'test message',
        metadata: {
          config: {
            settings: {
              enabled: true,
              options: ['a', 'b'],
            },
            version: 1,
          },
        },
      });

      // 调用 updateMetadata 方法
      await messageModel.updateMetadata('msg-complex-metadata', {
        config: {
          settings: {
            enabled: false,
            timeout: 5000,
          },
          newField: 'value',
        },
        stats: { count: 10 },
      });

      // Assert result
      const result = await serverDB
        .select()
        .from(messages)
        .where(eq(messages.id, 'msg-complex-metadata'));

      expect(result[0].metadata).toEqual({
        config: {
          settings: {
            enabled: false,
            options: ['a', 'b'],
            timeout: 5000,
          },
          version: 1,
          newField: 'value',
        },
        stats: { count: 10 },
      });
    });
  });

  describe('updateTranslate', () => {
    it('should insert a new record if message does not exist in messageTranslates table', async () => {
      // Create test data
      await serverDB
        .insert(messages)
        .values([{ id: '1', userId, role: 'user', content: 'message 1' }]);

      // 调用 updateTranslate 方法
      await messageModel.updateTranslate('1', {
        content: 'translated message 1',
        from: 'en',
        to: 'zh',
      });

      // Assert result
      const result = await serverDB
        .select()
        .from(messageTranslates)
        .where(eq(messageTranslates.id, '1'));

      expect(result).toHaveLength(1);
      expect(result[0].content).toBe('translated message 1');
    });

    it('should update the corresponding fields if message exists in messageTranslates table', async () => {
      // Create test data
      await serverDB.transaction(async (trx) => {
        await trx
          .insert(messages)
          .values([{ id: '1', userId, role: 'user', content: 'message 1' }]);
        await trx
          .insert(messageTranslates)
          .values([{ id: '1', content: 'translated message 1', from: 'en', to: 'zh', userId }]);
      });

      // 调用 updateTranslate 方法
      await messageModel.updateTranslate('1', { content: 'updated translated message 1' });

      // Assert result
      const result = await serverDB
        .select()
        .from(messageTranslates)
        .where(eq(messageTranslates.id, '1'));

      expect(result[0].content).toBe('updated translated message 1');
    });
  });

  describe('updateTTS', () => {
    it('should insert a new record if message does not exist in messageTTS table', async () => {
      // Create test data
      await serverDB
        .insert(messages)
        .values([{ id: '1', userId, role: 'user', content: 'message 1' }]);

      // 调用 updateTTS 方法
      await messageModel.updateTTS('1', { contentMd5: 'md5', file: 'f1', voice: 'voice1' });

      // Assert result
      const result = await serverDB.select().from(messageTTS).where(eq(messageTTS.id, '1'));

      expect(result).toHaveLength(1);
      expect(result[0].voice).toBe('voice1');
    });

    it('should update the corresponding fields if message exists in messageTTS table', async () => {
      // Create test data
      await serverDB.transaction(async (trx) => {
        await trx
          .insert(messages)
          .values([{ id: '1', userId, role: 'user', content: 'message 1' }]);
        await trx
          .insert(messageTTS)
          .values([{ id: '1', contentMd5: 'md5', fileId: 'f1', voice: 'voice1', userId }]);
      });

      // 调用 updateTTS 方法
      await messageModel.updateTTS('1', { voice: 'updated voice1' });

      // Assert result
      const result = await serverDB.select().from(messageTTS).where(eq(messageTTS.id, '1'));

      expect(result[0].voice).toBe('updated voice1');
    });
  });
});
