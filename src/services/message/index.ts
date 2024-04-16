// import { getClientConfig } from '@/config/client';
// import { ServerService } from './server';
// import { ClientService } from './client';
//
// const { ENABLED_SERVER_SERVICE } = getClientConfig();
//
// export const messageService = ENABLED_SERVER_SERVICE ? new ServerService() : new ClientService();
import { ClientService } from './client';

export type { CreateMessageParams } from './type';

class MessageService extends ClientService {
  async hasMessages() {
    const number = await this.countMessages();
    return number > 0;
  }

  async messageCountToCheckTrace() {
    const number = await this.countMessages();
    return number >= 4;
  }
}

export const messageService = new MessageService();
