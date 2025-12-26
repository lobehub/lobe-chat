import { serveMany } from '@upstash/workflow/nextjs';

import { TOPIC_WORKFLOW_NAMES } from '@/server/services/memory/userMemory/extract';
import { cepWorkflow, identityWorkflow, orchestratorWorkflow } from '../workflows';

export const { POST } = serveMany({
  [TOPIC_WORKFLOW_NAMES.orchestrator]: orchestratorWorkflow,
  [TOPIC_WORKFLOW_NAMES.cep]: cepWorkflow,
  [TOPIC_WORKFLOW_NAMES.identity]: identityWorkflow,
});
