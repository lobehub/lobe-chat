import { mergeRouters } from '@/libs/trpc/lambda';

import { createRouter } from './create';
import { queryRouter } from './queries';
import { removeRouter } from './remove';
import { shareRouter } from './share';
import { updateRouter } from './update';

export const topicRouter = mergeRouters(
  updateRouter,
  queryRouter,
  createRouter,
  removeRouter,
  shareRouter,
);

export type TopicRouter = typeof topicRouter;
