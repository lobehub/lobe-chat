import { mergeRouters } from '@/libs/trpc/lambda';

import { crudRouter } from './crud';
import { editSessionRouter } from './editSession';
import { workspaceRouter } from './workspace';

export const documentRouter = mergeRouters(crudRouter, editSessionRouter, workspaceRouter);
