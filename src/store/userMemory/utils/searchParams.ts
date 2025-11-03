import { find, isString, trim } from 'lodash-es';

import type { RetrieveMemoryParams } from '@/types/userMemory';

const DEFAULT_TOP_K = {
  contexts: 3,
  experiences: 4,
  preferences: 3,
};

interface MemorySearchSource {
  latestUserMessage?: string | null;
  sendingMessage?: string | null;
  session?: {
    meta?: {
      description?: string | null;
      title?: string | null;
    } | null;
  } | null;
  topic?: {
    historySummary?: string | null;
    title?: string | null;
  } | null;
}

const pickFirstNonEmpty = (values: Array<string | null | undefined>) => {
  const matched = find(values, (value) => isString(value) && trim(value).length > 0);

  if (!isString(matched)) return undefined;

  return trim(matched);
};

export const createMemorySearchParams = (
  source: MemorySearchSource,
): RetrieveMemoryParams | undefined => {
  const query = pickFirstNonEmpty([
    source.topic?.historySummary,
    source.session?.meta?.description,
    source.latestUserMessage,
    source.sendingMessage,
  ]);

  if (!query) return undefined;

  return {
    query,
    topK: {
      ...DEFAULT_TOP_K,
    },
  } as RetrieveMemoryParams;
};
