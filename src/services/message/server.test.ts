import { describe, expect, it, vi } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';
import { lambdaClient } from '@/libs/trpc/client';

import { MessageService } from './index';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    message: {
      createMessage: { mutate: vi.fn() },
      getMessages: { query: vi.fn() },
      removeMessagesByAssistant: { mutate: vi.fn() },
    },
  },
}));

describe('MessageService', () => {
  describe('toDbSessionId', () => {
    const service = new MessageService();
    // @ts-ignore access private method for testing
    const toDbSessionId = service.toDbSessionId;

    it('should return null for INBOX_SESSION_ID', () => {
      expect(toDbSessionId(INBOX_SESSION_ID)).toBeNull();
    });

    it('should return the same session id for non-inbox sessions', () => {
      const sessionId = 'test-session-123';
      expect(toDbSessionId(sessionId)).toBe(sessionId);
    });

    it('should handle undefined input', () => {
      expect(toDbSessionId(undefined)).toBeUndefined();
    });

    it('should handle empty string input', () => {
      expect(toDbSessionId('')).toBe('');
    });

    it('should handle special characters in session id', () => {
      const specialSessionId = '!@#$%^&*()_+';
      expect(toDbSessionId(specialSessionId)).toBe(specialSessionId);
    });

    it('should handle numeric session id', () => {
      const numericSessionId = '12345';
      expect(toDbSessionId(numericSessionId)).toBe(numericSessionId);
    });

    it('should handle null session id', () => {
      expect(toDbSessionId(null as any)).toBeNull();
    });
  });

  describe('INBOX_SESSION_ID transformation in methods', () => {
    const service = new MessageService();

    afterEach(() => {
      vi.clearAllMocks();
    });

    describe('createMessage', () => {
      it('should transform INBOX_SESSION_ID to null', async () => {
        vi.mocked(lambdaClient.message.createMessage.mutate).mockResolvedValue({
          id: 'msg-1',
          messages: [],
        });

        await service.createMessage({
          content: 'test',
          role: 'user',
          sessionId: INBOX_SESSION_ID,
        });

        expect(lambdaClient.message.createMessage.mutate).toHaveBeenCalledWith({
          content: 'test',
          role: 'user',
          sessionId: null,
        });
      });

      it('should keep regular sessionId unchanged', async () => {
        vi.mocked(lambdaClient.message.createMessage.mutate).mockResolvedValue({
          id: 'msg-1',
          messages: [],
        });

        await service.createMessage({
          content: 'test',
          role: 'user',
          sessionId: 'session-123',
        });

        expect(lambdaClient.message.createMessage.mutate).toHaveBeenCalledWith({
          content: 'test',
          role: 'user',
          sessionId: 'session-123',
        });
      });
    });

    describe('removeMessagesByAssistant', () => {
      it('should NOT transform INBOX_SESSION_ID (server handles it)', async () => {
        vi.mocked(lambdaClient.message.removeMessagesByAssistant.mutate).mockResolvedValue(
          undefined as any,
        );

        await service.removeMessagesByAssistant(INBOX_SESSION_ID);

        expect(lambdaClient.message.removeMessagesByAssistant.mutate).toHaveBeenCalledWith({
          sessionId: INBOX_SESSION_ID,
          topicId: undefined,
        });
      });

      it('should keep regular sessionId unchanged', async () => {
        vi.mocked(lambdaClient.message.removeMessagesByAssistant.mutate).mockResolvedValue(
          undefined as any,
        );

        await service.removeMessagesByAssistant('session-123', 'topic-1');

        expect(lambdaClient.message.removeMessagesByAssistant.mutate).toHaveBeenCalledWith({
          sessionId: 'session-123',
          topicId: 'topic-1',
        });
      });
    });
  });
});
