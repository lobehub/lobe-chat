import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { MessageMetadata } from '@/types/message';
import { RequestLogSchema } from '@/types/usage';

const usageProcedure = authedProcedure.use(serverDatabase).use(async ({ ctx, next }) => {
    return next({
        ctx: {
        },
    });
});

export const usageRouter = router({
    createRequestLog: usageProcedure.input(RequestLogSchema).mutation(async ({ ctx, input }) => {
        console.log('createRequestLog', input);
        const metadata = input?.metadata as MessageMetadata;
        const SpendLog = {
            // Model 信息
            model: input.model,
            provider: input.provider,
            // Usage 信息
            metadata: input.metadata,
            // Pricing 信息
            spend: input.spend,
            // 调用信息，谁以什么方式调用了
            callType: input.callType,
            ipAddress: ctx.ip,
            userId: ctx.userId,
            orgId: undefined, //保留字段
            teamId: undefined, //保留字段
            // 性能信息
            tps: metadata?.tps,
            ttft: metadata?.ttft,
            inputStartAt: metadata?.inputStartAt,
            outputStartAt: metadata?.outputStartAt,
            outputFinishAt: metadata?.outputFinishAt,
        }
        console.log('createRequestLog', SpendLog);
        return;
    })
})