// import { getClientConfig } from '@/config/client';
// import { ServerService } from './server';
// import { ClientService } from './client';
//
// const { ENABLED_SERVER_SERVICE } = getClientConfig();
//
// export const messageService = ENABLED_SERVER_SERVICE ? new ServerService() : new ClientService();
import { ClientService } from './client';

export type { CreateMessageParams } from './type';

export const messageService = new ClientService();
