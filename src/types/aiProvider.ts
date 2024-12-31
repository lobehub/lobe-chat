import { z } from 'zod';

import { SmoothingParams } from '@/types/llm';

// create
export const CreateAiProviderSchema = z.object({
  config: z.object({}).passthrough().optional(),
  description: z.string().optional(),
  id: z.string(),
  keyVaults: z.any().optional(),
  logo: z.string().optional(),
  name: z.string(),
  sdkType: z.enum(['openai', 'anthropic']).optional(),
  // checkModel: z.string().optional(),
  // homeUrl: z.string().optional(),
  // modelsUrl: z.string().optional(),
});

export type CreateAiProviderParams = z.infer<typeof CreateAiProviderSchema>;

// List Query

export interface AiProviderListItem {
  description?: string;
  enabled: boolean;
  id: string;
  logo?: string;
  name?: string;
  sort?: number;
  source: 'builtin' | 'custom';
}

// Detail Query

interface AiProviderConfig {
  /**
   * whether provider show browser request option by default
   *
   * @default false
   */
  defaultShowBrowserRequest?: boolean;
  /**
   * some provider server like stepfun and aliyun don't support browser request,
   * So we should disable it
   *
   * @default false
   */
  disableBrowserRequest?: boolean;
  proxyUrl?:
    | {
        desc?: string;
        placeholder: string;
        title?: string;
      }
    | false;

  /**
   * whether show api key in the provider config
   * so provider like ollama don't need api key field
   */
  showApiKey?: boolean;

  /**
   * whether show checker in the provider config
   */
  showChecker?: boolean;
  showDeployName?: boolean;
  showModelFetcher?: boolean;
  /**
   * whether to smoothing the output
   */
  smoothing?: SmoothingParams;
}

export interface AiProviderItem {
  /**
   * the default model that used for connection check
   */
  checkModel?: string;
  config: AiProviderConfig;
  description?: string;
  enabled: boolean;
  enabledChatModels: string[];
  /**
   * provider's website url
   */
  homeUrl?: string;
  id: string;
  logo?: string;
  /**
   * the url show the all models in the provider
   */
  modelsUrl?: string;
  /**
   * the name show for end user
   */
  name: string;
  /**
   * default openai
   */
  sdkType?: 'openai' | 'anthropic';
  source: 'builtin' | 'custom';
}

export interface AiProviderDetailItem {
  /**
   * the default model that used for connection check
   */
  checkModel?: string;
  config: AiProviderConfig;
  description?: string;
  enabled: boolean;
  fetchOnClient?: boolean;
  /**
   * provider's website url
   */
  homeUrl?: string;
  id: string;
  keyVaults?: Record<string, any>;
  logo?: string;
  /**
   * the url show the all models in the provider
   */
  modelsUrl?: string;
  /**
   * the name show for end user
   */
  name: string;
  /**
   * default openai
   */
  sdkType?: 'openai' | 'anthropic';
  source: 'builtin' | 'custom';
}

// Update
export const UpdateAiProviderConfigSchema = z.object({
  checkModel: z.string().optional(),
  fetchOnClient: z.boolean().optional(),
  keyVaults: z.object({}).passthrough().optional(),
});

export type UpdateAiProviderConfigParams = z.infer<typeof UpdateAiProviderConfigSchema>;

export interface AiProviderSortMap {
  id: string;
  sort: number;
}
