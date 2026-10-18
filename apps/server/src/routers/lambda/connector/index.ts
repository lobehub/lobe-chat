import { mergeRouters } from '@/libs/trpc/lambda';

import { agentBindingRouter } from './agentBinding';
import { bootstrapRouter } from './bootstrap';
import { connectorManagementRouter } from './management';
import { oauthRouter } from './oauth';
import { connectorReadRouter } from './reads';
import { toolRouter } from './tools';

export const connectorRouter = mergeRouters(
  connectorReadRouter,
  connectorManagementRouter,
  agentBindingRouter,
  oauthRouter,
  toolRouter,
  bootstrapRouter,
);
