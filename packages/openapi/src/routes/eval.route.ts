import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';

import { getAllScopePermissions } from '@/utils/rbac';

import { zValidator } from '../common/validator';
import { EvalController } from '../controllers/eval.controller';
import { requireAuth } from '../middleware/auth';
import { requireAnyPermission, requireApiKeyScope } from '../middleware/permission-check';
import {
  CreateEvalRunRequestSchema,
  EvalDatasetIdParamSchema,
  EvalDatasetListQuerySchema,
  EvalRunIdParamSchema,
  EvalRunListQuerySchema,
  EvalRunTopicListQuerySchema,
} from '../types/eval.type';

const app = new Hono();
const requireRead = requireAnyPermission(getAllScopePermissions('AGENT_READ'));
const requireWrite = requireAnyPermission(getAllScopePermissions('AGENT_UPDATE'));

app.post(
  '/runs',
  describeRoute({
    description: 'Queues an asynchronous QStash-backed evaluation run and returns immediately.',
    summary: 'Create an eval run',
    tags: ['eval'],
  }),
  requireAuth,
  requireWrite,
  requireApiKeyScope('model:invoke'),
  // An internal run pre-creates real chat topics through `TopicModel`, and the
  // QStash workflow keeps writing topic/message state, so a restricted key needs
  // the same `chat:write` gate as `/responses` and the tRPC agent-run entries.
  requireApiKeyScope('chat:write'),
  zValidator('json', CreateEvalRunRequestSchema),
  async (c) => new EvalController().createRun(c),
);

app.get(
  '/runs',
  describeRoute({ summary: 'List eval runs', tags: ['eval'] }),
  requireAuth,
  requireRead,
  zValidator('query', EvalRunListQuerySchema),
  async (c) => new EvalController().listRuns(c),
);

app.get(
  '/datasets',
  describeRoute({ summary: 'List eval datasets', tags: ['eval'] }),
  requireAuth,
  requireRead,
  zValidator('query', EvalDatasetListQuerySchema),
  async (c) => new EvalController().listDatasets(c),
);

app.get(
  '/datasets/:id',
  describeRoute({ summary: 'Get an eval dataset', tags: ['eval'] }),
  requireAuth,
  requireRead,
  zValidator('param', EvalDatasetIdParamSchema),
  async (c) => new EvalController().getDataset(c),
);

app.get(
  '/runs/:id/topics',
  describeRoute({ summary: 'List topic results of an eval run', tags: ['eval'] }),
  requireAuth,
  requireRead,
  zValidator('param', EvalRunIdParamSchema),
  zValidator('query', EvalRunTopicListQuerySchema),
  async (c) => new EvalController().getRunTopics(c),
);

app.get(
  '/runs/:id',
  requireAuth,
  requireRead,
  zValidator('param', EvalRunIdParamSchema),
  async (c) => new EvalController().getRun(c),
);

app.get(
  '/runs/:id/results',
  requireAuth,
  requireRead,
  zValidator('param', EvalRunIdParamSchema),
  async (c) => new EvalController().getRunResults(c),
);

export default app;
