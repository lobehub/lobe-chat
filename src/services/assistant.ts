import { cloneDeep, merge } from 'lodash-es';

import { DEFAULT_DISCOVER_ASSISTANT_ITEM } from '@/const/discover';
import { globalHelpers } from '@/store/global/helpers';
import { DiscoverAssistantItem } from '@/types/discover';

import { API_ENDPOINTS } from './_url';

class AssistantService {
  getAssistantList = async (): Promise<DiscoverAssistantItem[]> => {
    const locale = globalHelpers.getCurrentLanguage();

    const res = await fetch(`${API_ENDPOINTS.assistantStore}?locale=${locale}`);

    const json = await res.json();

    return json.agents;
  };

  getAssistantById = async (identifier: string): Promise<DiscoverAssistantItem> => {
    const locale = globalHelpers.getCurrentLanguage();

    const res = await fetch(`${API_ENDPOINTS.assistant(identifier)}?locale=${locale}`);

    const assistant: DiscoverAssistantItem = await res.json();

    return merge(cloneDeep(DEFAULT_DISCOVER_ASSISTANT_ITEM), assistant);
  };
}
export const assistantService = new AssistantService();
