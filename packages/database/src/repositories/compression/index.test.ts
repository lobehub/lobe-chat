// @vitest-environment node
import { MessageGroupType } from '@lobechat/types';
import { beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../models/__tests__/_util';
import { messageGroups, messages } from '../../schemas/message';
import { topics } from '../../schemas/topic';
import { users } from '../../schemas/user';
import { LobeChatDatabase } from '../../type';
import { CompressionRepository } from './index';

const userId = 'compression-test-user';
const topicId = 'test-topic-1';

let compressionRepo: CompressionRepository;

const serverDB: LobeChatDatabase = await getTestDB();

beforeEach(async () => {
  // Clean up
  await serverDB.delete(messageGroups);
  await serverDB.delete(messages);
  await serverDB.delete(topics);
  await serverDB.delete(users);

  // Create test user
  await serverDB.insert(users).values({ id: userId });

  // Create test topic
  await serverDB.insert(topics).values({ id: topicId, userId });

  // Initialize repo
  compressionRepo = new CompressionRepository(serverDB, userId);
});

describe('CompressionRepository', () => {
  describe('createCompressionGroup', () => {
    it('should create a compression group', async () => {
      const metadata = {
        compressedAt: new Date().toISOString(),
        compressionStrategy: 'summarize' as const,
        originalMessageCount: 10,
        originalTokenCount: 5000,
      };
      const groupId = await compressionRepo.createCompressionGroup({
        content: 'This is a summary of the conversation.',
        messageIds: [],
        metadata,
        topicId,
      });

      expect(groupId).toBeDefined();

      // Verify the group was created
      const groups = await compressionRepo.getCompressionGroups(topicId);
      expect(groups).toHaveLength(1);
      expect(groups[0].content).toBe('This is a summary of the conversation.');
      expect(groups[0].type).toBe(MessageGroupType.Compression);
      expect(groups[0].metadata).toEqual(metadata);
    });

    it('should create compression group and mark messages as compressed', async () => {
      // Create test messages
      await serverDB.insert(messages).values([
        { id: 'msg-1', content: 'Hello', role: 'user', topicId, userId },
        { id: 'msg-2', content: 'Hi there!', role: 'assistant', topicId, userId },
        { id: 'msg-3', content: 'How are you?', role: 'user', topicId, userId },
      ]);

      const groupId = await compressionRepo.createCompressionGroup({
        content: 'User greeted and asked how assistant is doing.',
        messageIds: ['msg-1', 'msg-2', 'msg-3'],
        metadata: {
          endMessageId: 'msg-3',
          originalMessageCount: 3,
          startMessageId: 'msg-1',
        },
        topicId,
      });

      // Verify messages are marked as compressed
      const compressedMessages = await compressionRepo.getCompressedMessages(groupId);
      expect(compressedMessages).toHaveLength(3);
    });
  });

  describe('getCompressionGroups', () => {
    it('should return all compression groups for a topic ordered by createdAt', async () => {
      // Create multiple compression groups
      await compressionRepo.createCompressionGroup({
        content: 'First summary',
        messageIds: [],
        metadata: { originalMessageCount: 5 },
        topicId,
      });

      await compressionRepo.createCompressionGroup({
        content: 'Second summary',
        messageIds: [],
        metadata: { originalMessageCount: 10 },
        topicId,
      });

      const groups = await compressionRepo.getCompressionGroups(topicId);
      expect(groups).toHaveLength(2);
      expect(groups[0].content).toBe('First summary');
      expect(groups[1].content).toBe('Second summary');
    });

    it('should not return groups from other topics', async () => {
      const otherTopicId = 'other-topic';
      await serverDB.insert(topics).values({ id: otherTopicId, userId });

      await compressionRepo.createCompressionGroup({
        content: 'Summary for topic 1',
        messageIds: [],
        metadata: {},
        topicId,
      });

      await compressionRepo.createCompressionGroup({
        content: 'Summary for other topic',
        messageIds: [],
        metadata: {},
        topicId: otherTopicId,
      });

      const groups = await compressionRepo.getCompressionGroups(topicId);
      expect(groups).toHaveLength(1);
      expect(groups[0].content).toBe('Summary for topic 1');
    });
  });

  describe('getLatestCompressionGroup', () => {
    it('should return the latest compression group', async () => {
      await compressionRepo.createCompressionGroup({
        content: 'Old summary',
        messageIds: [],
        metadata: {},
        topicId,
      });

      await compressionRepo.createCompressionGroup({
        content: 'Latest summary',
        messageIds: [],
        metadata: {},
        topicId,
      });

      const latest = await compressionRepo.getLatestCompressionGroup(topicId);
      expect(latest).not.toBeNull();
      expect(latest!.content).toBe('Latest summary');
    });

    it('should return null if no compression groups exist', async () => {
      const latest = await compressionRepo.getLatestCompressionGroup(topicId);
      expect(latest).toBeNull();
    });
  });

  describe('updateCompressionContent', () => {
    it('should update compression group content', async () => {
      const groupId = await compressionRepo.createCompressionGroup({
        content: 'Original summary',
        messageIds: [],
        metadata: { originalTokenCount: 1000 },
        topicId,
      });

      await compressionRepo.updateCompressionContent(groupId, 'Updated summary', {
        compressedTokenCount: 100,
      });

      const groups = await compressionRepo.getCompressionGroups(topicId);
      expect(groups[0].content).toBe('Updated summary');
    });
  });

  describe('toggleMessagePin', () => {
    it('should pin a message', async () => {
      await serverDB.insert(messages).values({
        content: 'Important message',
        id: 'msg-pin-test',
        role: 'user',
        topicId,
        userId,
      });

      await compressionRepo.toggleMessagePin('msg-pin-test', true);

      const [message] = await serverDB
        .select()
        .from(messages)
        .where(
          (() => {
            const { eq, and } = require('drizzle-orm');
            return and(eq(messages.id, 'msg-pin-test'), eq(messages.userId, userId));
          })(),
        );

      expect((message.metadata as any)?.pinned).toBe(true);
    });

    it('should unpin a message', async () => {
      await serverDB.insert(messages).values({
        content: 'Pinned message',
        id: 'msg-unpin-test',
        metadata: { pinned: true },
        role: 'user',
        topicId,
        userId,
      });

      await compressionRepo.toggleMessagePin('msg-unpin-test', false);

      const [message] = await serverDB
        .select()
        .from(messages)
        .where(
          (() => {
            const { eq, and } = require('drizzle-orm');
            return and(eq(messages.id, 'msg-unpin-test'), eq(messages.userId, userId));
          })(),
        );

      expect((message.metadata as any)?.pinned).toBe(false);
    });
  });

  describe('getUncompressedMessages', () => {
    it('should return only uncompressed messages', async () => {
      // Create messages
      await serverDB.insert(messages).values([
        { id: 'msg-uncomp-1', content: 'Uncompressed 1', role: 'user', topicId, userId },
        { id: 'msg-uncomp-2', content: 'Uncompressed 2', role: 'assistant', topicId, userId },
        { id: 'msg-comp-1', content: 'To be compressed', role: 'user', topicId, userId },
      ]);

      // Compress one message
      await compressionRepo.createCompressionGroup({
        content: 'Summary',
        messageIds: ['msg-comp-1'],
        metadata: {},
        topicId,
      });

      const uncompressed = await compressionRepo.getUncompressedMessages(topicId);
      expect(uncompressed).toHaveLength(2);
      expect(uncompressed.map((m) => m.id)).toEqual(
        expect.arrayContaining(['msg-uncomp-1', 'msg-uncomp-2']),
      );
    });
  });

  describe('deleteCompressionGroup', () => {
    it('should delete compression group and unmark messages', async () => {
      await serverDB.insert(messages).values([
        { id: 'msg-delete-1', content: 'Message 1', role: 'user', topicId, userId },
        { id: 'msg-delete-2', content: 'Message 2', role: 'assistant', topicId, userId },
      ]);

      const groupId = await compressionRepo.createCompressionGroup({
        content: 'To be deleted',
        messageIds: ['msg-delete-1', 'msg-delete-2'],
        metadata: {},
        topicId,
      });

      // Verify messages are compressed
      let compressedMessages = await compressionRepo.getCompressedMessages(groupId);
      expect(compressedMessages).toHaveLength(2);

      // Delete the group
      await compressionRepo.deleteCompressionGroup(groupId);

      // Verify group is deleted
      const groups = await compressionRepo.getCompressionGroups(topicId);
      expect(groups).toHaveLength(0);

      // Verify messages are uncompressed
      const uncompressed = await compressionRepo.getUncompressedMessages(topicId);
      expect(uncompressed).toHaveLength(2);
    });
  });

  describe('unmarkMessagesFromCompression', () => {
    it('should remove messages from compression group', async () => {
      await serverDB.insert(messages).values([
        { id: 'msg-unmark-1', content: 'Message 1', role: 'user', topicId, userId },
        { id: 'msg-unmark-2', content: 'Message 2', role: 'assistant', topicId, userId },
      ]);

      const groupId = await compressionRepo.createCompressionGroup({
        content: 'Summary',
        messageIds: ['msg-unmark-1', 'msg-unmark-2'],
        metadata: {},
        topicId,
      });

      // Unmark one message
      await compressionRepo.unmarkMessagesFromCompression(['msg-unmark-1']);

      const compressedMessages = await compressionRepo.getCompressedMessages(groupId);
      expect(compressedMessages).toHaveLength(1);
      expect(compressedMessages[0].id).toBe('msg-unmark-2');
    });
  });
});
