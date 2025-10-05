import { isDesktop } from '@/const/version';

import { ClientService as DeprecatedService } from './_deprecated';
import { ClientService } from './client';
import { DesktopUserService } from './desktop';
import { ServerService } from './server';

const clientService =
  process.env.NEXT_PUBLIC_CLIENT_DB === 'pglite' ? new ClientService() : new DeprecatedService();

export const userService =
  process.env.NEXT_PUBLIC_SERVICE_MODE === 'server'
    ? new ServerService()
    : isDesktop
      ? new DesktopUserService()
      : clientService;

export const userClientService = clientService;
