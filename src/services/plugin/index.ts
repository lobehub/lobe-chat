// import { getClientConfig } from '@/config/client';
import { ClientService } from './client';

// import { ServerService } from './server';
//
// export type { InstallPluginParams } from './client';
//
// const { ENABLED_SERVER_SERVICE } = getClientConfig();

// export const pluginService = ENABLED_SERVER_SERVICE ? new ServerService() : new ClientService();
export const pluginService = new ClientService();
