import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../models/__tests__/_util';
import { files, messagePlugins, messages, messagesFiles, sessions, users } from '../../schemas';
import { LobeChatDatabase } from '../../type';
import { MessageModel } from '../message';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'message-grouping-test';
const messageModel = new MessageModel(serverDB, userId);

beforeEach(async () => {
  // Clear tables before each test
  await serverDB.transaction(async (trx) => {
    await trx.delete(users);
    await trx.insert(users).values([{ id: userId }, { id: '456' }]);
    await trx.insert(sessions).values([{ id: '1', userId }]);
    await trx.insert(files).values({
      id: 'f1',
      userId: userId,
      name: 'test.png',
      fileType: 'image/png',
      size: 100,
      url: 'url1',
    });
  });
});

afterEach(async () => {
  // Clean up after each test
  await serverDB.delete(messages);
  await serverDB.delete(messagePlugins);
  await serverDB.delete(messagesFiles);
});

describe('MessageModel - Message Grouping', () => {
  describe('Basic Grouping Scenarios', () => {
    it('should group assistant message with single tool result', async () => {
      // Create assistant message with tool
      await serverDB.insert(messages).values({
        id: 'msg-1',
        userId,
        role: 'assistant',
        content: 'Checking weather',
        tools: [
          {
            id: 'tool-1',
            identifier: 'weather',
            apiName: 'getWeather',
            arguments: '{"city":"Beijing"}',
            type: 'default',
          },
        ],
      });

      // Create tool message
      await serverDB.insert(messages).values({
        id: 'msg-2',
        userId,
        role: 'tool',
        content: 'Beijing: Sunny, 25°C',
      });

      await serverDB.insert(messagePlugins).values({
        id: 'msg-2',
        userId,
        toolCallId: 'tool-1',
        identifier: 'weather',
        state: { cached: true },
      });

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify grouping
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('group');
      expect(result[0].content).toBe('');
      expect(result[0].children).toHaveLength(1);

      const block = result[0].children![0];
      expect(block.content).toBe('Checking weather');
      expect(block.tools).toHaveLength(1);
      expect(block.tools![0]).toMatchObject({
        id: 'tool-1',
        identifier: 'weather',
        apiName: 'getWeather',
      });
      expect(block.tools![0].result).toMatchObject({
        content: 'Beijing: Sunny, 25°C',
        state: { cached: true },
      });
    });

    it('should group assistant message with multiple tool results', async () => {
      // Create assistant message with multiple tools
      await serverDB.insert(messages).values({
        id: 'msg-1',
        userId,
        role: 'assistant',
        content: 'Checking weather and news',
        tools: [
          {
            id: 'tool-1',
            identifier: 'weather',
            apiName: 'getWeather',
            arguments: '{}',
            type: 'default',
          },
          {
            id: 'tool-2',
            identifier: 'news',
            apiName: 'getNews',
            arguments: '{}',
            type: 'default',
          },
        ],
      });

      // Create tool messages
      await serverDB.insert(messages).values([
        {
          id: 'msg-2',
          userId,
          role: 'tool',
          content: 'Beijing: Sunny, 25°C',
        },
        {
          id: 'msg-3',
          userId,
          role: 'tool',
          content: 'Latest tech news: AI breakthrough',
        },
      ]);

      await serverDB.insert(messagePlugins).values([
        {
          id: 'msg-2',
          userId,
          toolCallId: 'tool-1',
          identifier: 'weather',
        },
        {
          id: 'msg-3',
          userId,
          toolCallId: 'tool-2',
          identifier: 'news',
        },
      ]);

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify grouping
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('group');
      expect(result[0].children).toHaveLength(1);

      const block = result[0].children![0];
      expect(block.tools).toHaveLength(2);
      expect(block.tools![0].result?.content).toBe('Beijing: Sunny, 25°C');
      expect(block.tools![1].result?.content).toBe('Latest tech news: AI breakthrough');
    });

    it('should not group assistant message without tools', async () => {
      // Create assistant message without tools
      await serverDB.insert(messages).values({
        id: 'msg-1',
        userId,
        role: 'assistant',
        content: 'Hello!',
      });

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify no grouping
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('assistant');
      expect(result[0].content).toBe('Hello!');
      expect(result[0].children).toBeUndefined();
    });

    it('should handle assistant message with tool but no result yet', async () => {
      // Create assistant message with tool
      await serverDB.insert(messages).values({
        id: 'msg-1',
        userId,
        role: 'assistant',
        content: 'Checking weather',
        tools: [
          {
            id: 'tool-1',
            identifier: 'weather',
            apiName: 'getWeather',
            arguments: '{}',
            type: 'default',
          },
        ],
      });

      // No tool message created yet

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify grouping without result
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('group');
      expect(result[0].children).toHaveLength(1);

      const block = result[0].children![0];
      expect(block.tools).toHaveLength(1);
      expect(block.tools![0].result).toBeUndefined();
    });
  });

  describe('Multi-turn Conversation Grouping', () => {
    it('should group assistant with follow-up assistant (parentId→tool)', async () => {
      // Scenario: assistant → tool → assistant (parentId → tool)
      await serverDB.insert(messages).values([
        {
          id: 'msg-1',
          userId,
          role: 'assistant',
          content: 'Let me check the weather',
          createdAt: new Date('2023-01-01T10:00:00Z'),
          tools: [
            {
              id: 'tool-1',
              identifier: 'weather',
              apiName: 'getWeather',
              arguments: '{}',
              type: 'default',
            },
          ],
        },
        {
          id: 'msg-2',
          userId,
          role: 'tool',
          content: 'Sunny, 25°C',
          createdAt: new Date('2023-01-01T10:00:01Z'),
        },
        {
          id: 'msg-3',
          userId,
          role: 'assistant',
          content: 'Based on the weather, let me check the news',
          parentId: 'msg-2',
          createdAt: new Date('2023-01-01T10:00:02Z'),
          tools: [
            {
              id: 'tool-2',
              identifier: 'news',
              apiName: 'getNews',
              arguments: '{}',
              type: 'default',
            },
          ],
        },
        {
          id: 'msg-4',
          userId,
          role: 'tool',
          content: 'Breaking: AI news',
          createdAt: new Date('2023-01-01T10:00:03Z'),
        },
      ]);

      await serverDB.insert(messagePlugins).values([
        {
          id: 'msg-2',
          userId,
          toolCallId: 'tool-1',
          identifier: 'weather',
        },
        {
          id: 'msg-4',
          userId,
          toolCallId: 'tool-2',
          identifier: 'news',
        },
      ]);

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Should have 1 group with 2 children
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('group');
      expect(result[0].children).toHaveLength(2);

      // First child: original assistant with tool result
      expect(result[0].children![0].id).toBe('msg-1');
      expect(result[0].children![0].content).toBe('Let me check the weather');
      expect(result[0].children![0].tools).toHaveLength(1);
      expect(result[0].children![0].tools![0].result?.content).toBe('Sunny, 25°C');

      // Second child: follow-up assistant with its own tool result
      expect(result[0].children![1].id).toBe('msg-3');
      expect(result[0].children![1].content).toBe('Based on the weather, let me check the news');
      expect(result[0].children![1].tools).toHaveLength(1);
      expect(result[0].children![1].tools![0].result?.content).toBe('Breaking: AI news');
    });

    it('should group multiple follow-up assistants in chain (3+ assistants)', async () => {
      // Scenario: assistant → tool → assistant → tool → assistant (chain of parentId→tool)
      await serverDB.insert(messages).values([
        {
          id: 'msg-1',
          userId,
          role: 'assistant',
          content: 'Step 1: Check weather',
          createdAt: new Date('2023-01-01T10:00:00Z'),
          tools: [
            {
              id: 'tool-1',
              identifier: 'weather',
              apiName: 'getWeather',
              arguments: '{}',
              type: 'default',
            },
          ],
        },
        {
          id: 'msg-2',
          userId,
          role: 'tool',
          content: 'Sunny, 25°C',
          createdAt: new Date('2023-01-01T10:00:01Z'),
        },
        {
          id: 'msg-3',
          userId,
          role: 'assistant',
          content: 'Step 2: Based on weather, check news',
          parentId: 'msg-2',
          createdAt: new Date('2023-01-01T10:00:02Z'),
          tools: [
            {
              id: 'tool-2',
              identifier: 'news',
              apiName: 'getNews',
              arguments: '{}',
              type: 'default',
            },
          ],
        },
        {
          id: 'msg-4',
          userId,
          role: 'tool',
          content: 'Breaking: AI news',
          createdAt: new Date('2023-01-01T10:00:03Z'),
        },
        {
          id: 'msg-5',
          userId,
          role: 'assistant',
          content: 'Step 3: Final summary based on weather and news',
          parentId: 'msg-4',
          createdAt: new Date('2023-01-01T10:00:04Z'),
        },
      ]);

      await serverDB.insert(messagePlugins).values([
        {
          id: 'msg-2',
          userId,
          toolCallId: 'tool-1',
          identifier: 'weather',
        },
        {
          id: 'msg-4',
          userId,
          toolCallId: 'tool-2',
          identifier: 'news',
        },
      ]);

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Should have 1 group with 3 children
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('group');
      expect(result[0].children).toHaveLength(3);

      // First child: original assistant with tool result
      expect(result[0].children![0].id).toBe('msg-1');
      expect(result[0].children![0].content).toBe('Step 1: Check weather');
      expect(result[0].children![0].tools![0].result?.content).toBe('Sunny, 25°C');

      // Second child: follow-up assistant with its own tool result
      expect(result[0].children![1].id).toBe('msg-3');
      expect(result[0].children![1].content).toBe('Step 2: Based on weather, check news');
      expect(result[0].children![1].tools![0].result?.content).toBe('Breaking: AI news');

      // Third child: final assistant (parentId pointed to second tool)
      expect(result[0].children![2].id).toBe('msg-5');
      expect(result[0].children![2].content).toBe(
        'Step 3: Final summary based on weather and news',
      );
    });

    it('should group messages in multi-turn conversation', async () => {
      // Create multi-turn conversation
      await serverDB.insert(messages).values([
        {
          id: 'msg-1',
          userId,
          role: 'user',
          content: 'What is the weather?',
          createdAt: new Date('2023-01-01T10:00:00Z'),
        },
        {
          id: 'msg-2',
          userId,
          role: 'assistant',
          content: 'Checking weather',
          createdAt: new Date('2023-01-01T10:00:01Z'),
          tools: [
            {
              id: 'tool-1',
              identifier: 'weather',
              apiName: 'getWeather',
              arguments: '{}',
              type: 'default',
            },
          ],
        },
        {
          id: 'msg-3',
          userId,
          role: 'tool',
          content: 'Sunny, 25°C',
          createdAt: new Date('2023-01-01T10:00:02Z'),
        },
        {
          id: 'msg-4',
          userId,
          role: 'user',
          content: 'What about news?',
          createdAt: new Date('2023-01-01T10:00:03Z'),
        },
        {
          id: 'msg-5',
          userId,
          role: 'assistant',
          content: 'Checking news',
          createdAt: new Date('2023-01-01T10:00:04Z'),
          tools: [
            {
              id: 'tool-2',
              identifier: 'news',
              apiName: 'getNews',
              arguments: '{}',
              type: 'default',
            },
          ],
        },
        {
          id: 'msg-6',
          userId,
          role: 'tool',
          content: 'AI breakthrough',
          createdAt: new Date('2023-01-01T10:00:05Z'),
        },
      ]);

      await serverDB.insert(messagePlugins).values([
        {
          id: 'msg-3',
          userId,
          toolCallId: 'tool-1',
          identifier: 'weather',
        },
        {
          id: 'msg-6',
          userId,
          toolCallId: 'tool-2',
          identifier: 'news',
        },
      ]);

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify grouping
      expect(result).toHaveLength(4); // 2 users + 2 grouped assistants
      expect(result[0].role).toBe('user');
      expect(result[1].role).toBe('group');
      expect(result[2].role).toBe('user');
      expect(result[3].role).toBe('group');
    });

    it('should handle mixed grouped and non-grouped messages', async () => {
      // Create mixed messages
      await serverDB.insert(messages).values([
        {
          id: 'msg-1',
          userId,
          role: 'assistant',
          content: 'Hello!',
          createdAt: new Date('2023-01-01T10:00:00Z'),
        },
        {
          id: 'msg-2',
          userId,
          role: 'assistant',
          content: 'Using tools',
          createdAt: new Date('2023-01-01T10:00:01Z'),
          tools: [
            {
              id: 'tool-1',
              identifier: 'test',
              apiName: 'test',
              arguments: '{}',
              type: 'default',
            },
          ],
        },
        {
          id: 'msg-3',
          userId,
          role: 'tool',
          content: 'Result',
          createdAt: new Date('2023-01-01T10:00:02Z'),
        },
      ]);

      await serverDB.insert(messagePlugins).values({
        id: 'msg-3',
        userId,
        toolCallId: 'tool-1',
        identifier: 'test',
      });

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify grouping
      expect(result).toHaveLength(2);
      expect(result[0].role).toBe('assistant');
      expect(result[0].children).toBeUndefined();
      expect(result[1].role).toBe('group');
      expect(result[1].children).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle tool messages with errors', async () => {
      // Create assistant with tool
      await serverDB.insert(messages).values({
        id: 'msg-1',
        userId,
        role: 'assistant',
        content: 'Checking',
        tools: [
          {
            id: 'tool-1',
            identifier: 'test',
            apiName: 'test',
            arguments: '{}',
            type: 'default',
          },
        ],
      });

      // Create tool message with error
      await serverDB.insert(messages).values({
        id: 'msg-2',
        userId,
        role: 'tool',
        content: '',
      });

      await serverDB.insert(messagePlugins).values({
        id: 'msg-2',
        userId,
        toolCallId: 'tool-1',
        identifier: 'test',
        error: { message: 'Failed to execute' },
      });

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify error is preserved
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('group');
      expect(result[0].children![0].tools![0].result?.error).toEqual({
        message: 'Failed to execute',
      });
    });

    it('should preserve message order', async () => {
      // Create messages in specific order
      await serverDB.insert(messages).values([
        {
          id: 'msg-1',
          userId,
          role: 'user',
          content: 'First',
          createdAt: new Date('2023-01-01T10:00:00Z'),
        },
        {
          id: 'msg-2',
          userId,
          role: 'assistant',
          content: 'Second',
          createdAt: new Date('2023-01-01T10:00:01Z'),
        },
        {
          id: 'msg-3',
          userId,
          role: 'user',
          content: 'Third',
          createdAt: new Date('2023-01-01T10:00:02Z'),
        },
      ]);

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify order
      expect(result).toHaveLength(3);
      expect(result[0].content).toBe('First');
      expect(result[1].content).toBe('Second');
      expect(result[2].content).toBe('Third');
    });

    it('should handle orphaned tool messages', async () => {
      // Create orphaned tool message
      await serverDB.insert(messages).values({
        id: 'msg-1',
        userId,
        role: 'tool',
        content: 'Orphaned result',
      });

      await serverDB.insert(messagePlugins).values({
        id: 'msg-1',
        userId,
        toolCallId: 'unknown-tool',
        identifier: 'test',
      });

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify orphaned tool is not filtered
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('tool');
    });
  });

  describe('Children Structure Validation', () => {
    it('should use message ID as block ID', async () => {
      // Create assistant with tool
      await serverDB.insert(messages).values({
        id: 'msg-1',
        userId,
        role: 'assistant',
        content: 'Test',
        tools: [
          {
            id: 'tool-1',
            identifier: 'test',
            apiName: 'test',
            arguments: '{}',
            type: 'default',
          },
        ],
      });

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify block ID uses message ID
      expect(result[0].children![0].id).toBe('msg-1');
    });

    it('should convert empty imageList/fileList to undefined in children', async () => {
      // Create assistant with tools but empty imageList/fileList
      await serverDB.insert(messages).values({
        id: 'msg-1',
        userId,
        role: 'assistant',
        content: 'Test',
        tools: [
          {
            id: 'tool-1',
            identifier: 'test',
            apiName: 'test',
            arguments: '{}',
            type: 'default',
          },
        ],
      });

      // Query messages (no files attached, so imageList/fileList will be empty)
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify empty arrays become undefined
      expect(result[0].children![0].imageList).toBeUndefined();
    });

    it('should move tools/imageList/fileList to children', async () => {
      // Create files
      await serverDB.insert(files).values([
        {
          id: 'img-1',
          userId,
          name: 'test.png',
          fileType: 'image/png',
          size: 1024,
          url: 'http://example.com/img.png',
        },
        {
          id: 'file-1',
          userId,
          name: 'test.pdf',
          fileType: 'application/pdf',
          size: 2048,
          url: 'http://example.com/file.pdf',
        },
      ]);

      // Create assistant with tools and files
      await serverDB.insert(messages).values({
        id: 'msg-1',
        userId,
        role: 'assistant',
        content: 'Test',
        tools: [
          {
            id: 'tool-1',
            identifier: 'test',
            apiName: 'test',
            arguments: '{}',
            type: 'default',
          },
        ],
      });

      await serverDB.insert(messagesFiles).values([
        { messageId: 'msg-1', fileId: 'img-1', userId },
        { messageId: 'msg-1', fileId: 'file-1', userId },
      ]);

      // Query messages
      const result = await messageModel.query(
        { sessionId: null },
        { groupAssistantMessages: true },
      );

      // Verify parent fields are cleared
      expect(result[0].tools).toBeUndefined();
      expect(result[0].imageList).toBeUndefined();
      expect(result[0].fileList).toBeUndefined();
      expect(result[0].content).toBe('');

      // Verify children have the data
      const block = result[0].children![0];
      expect(block.content).toBe('Test');
      expect(block.tools).toHaveLength(1);
      expect(block.imageList).toHaveLength(1);
    });
  });
});
