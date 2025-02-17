import { isDesktop } from '@/const/version';

import { ClientService } from './client';
import { DesktopService } from './desktop';

export const tableViewerService = isDesktop ? new DesktopService() : new ClientService();
