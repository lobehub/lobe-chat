/**
 * This file contains the root router of Lobe Chat tRPC-backend
 */
import { publicProcedure, router } from '@/libs/trpc';

// router that connect to db
import { fileRouter } from './file';
import { importerRouter } from './importer';
import { messageRouter } from './message';
import { pluginRouter } from './plugin';
import { sessionRouter } from './session';
import { sessionGroupRouter } from './sessionGroup';
import { topicRouter } from './topic';
import { userRouter } from './user';

export const lambdaRouter = router({
  file: fileRouter,
  healthcheck: publicProcedure.query(() => "i'm live!"),
  importer: importerRouter,
  message: messageRouter,
  plugin: pluginRouter,
  session: sessionRouter,
  sessionGroup: sessionGroupRouter,
  topic: topicRouter,
  user: userRouter,
});

export type LambdaRouter = typeof lambdaRouter;
