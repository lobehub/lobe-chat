// import { getClientConfig } from '@/config/client';
//
// import { ClientService } from './client';
// import { ServerService } from './server';
//
// const { ENABLED_SERVER_SERVICE } = getClientConfig();
//
// export const topicService = ENABLED_SERVER_SERVICE ? new ServerService() : new ClientService();
import { ClientService } from './client';

export const topicService = new ClientService();
