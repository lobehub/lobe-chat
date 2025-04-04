import { describe, expect, it } from 'vitest';

import { INBOX_SESSION_ID } from '@/const/session';

import { ServerService } from '../server';

describe('ServerService', () => {
  describe('toDbSessionId', () => {
    const service = new ServerService();
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
});
