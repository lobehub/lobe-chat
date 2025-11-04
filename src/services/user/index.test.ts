import { describe } from 'vitest';
import { testService } from '~test-utils';

import { UserService } from './index';

describe('UserService', () => {
  describe('instance methods', () => {
    testService(UserService, { checkAsync: false });
  });
});
