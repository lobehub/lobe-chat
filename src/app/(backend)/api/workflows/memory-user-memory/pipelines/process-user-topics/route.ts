import { serve } from '@upstash/workflow/nextjs';
import { chunk } from 'lodash-es';

import type { ListTopicsForMemoryExtractorCursor } from '@/database/models/topic';
import {
  MemoryExtractionExecutor,
  MemoryExtractionPayloadInput,
  MemoryExtractionWorkflowService,
  buildWorkflowPayloadInput,
  normalizeMemoryExtractionPayload,
} from '@/server/services/memory/userMemory/extract';

const TOPIC_PAGE_SIZE = 50;
const TOPIC_BATCH_SIZE = 10;

export const { POST } = serve<MemoryExtractionPayloadInput>(async (context) => {
  const params = normalizeMemoryExtractionPayload(context.requestPayload || {});
  if (!params.userIds.length) {
    return { message: 'No user ids provided for topic processing.' };
  }
  if (!params.sources.includes('chat_topic')) {
    return { message: 'No supported sources requested, skip topic processing.' };
  }

  const executor = await MemoryExtractionExecutor.create();

  const scheduleNextPage = async (userId: string, cursorCreatedAt: Date, cursorId: string) => {
    await MemoryExtractionWorkflowService.triggerProcessUserTopics({
      ...buildWorkflowPayloadInput({
        ...params,
        topicCursor: {
          createdAt: cursorCreatedAt.toISOString(),
          id: cursorId,
          userId,
        },
        topicIds: [],
        userId,
        userIds: [userId],
      }),
    });
  };

  for (const userId of params.userIds) {
    const topicCursor =
      params.topicCursor && params.topicCursor.userId === userId
        ? {
            createdAt: new Date(params.topicCursor.createdAt),
            id: params.topicCursor.id,
          }
        : undefined;

    const topicsFromPayload =
      params.topicIds && params.topicIds.length > 0
        ? await context.run(
            `memory:user-memory:extract:users:${userId}:filter-topic-ids`,
            async () => {
              console.log(`User ${userId} - filtering provided topic IDs for processing.`);
              const filtered = await executor.filterTopicIdsForUser(userId, params.topicIds);
              return filtered.length > 0 ? filtered : undefined;
            },
          )
        : undefined;

    console.log(`User ${userId} - starting topic processing.`);

    const topicBatch = await context.run<{
      cursor?: ListTopicsForMemoryExtractorCursor;
      ids: string[];
    }>(
      `memory:user-memory:extract:users:${userId}:list-topics:${topicCursor?.id || 'root'}`,
      () => {
        console.log(`User ${userId} - fetching topics with cursor:`, topicCursor);
        return topicsFromPayload && topicsFromPayload.length > 0
          ? Promise.resolve({ ids: topicsFromPayload })
          : executor.getTopicsForUser(
              {
                cursor: topicCursor,
                forceAll: params.forceAll,
                forceTopics: params.forceTopics,
                from: params.from,
                to: params.to,
                userId,
              },
              TOPIC_PAGE_SIZE,
            );
      },
    );

    console.log(`User ${userId} - fetched ${topicBatch.ids.length} topics for processing.`);

    const ids = topicBatch.ids;
    if (!ids.length) {
      continue;
    }

    const cursor = 'cursor' in topicBatch ? topicBatch.cursor : undefined;

    const batches = chunk(ids, TOPIC_BATCH_SIZE);
    await Promise.all(
      batches.map((topicIds, index) =>
        context.run(
          `memory:user-memory:extract:users:${userId}:process-topics-batch:${index}`,
          () =>
            MemoryExtractionWorkflowService.triggerProcessTopicBatch({
              ...buildWorkflowPayloadInput(params),
              topicCursor: undefined,
              topicIds,
              userId,
              userIds: [userId],
            }),
        ),
      ),
    );

    console.log(`User ${userId} - scheduled ${batches.length} topic batches for extraction.`);

    if (!topicsFromPayload && cursor) {
      await context.run(
        `memory:user-memory:extract:users:${userId}:topics:${cursor.id}:schedule-next-batch`,
        () => {
          console.log(`User ${userId} - scheduling next topic page with cursor:`, cursor);
          // NOTICE: Upstash Workflow only supports serializable data into plain JSON,
          // this causes the Date object to be converted into string when passed as parameter from
          // context to child workflow. So we need to convert it back to Date object here.
          const createdAt = new Date(cursor.createdAt);
          if (Number.isNaN(createdAt.getTime())) {
            throw new Error('Invalid cursor date when scheduling next topic page');
          }

          scheduleNextPage(userId, createdAt, cursor.id);
        },
      );
    }
  }

  return { processedUsers: params.userIds.length };
});
