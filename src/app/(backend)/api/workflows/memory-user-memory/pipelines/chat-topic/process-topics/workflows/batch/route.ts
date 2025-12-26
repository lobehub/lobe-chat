import { serve } from '@upstash/workflow/nextjs';

import {
  type MemoryExtractionPayloadInput,
  normalizeMemoryExtractionPayload,
} from '@/server/services/memory/userMemory/extract';

import { orchestratorWorkflow } from '../workflows';

export const { POST } = serve<MemoryExtractionPayloadInput>(async (context) => {
  const payload = normalizeMemoryExtractionPayload(context.requestPayload || {});

  await context.invoke('memory:user-memory:extract:topics:batch', {
    body: context.requestPayload,
    workflow: orchestratorWorkflow,
  });

  return {
    processedTopics: payload.topicIds.length,
    processedUsers: payload.userIds.length,
  };
});
