import { UsageModel } from '@/database/models/usage';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { MessageMetadata } from '@/types/message';
import { RequestLogSchema } from '@/types/usage';

const usageProcedure = authedProcedure.use(serverDatabase).use(async (opts) => {
    const { ctx } = opts
    return opts.next({
        ctx: {
            usageModel: new UsageModel(ctx.serverDB, ctx.userId),
        },
    });
});

export const usageRouter = router({
    createRequestLog: usageProcedure.input(RequestLogSchema).mutation(async ({ ctx, input }) => {
        console.log('createRequestLog', input);
        const metadata = input?.metadata as MessageMetadata;
        const data = await ctx.usageModel.createSpendLog({
            model: input.model,
            provider: input.provider,
            spend: input.spend,
            callType: input.callType,
            ipAddress: ctx?.ip!,
            ttft: metadata?.ttft,
            tps: metadata?.tps,
            inputStartAt: metadata?.inputStartAt? new Date(metadata?.inputStartAt) : undefined,
            outputStartAt: metadata?.outputStartAt? new Date(metadata?.outputStartAt) : undefined,
            outputFinishAt: metadata?.outputFinishAt? new Date(metadata?.outputFinishAt) : undefined,
            totalInputTokens: metadata?.totalInputTokens,
            totalOutputTokens: metadata?.totalOutputTokens,
            totalTokens: metadata?.totalTokens,
            metadata: metadata,
        })
        return data.id;
    })
})