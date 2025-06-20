import { LOBE_DEFAULT_MODEL_LIST } from '@/config/aiModels';
import { AiModelModel } from '@/database/models/aiModel';
import { CreateSpendLogParams, UsageModel } from '@/database/models/usage';
import { LobeChatDatabase } from '@/database/type';
import { getDetailsToken } from '@/features/Conversation/Extras/Usage/UsageDetail/tokens';
import { AiProviderModelListItem, LobeDefaultAiModelListItem } from '@/types/aiModel';
import debug from 'debug';

const log = debug('lobe-usage:service');

export class UsageService {
    private db: LobeChatDatabase;
    constructor(db: LobeChatDatabase) {
        this.db = db;
    }

    createSpendLog = async (data: any) => {
        log('Creating spend log with usage:', data);
        if (!data?.userId) {
            log('User ID is required to create a spend log');
            throw new Error('User ID is required to create a spend log');
        }
        const usageModel = new UsageModel(this.db, data.userId);
        const aiModelModel = new AiModelModel(this.db, data.userId);
        const modelList = await aiModelModel.getModelListByProviderId(data.provider)
        log(`Found ${modelList.length} models for provider ${data.provider}`)
        let model = modelList.find((model) => model.id === data.model);
        if (!model || !model?.pricing) {
            try {
                log(`Model with ID ${data.model} not found for provider ${data.provider}, trying to find in default models`);
                const modelListItem = LOBE_DEFAULT_MODEL_LIST.find((model) => model.id === data.model && model.providerId === data.provider);
                if (modelListItem) {
                    model = modelListItem as AiProviderModelListItem;
                }
            } catch { }
            if (!model || !model?.pricing) {
                log(`Model with ID ${data.model} not found in default models for provider ${data.provider}`);
                throw new Error(`Model with ID ${data.model} not found for provider ${data.provider}`);
            }
        }
        let spend = 0;
        if (model?.pricing && data?.usage) {
            const detailedToken = getDetailsToken(data.usage, { pricing: model.pricing } as LobeDefaultAiModelListItem);
            if (detailedToken?.totalTokens?.credit) {
                spend = detailedToken.totalTokens.credit;
            }
        }

        const params: CreateSpendLogParams = {
            model: data.model,
            provider: data.provider,
            spend: spend, // Default to 0 if spend is not provided
            callType: 'chat', // Assuming this is a chat log, adjust as necessary
            ipAddress: data?.ipAddress || '', // Default to empty string if not provided
            ttft: data?.speed?.ttft || 0, // Total time from first token to last token
            tps: data?.speed?.tps || 0, // Total processing speed
            inputStartAt: data?.speed?.inputStartAt ? new Date(data?.speed?.inputStartAt) : undefined,
            outputStartAt: data?.speed?.outputStartAt ? new Date(data?.speed?.outputStartAt) : undefined,
            outputFinishAt: data?.speed?.outputFinishAt ? new Date(data?.speed?.outputFinishAt) : undefined,
            totalInputTokens: data.usage?.totalInputTokens || 0,
            totalOutputTokens: data.usage?.totalOutputTokens || 0,
            totalTokens: (data.usage?.totalInputTokens || 0) + (data.usage?.totalOutputTokens || 0),
            metadata: data?.usage && data?.speed ? { ...data?.usage, ...data?.speed } : {},
        }
        return await usageModel.createSpendLog(params)
    }
}