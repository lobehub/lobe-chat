import { mergeRouters } from '@/libs/trpc/lambda';

import { analyticsRouter } from './analytics';
import { readRouter } from './reads';
import { removalRouter } from './removal';
import { toolMessageRouter } from './toolMessages';
import { topicTreeRouter } from './topicTree';
import { writeRouter } from './writes';

export const messageRouter = mergeRouters(
  writeRouter,
  topicTreeRouter,
  analyticsRouter,
  readRouter,
  removalRouter,
  toolMessageRouter,
);
