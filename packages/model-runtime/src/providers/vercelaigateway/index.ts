import { createOpenAICompatibleRuntime } from '../../core/openaiCompatibleFactory';
import { AgentRuntimeErrorType, ChatCompletionErrorPayload, ModelProvider } from '../../types';
import { processMultiProviderModelList } from '../../utils/modelParse';

export interface VercelAIGatewayModelCard {
  id: string;
}

export const LobeVercelAIGatewayAI = createOpenAICompatibleRuntime({
  baseURL: 'https://ai-gateway.vercel.sh/v1',
  chatCompletion: {
    handleError: (error: any): Omit<ChatCompletionErrorPayload, 'provider'> | undefined => {
      let errorResponse: Response | undefined;
      if (error instanceof Response) {
        errorResponse = error;
      } else if ('status' in (error as any)) {
        errorResponse = error as Response;
      }
      if (errorResponse) {
        if (errorResponse.status === 401) {
          return {
            error: errorResponse.status,
            errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
          };
        }

        if (errorResponse.status === 403) {
          return {
            error: errorResponse.status,
            errorType: AgentRuntimeErrorType.ProviderBizError,
            message:
              'Please check if your API key has sufficient balance or if you have access to the requested model.',
          };
        }
      }
      return {
        error,
      };
    },
    handlePayload: (payload) => {
      const { model, ...rest } = payload;
      return {
        ...rest,
        model,
      } as any;
    },
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_VERCELAIGATEWAY_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.ProviderBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidProviderAPIKey,
  },
  models: async ({ client }) => {
    const modelsPage = (await client.models.list()) as any;
    const modelList: VercelAIGatewayModelCard[] = modelsPage.data;

    return processMultiProviderModelList(modelList, 'vercelaigateway');
  },
  provider: ModelProvider.VercelAIGateway,
});
