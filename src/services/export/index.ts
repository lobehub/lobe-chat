import { isServerMode } from '@/const/version';

import { ClientService } from './client';
import { ServerService } from './server';

export const exportService = isServerMode ? new ServerService() : new ClientService();

// TODO: A new UI to guide users in migrating personal data from Local DB to Server DB
export const getExportService = (mode?: 'client' | 'server') => {
  if (mode === 'client') return new ClientService();
  if (mode === 'server') return new ServerService();
  return exportService;
};
