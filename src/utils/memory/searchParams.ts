import type { RetrieveMemoryParams } from '@/types/userMemory';

const DEFAULT_LIMIT = 10;
const DEFAULT_TOP_K = {
  contexts: 3,
  experiences: 4,
  preferences: 3,
};

interface MemorySearchSource {
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
  for (const value of values) {
    if (typeof value !== 'string') continue;

    const trimmed = value.trim();
    if (trimmed.length === 0) continue;

    return trimmed;
  }

  return undefined;
};

export const createMemorySearchParams = (
  source: MemorySearchSource,
): RetrieveMemoryParams | undefined => {
  const query = pickFirstNonEmpty([
    source.topic?.historySummary,
    source.topic?.title,
    source.session?.meta?.title,
    source.session?.meta?.description,
  ]);

  if (!query) return undefined;

  return {
    limit: String(DEFAULT_LIMIT),
    query,
    topK: {
      ...DEFAULT_TOP_K,
    },
  } as RetrieveMemoryParams;
};
