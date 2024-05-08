/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory } from '@/libs/trpc';

import { appRouter } from './routers';

export const createCaller = createCallerFactory(appRouter);
