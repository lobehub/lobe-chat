// import { getClientConfig } from '@/config/client';
//
import { ClientService } from './client';

// import { ServerService } from './server';

// const { ENABLED_SERVER_SERVICE } = getClientConfig();

// export const sessionService = ENABLED_SERVER_SERVICE ? new ServerService() : new ClientService();
export const sessionService = new ClientService();
