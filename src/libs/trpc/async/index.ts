import { asyncAuth } from './asyncAuth';
import { asyncTrpc } from './init';

export const publicProcedure = asyncTrpc.procedure;

export const asyncRouter = asyncTrpc.router;

export const asyncAuthedProcedure = asyncTrpc.procedure.use(asyncAuth);

export const createAsyncCallerFactory = asyncTrpc.createCallerFactory;
