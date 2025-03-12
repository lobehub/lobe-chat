import { ClientService } from './client';
import { ServerService } from './server';

export const threadService =
  process.env.NEXT_PUBLIC_SERVICE_MODE === 'server' ? new ServerService() : new ClientService();
