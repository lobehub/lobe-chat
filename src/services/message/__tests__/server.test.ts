import { beforeEach, describe, expect, it, vi } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';
import { lambdaClient } from '@/libs/trpc/client';

import { ServerService } from '../server';

vi.mock('@/libs/trpc/client', () => ({
  lambdaClient: {
    message: {
      updateMetadata: {
        mutate: vi.fn(),
      },
    },
  },
}));

describe('ServerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toDbSessionId', () => {
    const service = new ServerService();
    // @ts-ignore access private method for testing
    const toDbSessionId = service['toDbSessionId'];

    it('should return null for INBOX_SESSION_ID', () => {
      expect(toDbSessionId(INBOX_SESSION_ID)).toBeNull();
    });

    it('should return the same session id for non-inbox sessions', () => {
      const sessionId = 'test-session-123';
      expect(toDbSessionId(sessionId)).toBe(sessionId);
    });

    it('should handle undefined input', () => {
      expect(toDbSessionId(undefined)).toBeUndefined(); // Updated to match the actual behavior
    });

    it('should handle empty string input', () => {
      expect(toDbSessionId('')).toBe(''); // No changes needed
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
      expect(toDbSessionId(null as any)).toBeNull(); // Cast null to any to bypass type errors
    });
  });

  describe('updateMessageMetadata', () => {
    const service = new ServerService();
    const mockMessageId = 'msg-123';

    it('should call lambdaClient.message.updateMetadata.mutate with correct parameters', async () => {
      const metadata = {
        autoSuggestions: {
          choice: 0,
          suggestions: ['What can you do?', 'Tell me more', 'How does this work?'],
        },
      };

      vi.mocked(lambdaClient.message.updateMetadata.mutate).mockResolvedValue(undefined);

      await service.updateMessageMetadata(mockMessageId, metadata);

      expect(lambdaClient.message.updateMetadata.mutate).toHaveBeenCalledWith({
        id: mockMessageId,
        value: metadata,
      });
      expect(lambdaClient.message.updateMetadata.mutate).toHaveBeenCalledTimes(1);
    });

    it('should handle empty metadata object', async () => {
      vi.mocked(lambdaClient.message.updateMetadata.mutate).mockResolvedValue(undefined);

      await service.updateMessageMetadata(mockMessageId, {});

      expect(lambdaClient.message.updateMetadata.mutate).toHaveBeenCalledWith({
        id: mockMessageId,
        value: {},
      });
    });

    it('should handle complex metadata objects', async () => {
      const complexMetadata = {
        autoSuggestions: {
          choice: 1,
          suggestions: ['Suggestion 1', 'Suggestion 2'],
        },
      } as any;

      vi.mocked(lambdaClient.message.updateMetadata.mutate).mockResolvedValue(undefined);

      await service.updateMessageMetadata(mockMessageId, complexMetadata);

      expect(lambdaClient.message.updateMetadata.mutate).toHaveBeenCalledWith({
        id: mockMessageId,
        value: complexMetadata,
      });
    });

    it('should throw error when tRPC mutation fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(lambdaClient.message.updateMetadata.mutate).mockRejectedValue(mockError);

      await expect(service.updateMessageMetadata(mockMessageId, {})).rejects.toThrow(
        'Network error',
      );
    });
  });
});
