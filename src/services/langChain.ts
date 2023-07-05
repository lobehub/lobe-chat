import { URLS } from '@/services/url';
import { LangChainParams } from '@/types/langchain';
import { fetchAIFactory } from '@/utils/fetch';

/**
 * 专门用于 FlowChain 的 fetch
 */
export const fetchLangChain = fetchAIFactory(
  (parameters: LangChainParams, signal?: AbortSignal | undefined) =>
    fetch(URLS.chain, {
      body: JSON.stringify(parameters),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal,
    }),
);
