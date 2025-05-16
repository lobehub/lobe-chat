import { RequestLog } from '@/types/usage';
import { IUsageService } from './type';
import { lambdaClient } from '@/libs/trpc/client'

import { getDetailsToken } from '@/features/Conversation/Extras/Usage/UsageDetail/tokens';
import { LobeDefaultAiModelListItem } from '@/types/aiModel';

export class ServerService implements IUsageService {
    async createRequestLog(requestLog: RequestLog): Promise<void> {
        // 计算 spend
        const metadata = requestLog?.metadata;
        let spend = 0;
        if (requestLog?.pricing && metadata) {
            const detailedToken = getDetailsToken(metadata, { pricing: requestLog.pricing } as LobeDefaultAiModelListItem)
            if (detailedToken?.totalTokens?.credit) {
                spend = detailedToken.totalTokens.credit;
            }
        }
        return lambdaClient.usage.createRequestLog.mutate({
            model: requestLog.model,
            provider: requestLog.provider,
            metadata: requestLog?.metadata,
            spend,
            callType: requestLog.callType,
        });
    }
}
