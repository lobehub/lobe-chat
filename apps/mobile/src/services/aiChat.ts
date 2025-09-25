import { SendMessageServerParams } from '@lobechat/types';
import { cleanObject } from '@lobechat/utils';

import { trpcClient } from '@/services/_auth/trpc';

class AiChatService {
  sendMessageInServer = async (params: SendMessageServerParams) => {
    return trpcClient.aiChat.sendMessageInServer.mutate(cleanObject(params));
  };
}

export const aiChatService = new AiChatService();
