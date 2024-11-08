import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

import { AsyncContext } from '@/server/asyncContext';

export const asyncTrpc = initTRPC.context<AsyncContext>().create({
  errorFormatter({ shape }) {
    return shape;
  },
  transformer: superjson,
});
