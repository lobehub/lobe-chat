import { testService } from '~test-utils';

import { ClientService } from './client';
import { ServerService } from './server';

describe('aiProviderService', () => {
  testService(ServerService);

  testService(ClientService);
});
