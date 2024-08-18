/**
 * This file contains the root router of Lobe Chat tRPC-backend
 */
import { publicProcedure, router } from '@/libs/trpc';

import { agentRouter } from './agent';
import { chunkRouter } from './chunk';
// router that connect to db
import { fileRouter } from './file';
import { importerRouter } from './importer';
import { knowledgeBaseRouter } from './knowledgeBase';
import { messageRouter } from './message';
import { pluginRouter } from './plugin';
import { sessionRouter } from './session';
import { sessionGroupRouter } from './sessionGroup';
import { topicRouter } from './topic';
import { userRouter } from './user';

export const lambdaRouter = router({
  agent: agentRouter,
  chunk: chunkRouter,
  file: fileRouter,
  healthcheck: publicProcedure.query(() => "i'm live!"),
  importer: importerRouter,
  knowledgeBase: knowledgeBaseRouter,
  message: messageRouter,
  plugin: pluginRouter,
  session: sessionRouter,
  sessionGroup: sessionGroupRouter,
  topic: topicRouter,
  user: userRouter,
});

export type LambdaRouter = typeof lambdaRouter;
