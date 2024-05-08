// import { getClientConfig } from '@/config/client';
//
// import { ClientService } from './client';
// import { ServerService } from './server';
//
// const { ENABLED_SERVER_SERVICE } = getClientConfig();
//
// export const userService = ENABLED_SERVER_SERVICE ? new ServerService() : new ClientService();
import { ClientService } from './client';

export type { UserConfig } from './client';

export const userService = new ClientService();
