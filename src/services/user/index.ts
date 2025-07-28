import { isDesktop } from '@/const/version';

import { ClientService } from './client';
import { ServerService } from './server';

export const userClientService = new ClientService();

export const userService =
  process.env.NEXT_PUBLIC_SERVICE_MODE === 'server' || isDesktop
    ? new ServerService()
    : userClientService;
