import { z } from 'zod';
import { UsageRecordModel } from '@/database/models/usage';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';

const usageProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
    const { ctx } = opts
    return opts.next({
        ctx: {
            usageRecordsModel: new UsageRecordModel(ctx.serverDB, ctx.userId),
        },
    });
});

export const usageRouter = router({
    findByMonth: usageProcedure.input(z.object({
        mo: z.string().optional(),
    })).query(async ({ ctx, input }) => {
        return await ctx.usageRecordsModel.findByMonth(input.mo);
    }),

    findAndGroupByDay: usageProcedure.input(z.object({
        mo: z.string().optional(),
    })).query(async ({ ctx, input }) => {
        return await ctx.usageRecordsModel.findAndGroupByDay(input.mo);
    }),
})