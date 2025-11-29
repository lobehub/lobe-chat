import { describe, expect, it } from 'vitest';

import { messageMapKey } from './messageMapKey';

describe('messageMapKey', () => {
  describe('basic agentId only', () => {
    it('should generate key with agentId only', () => {
      const result = messageMapKey({ agentId: 'agent-1' });
      expect(result).toBe('agent-1_null');
    });

    it('should handle empty string agentId', () => {
      const result = messageMapKey({ agentId: '' });
      expect(result).toBe('_null');
    });

    it('should handle agentId with special characters', () => {
      const result = messageMapKey({ agentId: 'agent-123-abc_def' });
      expect(result).toBe('agent-123-abc_def_null');
    });
  });

  describe('agentId with topicId', () => {
    it('should generate key with agentId and topicId', () => {
      const result = messageMapKey({ agentId: 'agent-1', topicId: 'topic-1' });
      expect(result).toBe('agent-1_topic-1');
    });

    it('should handle null topicId', () => {
      const result = messageMapKey({ agentId: 'agent-1', topicId: null });
      expect(result).toBe('agent-1_null');
    });

    it('should handle undefined topicId (same as null)', () => {
      const result = messageMapKey({ agentId: 'agent-1', topicId: undefined });
      expect(result).toBe('agent-1_null');
    });

    it('should handle empty string topicId', () => {
      const result = messageMapKey({ agentId: 'agent-1', topicId: '' });
      expect(result).toBe('agent-1_');
    });

    it('should handle topicId with special characters', () => {
      const result = messageMapKey({ agentId: 'agent-1', topicId: 'topic-123-abc_def' });
      expect(result).toBe('agent-1_topic-123-abc_def');
    });
  });

  describe('thread mode (highest priority)', () => {
    it('should generate thread key with threadId', () => {
      const result = messageMapKey({ agentId: 'agent-1', threadId: 'thread-1' });
      expect(result).toBe('agent-1_thread_thread-1');
    });

    it('should prioritize threadId over topicId', () => {
      const result = messageMapKey({
        agentId: 'agent-1',
        topicId: 'topic-1',
        threadId: 'thread-1',
      });
      expect(result).toBe('agent-1_thread_thread-1');
    });

    it('should handle null threadId (falls back to topic mode)', () => {
      const result = messageMapKey({ agentId: 'agent-1', topicId: 'topic-1', threadId: null });
      expect(result).toBe('agent-1_topic-1');
    });

    it('should handle undefined threadId (falls back to topic mode)', () => {
      const result = messageMapKey({
        agentId: 'agent-1',
        topicId: 'topic-1',
        threadId: undefined,
      });
      expect(result).toBe('agent-1_topic-1');
    });

    it('should handle empty string threadId', () => {
      const result = messageMapKey({ agentId: 'agent-1', topicId: 'topic-1', threadId: '' });
      expect(result).toBe('agent-1_topic-1');
    });

    it('should handle threadId with special characters', () => {
      const result = messageMapKey({ agentId: 'agent-1', threadId: 'thread-123-abc_def' });
      expect(result).toBe('agent-1_thread_thread-123-abc_def');
    });
  });

  describe('key uniqueness', () => {
    it('should generate different keys for different agentIds', () => {
      const key1 = messageMapKey({ agentId: 'agent-1', topicId: 'topic-1' });
      const key2 = messageMapKey({ agentId: 'agent-2', topicId: 'topic-1' });
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different topicIds', () => {
      const key1 = messageMapKey({ agentId: 'agent-1', topicId: 'topic-1' });
      const key2 = messageMapKey({ agentId: 'agent-1', topicId: 'topic-2' });
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different threadIds', () => {
      const key1 = messageMapKey({ agentId: 'agent-1', threadId: 'thread-1' });
      const key2 = messageMapKey({ agentId: 'agent-1', threadId: 'thread-2' });
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for topic vs thread mode', () => {
      const topicKey = messageMapKey({ agentId: 'agent-1', topicId: 'topic-1' });
      const threadKey = messageMapKey({
        agentId: 'agent-1',
        topicId: 'topic-1',
        threadId: 'thread-1',
      });
      expect(topicKey).not.toBe(threadKey);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle inbox agent without topic', () => {
      const result = messageMapKey({ agentId: 'inbox' });
      expect(result).toBe('inbox_null');
    });

    it('should handle inbox agent with topic', () => {
      const result = messageMapKey({ agentId: 'inbox', topicId: 'topic-123' });
      expect(result).toBe('inbox_topic-123');
    });

    it('should handle group agent', () => {
      const result = messageMapKey({ agentId: 'group-abc', topicId: 'topic-xyz' });
      expect(result).toBe('group-abc_topic-xyz');
    });

    it('should handle thread in group agent', () => {
      const result = messageMapKey({
        agentId: 'group-abc',
        topicId: 'topic-xyz',
        threadId: 'thread-001',
      });
      expect(result).toBe('group-abc_thread_thread-001');
    });

    it('should handle multiple threads in same agent', () => {
      const thread1 = messageMapKey({
        agentId: 'agent-1',
        topicId: 'topic-1',
        threadId: 'thread-1',
      });
      const thread2 = messageMapKey({
        agentId: 'agent-1',
        topicId: 'topic-1',
        threadId: 'thread-2',
      });
      const thread3 = messageMapKey({
        agentId: 'agent-1',
        topicId: 'topic-1',
        threadId: 'thread-3',
      });

      expect(thread1).toBe('agent-1_thread_thread-1');
      expect(thread2).toBe('agent-1_thread_thread-2');
      expect(thread3).toBe('agent-1_thread_thread-3');
      expect(new Set([thread1, thread2, thread3]).size).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle all parameters as empty strings', () => {
      const result = messageMapKey({ agentId: '', topicId: '', threadId: '' });
      expect(result).toBe('_');
    });

    it('should handle agentId with underscore (potential conflict)', () => {
      const result = messageMapKey({ agentId: 'agent_with_underscores', topicId: 'topic-1' });
      expect(result).toBe('agent_with_underscores_topic-1');
    });

    it('should handle topicId with underscore', () => {
      const result = messageMapKey({ agentId: 'agent-1', topicId: 'topic_with_underscores' });
      expect(result).toBe('agent-1_topic_with_underscores');
    });

    it('should handle threadId with underscore', () => {
      const result = messageMapKey({ agentId: 'agent-1', threadId: 'thread_with_underscores' });
      expect(result).toBe('agent-1_thread_thread_with_underscores');
    });

    it('should be consistent when called multiple times with same params', () => {
      const key1 = messageMapKey({
        agentId: 'agent-1',
        topicId: 'topic-1',
        threadId: 'thread-1',
      });
      const key2 = messageMapKey({
        agentId: 'agent-1',
        topicId: 'topic-1',
        threadId: 'thread-1',
      });
      expect(key1).toBe(key2);
    });
  });

  describe('context object compatibility', () => {
    it('should work with ConversationContext-like objects', () => {
      const context = {
        agentId: 'agent-1',
        topicId: 'topic-1',
        threadId: 'thread-1',
      };
      const result = messageMapKey(context);
      expect(result).toBe('agent-1_thread_thread-1');
    });

    it('should work when spreading context object', () => {
      const context = { agentId: 'agent-1', topicId: 'topic-1' };
      const result = messageMapKey({ ...context, threadId: 'thread-1' });
      expect(result).toBe('agent-1_thread_thread-1');
    });
  });
});
