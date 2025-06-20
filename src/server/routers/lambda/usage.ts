import { UsageModel } from '@/database/models/usage';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const usageProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
    const { ctx } = opts
    return opts.next({
        ctx: {
            usageModel: new UsageModel(ctx.serverDB, ctx.userId),
        },
    });
});

export const usageRouter = router({
    getSpendLogs: usageProcedure.query(async ({ ctx }) => {
        return await ctx.usageModel.getSpendLogs();
    }),

    getUsages: usageProcedure.query(async ({ ctx }) => {
        return await ctx.usageModel.getUsages();
    }),
})