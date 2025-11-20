import { describe, expect, it } from 'vitest';

import { messageMapKey } from './messageMapKey';

describe('messageMapKey', () => {
  describe('basic sessionId only', () => {
    it('should generate key with sessionId only', () => {
      const result = messageMapKey('session-1');
      expect(result).toBe('session-1_null');
    });

    it('should handle empty string sessionId', () => {
      const result = messageMapKey('');
      expect(result).toBe('_null');
    });

    it('should handle sessionId with special characters', () => {
      const result = messageMapKey('session-123-abc_def');
      expect(result).toBe('session-123-abc_def_null');
    });
  });

  describe('sessionId with topicId', () => {
    it('should generate key with sessionId and topicId', () => {
      const result = messageMapKey('session-1', 'topic-1');
      expect(result).toBe('session-1_topic-1');
    });

    it('should handle null topicId', () => {
      const result = messageMapKey('session-1', null);
      expect(result).toBe('session-1_null');
    });

    it('should handle undefined topicId (same as null)', () => {
      const result = messageMapKey('session-1', undefined);
      expect(result).toBe('session-1_null');
    });

    it('should handle empty string topicId', () => {
      const result = messageMapKey('session-1', '');
      expect(result).toBe('session-1_');
    });

    it('should handle topicId with special characters', () => {
      const result = messageMapKey('session-1', 'topic-123-abc_def');
      expect(result).toBe('session-1_topic-123-abc_def');
    });
  });

  describe('thread mode (highest priority)', () => {
    it('should generate thread key with threadId', () => {
      const result = messageMapKey('session-1', undefined, 'thread-1');
      expect(result).toBe('session-1_thread_thread-1');
    });

    it('should prioritize threadId over topicId', () => {
      const result = messageMapKey('session-1', 'topic-1', 'thread-1');
      expect(result).toBe('session-1_thread_thread-1');
    });

    it('should handle null threadId (falls back to topic mode)', () => {
      const result = messageMapKey('session-1', 'topic-1', null);
      expect(result).toBe('session-1_topic-1');
    });

    it('should handle undefined threadId (falls back to topic mode)', () => {
      const result = messageMapKey('session-1', 'topic-1', undefined);
      expect(result).toBe('session-1_topic-1');
    });

    it('should handle empty string threadId', () => {
      const result = messageMapKey('session-1', 'topic-1', '');
      expect(result).toBe('session-1_topic-1');
    });

    it('should handle threadId with special characters', () => {
      const result = messageMapKey('session-1', undefined, 'thread-123-abc_def');
      expect(result).toBe('session-1_thread_thread-123-abc_def');
    });
  });

  describe('key uniqueness', () => {
    it('should generate different keys for different sessionIds', () => {
      const key1 = messageMapKey('session-1', 'topic-1');
      const key2 = messageMapKey('session-2', 'topic-1');
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different topicIds', () => {
      const key1 = messageMapKey('session-1', 'topic-1');
      const key2 = messageMapKey('session-1', 'topic-2');
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different threadIds', () => {
      const key1 = messageMapKey('session-1', undefined, 'thread-1');
      const key2 = messageMapKey('session-1', undefined, 'thread-2');
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for topic vs thread mode', () => {
      const topicKey = messageMapKey('session-1', 'topic-1');
      const threadKey = messageMapKey('session-1', 'topic-1', 'thread-1');
      expect(topicKey).not.toBe(threadKey);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle inbox session without topic', () => {
      const result = messageMapKey('inbox', undefined);
      expect(result).toBe('inbox_null');
    });

    it('should handle inbox session with topic', () => {
      const result = messageMapKey('inbox', 'topic-123');
      expect(result).toBe('inbox_topic-123');
    });

    it('should handle group session', () => {
      const result = messageMapKey('group-abc', 'topic-xyz');
      expect(result).toBe('group-abc_topic-xyz');
    });

    it('should handle thread in group session', () => {
      const result = messageMapKey('group-abc', 'topic-xyz', 'thread-001');
      expect(result).toBe('group-abc_thread_thread-001');
    });

    it('should handle multiple threads in same session', () => {
      const thread1 = messageMapKey('session-1', 'topic-1', 'thread-1');
      const thread2 = messageMapKey('session-1', 'topic-1', 'thread-2');
      const thread3 = messageMapKey('session-1', 'topic-1', 'thread-3');

      expect(thread1).toBe('session-1_thread_thread-1');
      expect(thread2).toBe('session-1_thread_thread-2');
      expect(thread3).toBe('session-1_thread_thread-3');
      expect(new Set([thread1, thread2, thread3]).size).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle all parameters as empty strings', () => {
      const result = messageMapKey('', '', '');
      expect(result).toBe('_');
    });

    it('should handle sessionId with underscore (potential conflict)', () => {
      const result = messageMapKey('session_with_underscores', 'topic-1');
      expect(result).toBe('session_with_underscores_topic-1');
    });

    it('should handle topicId with underscore', () => {
      const result = messageMapKey('session-1', 'topic_with_underscores');
      expect(result).toBe('session-1_topic_with_underscores');
    });

    it('should handle threadId with underscore', () => {
      const result = messageMapKey('session-1', undefined, 'thread_with_underscores');
      expect(result).toBe('session-1_thread_thread_with_underscores');
    });

    it('should be consistent when called multiple times with same params', () => {
      const key1 = messageMapKey('session-1', 'topic-1', 'thread-1');
      const key2 = messageMapKey('session-1', 'topic-1', 'thread-1');
      expect(key1).toBe(key2);
    });
  });
});
