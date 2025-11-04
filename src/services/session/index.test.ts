import { describe, expect, it } from 'vitest';

import { testService } from '~test-utils';
import { SessionService, sessionService } from './index';

describe('SessionService', () => {
  describe('service instance', () => {
    it('should export sessionService instance', () => {
      expect(sessionService).toBeInstanceOf(SessionService);
    });
  });

  describe('instance methods', () => {
    testService(SessionService, { checkAsync: false });
  });
});
