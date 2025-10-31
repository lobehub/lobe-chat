import { UIChatMessage } from '@lobechat/types';
import { LobeAgentChatConfig } from '@lobechat/types';
import { OpenAIChatMessage } from '@lobechat/types';
import { describe, expect, it, vi } from 'vitest';

import { encodeAsync } from '@/utils/tokenizer';
import * as tokenizerObj from '@/utils/tokenizer';

import { chatHelpers } from './helpers';

// Mock encodeAsync function
vi.mock('@/utils/tokenizer', () => ({
  encodeAsync: vi.fn((text) => Promise.resolve(text.length)),
}));

describe('chatHelpers', () => {
  describe('getMessagesTokenCount', () => {
    it('returns token count for a list of messages', async () => {
      const messages = [{ content: 'Hello' }, { content: 'World' }] as OpenAIChatMessage[];
      const tokenCount = await chatHelpers.getMessagesTokenCount(messages);
      expect(tokenCount).toBe('HelloWorld'.length);
    });

    it('returns 0 for an empty array', async () => {
      const tokenCount = await chatHelpers.getMessagesTokenCount([]);
      expect(tokenCount).toBe(0);
    });

    it('handles messages with empty content', async () => {
      const messages = [
        { content: 'Hello' },
        { content: '' },
        { content: 'World' },
      ] as OpenAIChatMessage[];
      const tokenCount = await chatHelpers.getMessagesTokenCount(messages);
      expect(tokenCount).toBe('HelloWorld'.length);
    });

    it('throws an error when encodeAsync fails', async () => {
      vi.spyOn(tokenizerObj, 'encodeAsync').mockRejectedValue(new Error('Test error'));
      await expect(
        chatHelpers.getMessagesTokenCount([{ content: 'Hello' }] as OpenAIChatMessage[]),
      ).rejects.toThrow('Test error');
    });
  });

  describe('getMessageById', () => {
    const messages = [
      { id: '1', content: 'Hello' },
      { id: '2', content: 'World' },
    ] as UIChatMessage[];

    it('finds a message by id', () => {
      const message = chatHelpers.getMessageById(messages, '1');
      expect(message).toEqual({ id: '1', content: 'Hello' });
    });

    it('returns undefined for an invalid id', () => {
      const message = chatHelpers.getMessageById(messages, '3');
      expect(message).toBeUndefined();
    });

    it('returns undefined for an empty array', () => {
      const message = chatHelpers.getMessageById([], '1');
      expect(message).toBeUndefined();
    });

    it('finds a block within a group message', () => {
      const messagesWithGroup = [
        { id: '1', content: 'Hello' },
        {
          id: 'group1',
          role: 'group',
          content: '',
          children: [
            { id: 'block1', content: 'First block' },
            { id: 'block2', content: 'Second block' },
          ],
        },
      ] as UIChatMessage[];

      const block = chatHelpers.getMessageById(messagesWithGroup, 'block1');
      expect(block).toBeDefined();
      expect(block?.id).toBe('block1');
      expect(block?.content).toBe('First block');
    });

    it('returns block with parentId set to group message id', () => {
      const messagesWithGroup = [
        {
          id: 'group1',
          role: 'group',
          content: '',
          children: [{ id: 'block1', content: 'Block content' }],
        },
      ] as UIChatMessage[];

      const block = chatHelpers.getMessageById(messagesWithGroup, 'block1');
      expect(block).toBeDefined();
      expect(block?.parentId).toBe('group1');
    });

    it('searches across multiple group messages', () => {
      const messagesWithGroups = [
        {
          id: 'group1',
          role: 'group',
          content: '',
          children: [{ id: 'block1', content: 'First group block' }],
        },
        {
          id: 'group2',
          role: 'group',
          content: '',
          children: [{ id: 'block2', content: 'Second group block' }],
        },
      ] as UIChatMessage[];

      const block = chatHelpers.getMessageById(messagesWithGroups, 'block2');
      expect(block).toBeDefined();
      expect(block?.id).toBe('block2');
      expect(block?.parentId).toBe('group2');
      expect(block?.content).toBe('Second group block');
    });

    it('prioritizes top-level message over block with same id', () => {
      const messagesWithConflict = [
        { id: 'duplicate', content: 'Top-level message', role: 'user' },
        {
          id: 'group1',
          role: 'group',
          content: '',
          children: [{ id: 'duplicate', content: 'Block message' }],
        },
      ] as UIChatMessage[];

      const message = chatHelpers.getMessageById(messagesWithConflict, 'duplicate');
      expect(message).toBeDefined();
      expect(message?.content).toBe('Top-level message');
      expect(message?.role).toBe('user');
      expect(message?.parentId).toBeUndefined();
    });

    it('returns undefined when block is not found in any group', () => {
      const messagesWithGroup = [
        {
          id: 'group1',
          role: 'group',
          content: '',
          children: [{ id: 'block1', content: 'Block content' }],
        },
      ] as UIChatMessage[];

      const block = chatHelpers.getMessageById(messagesWithGroup, 'nonexistent');
      expect(block).toBeUndefined();
    });

    it('handles group message without children', () => {
      const messagesWithEmptyGroup = [
        { id: 'group1', role: 'group', content: '' },
      ] as UIChatMessage[];

      const block = chatHelpers.getMessageById(messagesWithEmptyGroup, 'block1');
      expect(block).toBeUndefined();
    });
  });

  describe('getSlicedMessages', () => {
    const messages = [
      { id: '1', content: 'First' },
      { id: '2', content: 'Second' },
      { id: '3', content: 'Third' },
    ] as UIChatMessage[];

    it('returns all messages if history is disabled', () => {
      const config = { enableHistoryCount: false, historyCount: undefined } as LobeAgentChatConfig;
      const slicedMessages = chatHelpers.getSlicedMessages(messages, config);
      expect(slicedMessages).toEqual(messages);
    });

    it('returns last N messages based on historyCount', () => {
      const config = { enableHistoryCount: true, historyCount: 2 } as LobeAgentChatConfig;
      const slicedMessages = chatHelpers.getSlicedMessages(messages, config);
      expect(slicedMessages).toEqual([
        { id: '2', content: 'Second' },
        { id: '3', content: 'Third' },
      ]);
    });

    it('returns empty array when historyCount is negative', () => {
      const config = { enableHistoryCount: true, historyCount: -1 } as LobeAgentChatConfig;
      const slicedMessages = chatHelpers.getSlicedMessages(messages, config);
      expect(slicedMessages).toEqual([]);
    });

    it('returns all messages if historyCount exceeds the array length', () => {
      const config = { enableHistoryCount: true, historyCount: 5 } as LobeAgentChatConfig;
      const slicedMessages = chatHelpers.getSlicedMessages(messages, config);
      expect(slicedMessages).toEqual(messages);
    });

    it('returns an empty array for an empty message array', () => {
      const config = { enableHistoryCount: true, historyCount: 2 } as LobeAgentChatConfig;
      const slicedMessages = chatHelpers.getSlicedMessages([], config);
      expect(slicedMessages).toEqual([]);
    });

    it('returns an empty array when historyCount is zero', () => {
      const config = { enableHistoryCount: true, historyCount: 0 } as LobeAgentChatConfig;
      const slicedMessages = chatHelpers.getSlicedMessages(messages, config);
      expect(slicedMessages).toEqual([]);
    });
  });
});
