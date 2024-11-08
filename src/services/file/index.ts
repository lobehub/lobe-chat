import { ClientService } from './client';
import { ServerService } from './server';

export const fileService =
  process.env.NEXT_PUBLIC_SERVICE_MODE === 'server' ? new ServerService() : new ClientService();
