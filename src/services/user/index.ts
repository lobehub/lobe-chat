import { isServerMode } from '@/const/version';

import { ClientService } from './client';
import { ServerService } from './server';

export const userService = isServerMode ? new ServerService() : new ClientService();
