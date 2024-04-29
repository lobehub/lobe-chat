// import { getClientConfig } from '@/config/client';
import { ClientService } from './client';

// import { ServerService } from './server';
//
// const { ENABLED_SERVER_SERVICE } = getClientConfig();
//
// export const fileService = ENABLED_SERVER_SERVICE ? new ServerService() : new ClientService();
export const fileService = new ClientService();
