import { describe, expect, it } from 'vitest';

import { testService } from '~test-utils';
import { ThreadService, threadService } from './index';

describe('ThreadService', () => {
  describe('service instance', () => {
    it('should export threadService instance', () => {
      expect(threadService).toBeInstanceOf(ThreadService);
    });
  });

  describe('instance methods', () => {
    testService(ThreadService, { checkAsync: false });
  });
});
