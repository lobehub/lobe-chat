import { URLS } from '@/services/url';
import { LangChainParams } from '@/types/langchain';
import { fetchAIFactory } from '@/utils/fetch';

/**
 * 专门用于 FlowChain 的 fetch
 */
export const fetchLangChain = fetchAIFactory(
  (params: LangChainParams, signal?: AbortSignal | undefined) =>
    fetch(URLS.chain, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal,
    }),
);
