import { describe, expect, it } from 'vitest';

import { messagePlugins, messageTTS, messageTranslates, messages, messagesFiles } from './message';

describe('message schema', () => {
  describe('messages table', () => {
    it('should have correct table name', () => {
      expect((messages as any).$type?.name || 'messages').toBe('messages');
    });

    it('should have required columns', () => {
      const columns = messages;

      expect(columns.id).toBeDefined();
      expect(columns.role).toBeDefined();
      expect(columns.content).toBeDefined();
      expect(columns.reasoning).toBeDefined();
      expect(columns.search).toBeDefined();
      expect(columns.metadata).toBeDefined();
      expect(columns.model).toBeDefined();
      expect(columns.provider).toBeDefined();
      expect(columns.favorite).toBeDefined();
      expect(columns.error).toBeDefined();
      expect(columns.tools).toBeDefined();
      expect(columns.traceId).toBeDefined();
      expect(columns.observationId).toBeDefined();
      expect(columns.clientId).toBeDefined();
      expect(columns.userId).toBeDefined();
      expect(columns.sessionId).toBeDefined();
      expect(columns.topicId).toBeDefined();
      expect(columns.threadId).toBeDefined();
      expect(columns.parentId).toBeDefined();
      expect(columns.quotaId).toBeDefined();
      expect(columns.agentId).toBeDefined();
      expect(columns.createdAt).toBeDefined();
      expect(columns.updatedAt).toBeDefined();
      expect(columns.accessedAt).toBeDefined();
    });
  });

  describe('messagePlugins table', () => {
    it('should have correct table name', () => {
      expect((messagePlugins as any).$type?.name || 'message_plugins').toBe('message_plugins');
    });

    it('should have required columns', () => {
      const columns = messagePlugins;

      expect(columns.id).toBeDefined();
      expect(columns.toolCallId).toBeDefined();
      expect(columns.type).toBeDefined();
      expect(columns.apiName).toBeDefined();
      expect(columns.arguments).toBeDefined();
      expect(columns.identifier).toBeDefined();
      expect(columns.state).toBeDefined();
      expect(columns.error).toBeDefined();
    });
  });

  describe('messageTTS table', () => {
    it('should have correct table name', () => {
      expect((messageTTS as any).$type?.name || 'message_tts').toBe('message_tts');
    });

    it('should have required columns', () => {
      const columns = messageTTS;

      expect(columns.id).toBeDefined();
      expect(columns.contentMd5).toBeDefined();
      expect(columns.fileId).toBeDefined();
      expect(columns.voice).toBeDefined();
    });
  });

  describe('messageTranslates table', () => {
    it('should have correct table name', () => {
      expect((messageTranslates as any).$type?.name || 'message_translates').toBe(
        'message_translates',
      );
    });

    it('should have required columns', () => {
      const columns = messageTranslates;

      expect(columns.id).toBeDefined();
      expect(columns.content).toBeDefined();
      expect(columns.from).toBeDefined();
      expect(columns.to).toBeDefined();
    });
  });

  describe('messagesFiles table', () => {
    it('should have correct table name', () => {
      expect((messagesFiles as any).$type?.name || 'messages_files').toBe('messages_files');
    });

    it('should have required columns', () => {
      const columns = messagesFiles;

      expect(columns.fileId).toBeDefined();
      expect(columns.messageId).toBeDefined();
    });
  });
});
