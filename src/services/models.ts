import { createHeaderWithAuth } from '@/services/_auth';
import { useGlobalStore } from '@/store/global';
import { modelConfigSelectors } from '@/store/global/selectors';
import { ChatModelCard } from '@/types/llm';

import { API_ENDPOINTS } from './_url';
import { initializeWithClientStore } from './chat';

class ModelsService {
  getChatModels = async (provider: string): Promise<ChatModelCard[] | undefined> => {
    const headers = await createHeaderWithAuth({
      headers: { 'Content-Type': 'application/json' },
      provider,
    });
    try {
      /**
       * Use browser agent runtime
       */
      const enableFetchOnClient = modelConfigSelectors.isProviderFetchOnClient(provider)(
        useGlobalStore.getState(),
      );
      if (enableFetchOnClient) {
        const agentRuntime = await initializeWithClientStore(provider, {});
        return agentRuntime.models();
      }

      const res = await fetch(API_ENDPOINTS.chatModels(provider), { headers });
      if (!res.ok) return;

      return res.json();
    } catch {
      return;
    }
  };
}

export const modelsService = new ModelsService();
