import { UIChatMessage } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { ChatStore } from '@/store/chat';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';

import { dbMessageSelectors } from './dbMessage';

describe('dbMessageSelectors', () => {
  describe('dbToolMessages', () => {
    it('should return only tool messages', () => {
      const messages = [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi' },
        { id: '3', role: 'tool', content: 'Tool message 1' },
        { id: '4', role: 'user', content: 'Query' },
        { id: '5', role: 'tool', tools: [] },
      ] as UIChatMessage[];
      const state: Partial<ChatStore> = {
        activeId: 'test-id',
        dbMessagesMap: {
          [messageMapKey('test-id')]: messages,
        },
        messagesMap: {
          [messageMapKey('test-id')]: messages,
        },
      };
      const result = dbMessageSelectors.dbToolMessages(state as ChatStore);
      expect(result).toHaveLength(2);
      expect(result.every((msg) => msg.role === 'tool')).toBe(true);
    });

    it('should return an empty array when no tool messages exist', () => {
      const messages = [
        { id: '1', role: 'user', content: 'Hello' },
        { id: '2', role: 'assistant', content: 'Hi' },
      ] as UIChatMessage[];
      const state: Partial<ChatStore> = {
        activeId: 'test-id',
        dbMessagesMap: {
          [messageMapKey('test-id')]: messages,
        },
        messagesMap: {
          [messageMapKey('test-id')]: messages,
        },
      };
      const result = dbMessageSelectors.dbToolMessages(state as ChatStore);
      expect(result).toHaveLength(0);
    });
  });
});
