import { describe } from 'vitest';
import { testService } from '~test-utils';

import { UserService } from './index';

describe('UserService', () => {
  testService(UserService);
});
