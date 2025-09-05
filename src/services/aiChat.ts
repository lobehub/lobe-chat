import { SendMessageServerParams } from '@lobechat/types';
import { cleanObject } from '@lobechat/utils';

import { lambdaClient } from '@/libs/trpc/client';

class AiChatService {
  sendMessageInServer = async (params: SendMessageServerParams) => {
    return lambdaClient.aiChat.sendMessageInServer.mutate(cleanObject(params));
  };
}

export const aiChatService = new AiChatService();
