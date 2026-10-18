import { mergeRouters } from '@/libs/trpc/lambda';

import { forkRouter } from './fork';
import { publishRouter } from './publish';
import { readRouter } from './read';

export const agentRouter = mergeRouters(publishRouter, forkRouter, readRouter);

export type AgentRouter = typeof agentRouter;
