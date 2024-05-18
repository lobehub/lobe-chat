/**
 * This file contains the root router of your tRPC-backend
 */
import { createCallerFactory } from '@/libs/trpc';

import { edgeRouter } from './routers';

export const createCaller = createCallerFactory(edgeRouter);
