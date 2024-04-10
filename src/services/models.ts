import { createHeaderWithAuth } from '@/services/_auth';
import { ChatModelCard } from '@/types/llm';

import { API_ENDPOINTS } from './_url';

class ModelsService {
  getChatModels = async (provider: string): Promise<ChatModelCard[] | undefined> => {
    const headers = await createHeaderWithAuth({
      headers: { 'Content-Type': 'application/json' },
      provider,
    });
    try {
      const res = await fetch(API_ENDPOINTS.chatModels(provider), { headers });
      if (!res.ok) return;

      return res.json();
    } catch {
      return;
    }
  };
}

export const modelsService = new ModelsService();
