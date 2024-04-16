// import { getClientConfig } from '@/config/client';
import { ClientService } from './client';

// import { ServerService } from './server';
//
export type { CreateMessageParams } from './client';
//
// const { ENABLED_SERVER_SERVICE } = getClientConfig();
//
// export const messageService = ENABLED_SERVER_SERVICE ? new ServerService() : new ClientService();
export const messageService = new ClientService();
