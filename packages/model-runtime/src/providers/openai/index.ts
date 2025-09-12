import { ModelProvider } from '../../const/modelProvider';
import { responsesAPIModels } from '../../const/models';
import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { ChatStreamPayload } from '../../types';
import { processMultiProviderModelList } from '../../utils/modelParse';
import { pruneReasoningPayload } from '../../utils/openaiHelpers';

export interface OpenAIModelCard {
  id: string;
}

const prunePrefixes = ['o1', 'o3', 'o4', 'codex', 'computer-use', 'gpt-5'];
const oaiSearchContextSize = process.env.OPENAI_SEARCH_CONTEXT_SIZE; // low, medium, high
const enableServiceTierFlex = process.env.OPENAI_SERVICE_TIER_FLEX === '1';
const flexSupportedModels = ['gpt-5', 'o3', 'o4-mini']; // Flex 处理仅适用于这些模型

const supportsFlexTier = (model: string) => {
  // 排除 o3-mini，其不支持 Flex 处理
  if (model.startsWith('o3-mini')) {
    return false;
  }
  return flexSupportedModels.some((supportedModel) => model.startsWith(supportedModel));
};

export const LobeOpenAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.openai.com/v1',
  chatCompletion: {
    handlePayload: (payload) => {
      const { enabledSearch, model, ...rest } = payload;

      if (responsesAPIModels.has(model) || enabledSearch) {
        return { ...rest, apiMode: 'responses', enabledSearch, model } as ChatStreamPayload;
      }

      if (prunePrefixes.some((prefix) => model.startsWith(prefix))) {
        return pruneReasoningPayload(payload) as any;
      }

      if (model.includes('-search-')) {
        return {
          ...rest,
          frequency_penalty: undefined,
          model,
          presence_penalty: undefined,
          ...(enableServiceTierFlex && supportsFlexTier(model) && { service_tier: 'flex' }),
          stream: payload.stream ?? true,
          temperature: undefined,
          top_p: undefined,
          ...(oaiSearchContextSize && {
            web_search_options: {
              search_context_size: oaiSearchContextSize,
            },
          }),
        } as any;
      }

      return {
        ...rest,
        model,
        ...(enableServiceTierFlex && supportsFlexTier(model) && { service_tier: 'flex' }),
        stream: payload.stream ?? true,
      };
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_OPENAI_CHAT_COMPLETION === '1',
    responses: () => process.env.DEBUG_OPENAI_RESPONSES === '1',
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: OpenAIModelCard[] = modelsPage.data;

    // 自动检测模型提供商并选择相应配置
    return processMultiProviderModelList(modelList, 'openai');
  },
  provider: ModelProvider.OpenAI,
  responses: {
    handlePayload: (payload) => {
      const { enabledSearch, model, tools, verbosity, ...rest } = payload;

      const openaiTools = enabledSearch
        ? [
            ...(tools || []),
            {
              type: 'web_search_preview',
              ...(oaiSearchContextSize && {
                search_context_size: oaiSearchContextSize,
              }),
            },
          ]
        : tools;

      if (prunePrefixes.some((prefix) => model.startsWith(prefix))) {
        return pruneReasoningPayload({
          ...rest,
          model,
          reasoning: payload.reasoning
            ? { ...payload.reasoning, summary: 'auto' }
            : { summary: 'auto' },
          ...(enableServiceTierFlex && supportsFlexTier(model) && { service_tier: 'flex' }),
          stream: payload.stream ?? true,
          tools: openaiTools as any,
          // computer-use series must set truncation as auto
          ...(model.startsWith('computer-use') && { truncation: 'auto' }),
          text: verbosity ? { verbosity } : undefined,
        }) as any;
      }

      return {
        ...rest,
        model,
        ...(enableServiceTierFlex && supportsFlexTier(model) && { service_tier: 'flex' }),
        stream: payload.stream ?? true,
        tools: openaiTools,
      } as any;
    },
  },
});
