import { SendMessageServerParams } from '@lobechat/types';
import { cleanObject } from '@lobechat/utils';

import { trpcClient } from '@/services/_auth/trpc';

class AiChatService {
  sendMessageInServer = async (
    params: SendMessageServerParams,
    abortController?: AbortController,
  ) => {
    return trpcClient.aiChat.sendMessageInServer.mutate(cleanObject(params), {
      context: { showNotification: false },
      signal: abortController?.signal,
    });
  };
}

export const aiChatService = new AiChatService();
