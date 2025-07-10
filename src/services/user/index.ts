import { isDesktop } from '@/const/version';

import { ClientService as DeprecatedService } from './_deprecated';
import { ClientService } from './client';
import { ServerService } from './server';

const clientService =
  process.env.NEXT_PUBLIC_CLIENT_DB === 'pglite' ? new ClientService() : new DeprecatedService();

export const userService =
  process.env.NEXT_PUBLIC_SERVICE_MODE === 'server' || isDesktop
    ? new ServerService()
    : clientService;

export const userClientService = clientService;
