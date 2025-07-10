import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

import { AsyncContext } from './context';

export const asyncTrpc = initTRPC.context<AsyncContext>().create({
  errorFormatter({ shape }) {
    return shape;
  },
  transformer: superjson,
});
