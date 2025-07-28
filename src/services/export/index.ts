import { isServerMode } from '@/const/version';

import { ClientService } from './client';
import { ServerService } from './server';

export const exportService = isServerMode ? new ServerService() : new ClientService();
