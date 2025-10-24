import { LOBE_DEFAULT_MODEL_LIST, ModelProvider } from 'model-bank';
import urlJoin from 'url-join';

import { responsesAPIModels } from '../../const/models';
import { createRouterRuntime } from '../../core/RouterRuntime';
import { CreateRouterRuntimeOptions } from '../../core/RouterRuntime/createRuntime';
import { detectModelProvider, processMultiProviderModelList } from '../../utils/modelParse';

export interface NewAPIModelCard {
  created: number;
  id: string;
  object: string;
  owned_by: string;
  supported_endpoint_types?: string[];
}

export interface NewAPIPricing {
  completion_ratio?: number;
  enable_groups: string[];
  model_name: string;
  model_price?: number;
  model_ratio?: number;
  /** 0: Pay-per-token, 1: Pay-per-call */
  quota_type: number;
  supported_endpoint_types?: string[];
}

export const params = {
  debug: {
    chatCompletion: () => process.env.DEBUG_NEWAPI_CHAT_COMPLETION === '1',
  },
  defaultHeaders: {
    'X-Client': 'LobeHub',
  },
  id: ModelProvider.NewAPI,
  models: async ({ client: openAIClient }) => {
    // Get base URL (remove trailing API version paths like /v1, /v1beta, etc.)
    const baseURL = openAIClient.baseURL.replace(/\/v\d+[a-z]*\/?$/, '');

    const modelsPage = (await openAIClient.models.list()) as any;
    const modelList: NewAPIModelCard[] = modelsPage.data || [];

    // Try to get pricing information to enrich model details
    let pricingMap: Map<string, NewAPIPricing> = new Map();
    try {
      // Use saved baseURL
      const pricingResponse = await fetch(`${baseURL}/api/pricing`, {
        headers: {
          Authorization: `Bearer ${openAIClient.apiKey}`,
        },
      });

      if (pricingResponse.ok) {
        const pricingData = await pricingResponse.json();
        if (pricingData.success && pricingData.data) {
          (pricingData.data as NewAPIPricing[]).forEach((pricing) => {
            pricingMap.set(pricing.model_name, pricing);
          });
        }
      }
    } catch (error) {
      // If fetching pricing information fails, continue using the basic model information
      console.debug('Failed to fetch NewAPI pricing info:', error);
    }

    // Process the model list: determine the provider for each model based on priority rules
    const enrichedModelList = modelList.map((model) => {
      let enhancedModel: any = { ...model };

      // add pricing info
      const pricing = pricingMap.get(model.id);
      if (pricing) {
        // NewAPI pricing calculation logic:
        // - quota_type: 0 means pay-per-token, 1 means pay-per-call
        // - model_ratio: multiplier relative to base price (base price = $0.002/1K tokens)
        // - model_price: directly specified price (takes priority)
        // - completion_ratio: output price multiplier relative to input price
        //
        // LobeChat required format: USD per million tokens

        let inputPrice: number | undefined;
        let outputPrice: number | undefined;

        if (pricing.quota_type === 0) {
          // Pay-per-token
          if (pricing.model_price && pricing.model_price > 0) {
            // model_price is a direct price value; need to confirm its unit.
            // Assumption: model_price is the price per 1,000 tokens (i.e., $/1K tokens).
            // To convert to price per 1,000,000 tokens ($/1M tokens), multiply by 1,000,000 / 1,000 = 1,000.
            // Since the base price is $0.002/1K tokens, multiplying by 2 gives $2/1M tokens.
            // Therefore, inputPrice = model_price * 2 converts the price to $/1M tokens for LobeChat.
            inputPrice = pricing.model_price * 2;
          } else if (pricing.model_ratio) {
            // model_ratio × $0.002/1K = model_ratio × $2/1M
            inputPrice = pricing.model_ratio * 2; // Convert to $/1M tokens
          }

          if (inputPrice !== undefined) {
            // Calculate output price
            outputPrice = inputPrice * (pricing.completion_ratio || 1);

            enhancedModel.pricing = {
              units: [
                {
                  name: 'textInput',
                  rate: inputPrice,
                  strategy: 'fixed',
                  unit: 'millionTokens',
                },
                {
                  name: 'textOutput',
                  rate: outputPrice,
                  strategy: 'fixed',
                  unit: 'millionTokens',
                },
              ],
            };
          }
        }
        // quota_type === 1 pay-per-call is not currently supported
      }

      return enhancedModel;
    });

    return processMultiProviderModelList(enrichedModelList, 'newapi');
  },
  routers: (options) => {
    const userBaseURL = options.baseURL?.replace(/\/v\d+[a-z]*\/?$/, '') || '';

    return [
      {
        apiType: 'anthropic',
        models: LOBE_DEFAULT_MODEL_LIST.map((m) => m.id).filter(
          (id) => detectModelProvider(id) === 'anthropic',
        ),
        options: {
          ...options,
          baseURL: userBaseURL,
        },
      },
      {
        apiType: 'google',
        models: LOBE_DEFAULT_MODEL_LIST.map((m) => m.id).filter(
          (id) => detectModelProvider(id) === 'google',
        ),
        options: {
          ...options,
          baseURL: userBaseURL,
        },
      },
      {
        apiType: 'xai',
        models: LOBE_DEFAULT_MODEL_LIST.map((m) => m.id).filter(
          (id) => detectModelProvider(id) === 'xai',
        ),
        options: {
          ...options,
          baseURL: urlJoin(userBaseURL, '/v1'),
        },
      },
      {
        apiType: 'openai',
        options: {
          ...options,
          baseURL: urlJoin(userBaseURL, '/v1'),
          chatCompletion: {
            useResponseModels: [...Array.from(responsesAPIModels), /gpt-\d(?!\d)/, /^o\d/],
          },
        },
      },
    ];
  },
} satisfies CreateRouterRuntimeOptions;

export const LobeNewAPIAI = createRouterRuntime(params);
