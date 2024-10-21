import { isServerMode } from '@/const/version';

import { ClientService } from './client';
import { ServerService } from './server';

export type { ImportResult } from './type';

export const importService = isServerMode ? new ServerService() : new ClientService();

export const getImportService = (mode?: 'client' | 'server') => {
  if (mode === 'client') return new ClientService();
  if (mode === 'server') return new ServerService();
  return importService;
};
