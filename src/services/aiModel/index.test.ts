import { testService } from '~test-utils';

import { ClientService } from './client';
import { ServerService } from './server';

describe('aiModelService', () => {
  testService(ServerService);

  testService(ClientService);
});
