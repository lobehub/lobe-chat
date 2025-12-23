import { serve } from '@upstash/workflow/nextjs';

import {
  MemoryExtractionExecutor,
  MemoryExtractionPayloadInput,
  normalizeMemoryExtractionPayload,
} from '@/server/services/memory/userMemory/extract';

export const { POST } = serve<MemoryExtractionPayloadInput>(async (context) => {
  const params = normalizeMemoryExtractionPayload(context.requestPayload || {});
  if (!params.userIds.length) {
    return { message: 'No user id provided for topic batch.' };
  }
  if (!params.topicIds.length) {
    return { message: 'No topic ids provided for extraction.' };
  }
  if (!params.sources.includes('chat_topic')) {
    return { message: 'Source not supported in topic batch.' };
  }

  const userId = params.userIds[0];
  const executor = await MemoryExtractionExecutor.create();

  const results: { extracted: boolean; layers: Record<string, number>; memoryIds: string[]; topicId: string, userId: string }[] = [];

  for (const topicId of params.topicIds) {
    const extracted = await context.run(
      `memory:user-memory:extract:users:${userId}:topics:${topicId}:extract-topic`,
      () =>
        executor.extractTopic({
          forceAll: params.forceAll,
          forceTopics: params.forceTopics,
          from: params.from,
          layers: params.layers,
          source: 'chat_topic',
          to: params.to,
          topicId,
          userId,
        }),
    );

    results.push({ ...extracted, topicId, userId });
  }

  return { processed: results.length, results };
});
