import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { processMultiProviderModelList } from '../utils/modelParse';
import { createOpenAICompatibleRuntime } from '../utils/openaiCompatibleFactory';
import { PerformanceTimer, cometAPIMonitor } from './monitor';
import { CometAPIModelCard } from './type';

const formatPrice = (price: string) => {
  if (price === '-1') return undefined;
  return Number((Number(price) * 1e6).toPrecision(5));
};

/**
 * CometAPI-specific error handler
 * Enhanced error handling for production readiness
 */
const handleCometAPIError = (error: any) => {
  // Log error for monitoring (with API key redacted)
  const sanitizedError = {
    ...error,
    headers: error.headers ? { ...error.headers, authorization: '[REDACTED]' } : undefined,
  };

  if (process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1') {
    console.debug('[CometAPI Error]', sanitizedError);
  }

  // Record error in monitoring system
  const errorType = error.status ? `HTTP_${error.status}` : 'UNKNOWN_ERROR';
  cometAPIMonitor.recordError(errorType, error.message || 'Unknown error');

  // Handle specific CometAPI error types
  if (error.status === 401) {
    return {
      error: {
        message: 'Invalid CometAPI API key or authentication failed',
        status: 401,
        type: 'authentication_error',
      },
      errorType: AgentRuntimeErrorType.InvalidProviderAPIKey,
    };
  }

  if (error.status === 429) {
    return {
      error: {
        message: 'CometAPI rate limit exceeded. Please try again later.',
        retryAfter: error.headers?.['retry-after'] || '60',
        status: 429,
        type: 'rate_limit_error',
      },
      errorType: AgentRuntimeErrorType.QuotaLimitReached,
    };
  }

  if (error.status === 402) {
    return {
      error: {
        message: 'Insufficient quota for CometAPI. Please check your account balance.',
        status: 402,
        type: 'quota_error',
      },
      errorType: AgentRuntimeErrorType.InsufficientQuota,
    };
  }

  if (error.status === 404) {
    return {
      error: {
        message: 'The requested model is not available on CometAPI.',
        status: 404,
        type: 'model_not_found',
      },
      errorType: AgentRuntimeErrorType.ModelNotFound,
    };
  }

  if (error.status >= 500) {
    return {
      error: {
        message: 'CometAPI service temporarily unavailable. Please try again later.',
        status: error.status,
        type: 'server_error',
      },
      errorType: AgentRuntimeErrorType.ProviderBizError,
    };
  }

  // Default error handling
  return {
    error: {
      message: error.message || 'Unknown CometAPI error occurred',
      status: error.status || 500,
      type: 'unknown_error',
    },
    errorType: AgentRuntimeErrorType.ProviderBizError,
  };
};

/**
 * Enhanced streaming error detection for CometAPI
 */
const handleStreamBizErrorType = (error: {
  message: string;
  name: string;
}): ILobeAgentRuntimeErrorType | undefined => {
  // Monitor and categorize streaming errors
  if (process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1') {
    console.debug('[CometAPI Stream Error]', { message: error.message, name: error.name });
  }

  if (error.message?.includes('rate limit') || error.message?.includes('429')) {
    return AgentRuntimeErrorType.QuotaLimitReached;
  }

  if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
    return AgentRuntimeErrorType.InvalidProviderAPIKey;
  }

  if (error.message?.includes('model not found') || error.message?.includes('404')) {
    return AgentRuntimeErrorType.ModelNotFound;
  }

  if (error.message?.includes('context') || error.message?.includes('token limit')) {
    return AgentRuntimeErrorType.ExceededContextWindow;
  }

  return AgentRuntimeErrorType.ProviderBizError;
};

/**
 * Enhanced payload handler with monitoring
 */
const handlePayload = (payload: any) => {
  const startTime = Date.now();
  const requestId = `cometapi_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  // Log request for monitoring (with sensitive data redacted)
  if (process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1') {
    console.debug('[CometAPI Request]', {
      maxTokens: payload.max_tokens,
      messageCount: payload.messages?.length,
      model: payload.model,
      requestId,
      stream: payload.stream,
      temperature: payload.temperature,
      timestamp: new Date().toISOString(),
    });
  }

  // Start performance timer
  const timer = new PerformanceTimer(requestId);

  // Performance monitoring
  const enhancedPayload = {
    ...payload,
    // Add request ID for tracking
    metadata: {
      requestId,
      startTime,
      timer, // Include timer for completion tracking
    },
    stream: payload.stream ?? true,
  };

  return enhancedPayload;
};

export const LobeCometAI = createOpenAICompatibleRuntime({
  baseURL: 'https://api.cometapi.com/v1',
  chatCompletion: {
    handleError: handleCometAPIError,
    handlePayload: handlePayload,
    handleStreamBizErrorType: handleStreamBizErrorType,
  },
  constructorOptions: {
    defaultHeaders: {
      'HTTP-Referer': 'https://lobehub.com',
      'User-Agent': 'LobeHub/1.0 CometAPI-Integration',
      'X-Source': 'LobeHub',
    },
    // Enhanced timeout configuration for production
    timeout: 60_000, // 60 seconds for chat completion
  },
  debug: {
    chatCompletion: () => process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1',
  },
  models: async ({ client }) => {
    const startTime = Date.now();

    try {
      if (process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1') {
        console.debug('[CometAPI Models] Fetching model list...');
      }

      // Following OpenRouter dynamic model discovery pattern with timeout
      const modelsPage = (await Promise.race([
        client.models.list(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Model list request timeout')), 10_000);
        }),
      ])) as any;

      const modelList: CometAPIModelCard[] = modelsPage.data;

      if (process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1') {
        const duration = Date.now() - startTime;
        console.debug(`[CometAPI Models] Fetched ${modelList.length} models in ${duration}ms`);
      }

      // Transform CometAPI models to standard format with enhanced error handling
      const formattedModels = modelList.map((model) => {
        try {
          return {
            contextWindowTokens: model.context_length || 4096, // Default fallback
            description: model.description || `CometAPI model: ${model.name}`,
            displayName: model.name || model.id,
            functionCall:
              (model.description &&
                (model.description.includes('function calling') ||
                  model.description.includes('tools'))) ||
              false,
            id: model.id,
            maxOutput:
              typeof model.top_provider?.max_completion_tokens === 'number'
                ? model.top_provider.max_completion_tokens
                : undefined,
            pricing: {
              currency: 'USD' as const,
              units: [
                {
                  name: 'textInput' as const,
                  rate: formatPrice(model.pricing?.prompt || '0') || 0,
                  strategy: 'fixed' as const,
                  unit: 'millionTokens' as const,
                },
                {
                  name: 'textOutput' as const,
                  rate: formatPrice(model.pricing?.completion || '0') || 0,
                  strategy: 'fixed' as const,
                  unit: 'millionTokens' as const,
                },
              ],
            },
            releasedAt: model.created
              ? new Date(model.created * 1000).toISOString().split('T')[0]
              : new Date().toISOString().split('T')[0],
            vision: false, // To be updated based on CometAPI model capabilities
          };
        } catch (modelError) {
          if (process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1') {
            console.debug(`[CometAPI Models] Error processing model ${model.id}:`, modelError);
          }
          // Return a minimal valid model object
          return {
            contextWindowTokens: 4096,
            description: `Error processing model: ${model.id}`,
            displayName: model.id,
            functionCall: false,
            id: model.id,
            pricing: {
              currency: 'USD' as const,
              units: [
                {
                  name: 'textInput' as const,
                  rate: 0,
                  strategy: 'fixed' as const,
                  unit: 'millionTokens' as const,
                },
                {
                  name: 'textOutput' as const,
                  rate: 0,
                  strategy: 'fixed' as const,
                  unit: 'millionTokens' as const,
                },
              ],
            },
            releasedAt: new Date().toISOString().split('T')[0],
            vision: false,
          };
        }
      });

      // Filter out invalid models
      const validModels = formattedModels.filter((model) => model.id && model.displayName);

      if (process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1') {
        console.debug(
          `[CometAPI Models] Processed ${validModels.length}/${modelList.length} valid models`,
        );
      }

      return await processMultiProviderModelList(validModels, 'cometapi');
    } catch (error) {
      if (process.env.DEBUG_COMETAPI_CHAT_COMPLETION === '1') {
        console.debug('[CometAPI Models] Error fetching models:', error);
      }

      // Return empty array instead of throwing to prevent UI breaking
      console.warn('CometAPI: Failed to fetch models, using empty list');
      return [];
    }
  },
  provider: ModelProvider.CometAPI,
});
