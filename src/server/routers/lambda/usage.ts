import { z } from 'zod';
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
    getSpendLogs: usageProcedure.input(z.object({
        mo: z.string().optional(),
    })).query(async ({ ctx, input }) => {
        return await ctx.usageModel.getSpendLogs(input.mo);
    }),

    getUsages: usageProcedure.input(z.object({
        mo: z.string().optional(),
    })).query(async ({ ctx, input }) => {
        return await ctx.usageModel.getUsages(input.mo);
    }),
})