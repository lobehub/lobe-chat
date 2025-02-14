import { z } from 'zod';

import { AiModelConfig, AiModelType, ModelAbilities } from '@/types/aiModel';
import { SmoothingParams } from '@/types/llm';

export const AiProviderSourceEnum = {
  Builtin: 'builtin',
  Custom: 'custom',
} as const;
export type AiProviderSourceType = (typeof AiProviderSourceEnum)[keyof typeof AiProviderSourceEnum];

/**
 * only when provider use different sdk
 * we will add a type
 */
export const AiProviderSDKEnum = {
  Anthropic: 'anthropic',
  Azure: 'azure',
  Bedrock: 'bedrock',
  Cloudflare: 'cloudflare',
  Doubao: 'doubao',
  Google: 'google',
  Huggingface: 'huggingface',
  Ollama: 'ollama',
  Openai: 'openai',
} as const;

export type AiProviderSDKType = (typeof AiProviderSDKEnum)[keyof typeof AiProviderSDKEnum];

// create
export const CreateAiProviderSchema = z.object({
  config: z.object({}).passthrough().optional(),
  description: z.string().optional(),
  id: z.string(),
  keyVaults: z.any().optional(),
  logo: z.string().optional(),
  name: z.string(),
  sdkType: z.enum(['openai', 'anthropic']).optional(),
  source: z.enum(['builtin', 'custom']),
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
  source: AiProviderSourceType;
}

// Detail Query

export interface AiProviderSettings {
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
  /**
   * whether provider support edit model
   *
   * @default true
   */
  modelEditable?: boolean;

  proxyUrl?:
    | {
        desc?: string;
        placeholder: string;
        title?: string;
      }
    | false;

  /**
   * default openai
   */
  sdkType?: AiProviderSDKType;
  showAddNewModel?: boolean;
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

export interface AiProviderCard {
  /**
   * the default model that used for connection check
   */
  checkModel?: string;
  config: AiProviderSettings;
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
}

export interface AiProviderDetailItem {
  /**
   * the default model that used for connection check
   */
  checkModel?: string;
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
  settings: AiProviderSettings;
  source: AiProviderSourceType;
}

// Update
export const UpdateAiProviderSchema = z.object({
  config: z.object({}).passthrough().optional(),
  description: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  name: z.string(),
  sdkType: z.enum(['openai', 'anthropic']).optional(),
});

export type UpdateAiProviderParams = z.infer<typeof UpdateAiProviderSchema>;

export const UpdateAiProviderConfigSchema = z.object({
  checkModel: z.string().optional(),
  fetchOnClient: z.boolean().nullable().optional(),
  keyVaults: z.object({}).passthrough().optional(),
});

export type UpdateAiProviderConfigParams = z.infer<typeof UpdateAiProviderConfigSchema>;

export interface AiProviderSortMap {
  id: string;
  sort: number;
}

// --------

export interface EnabledProvider {
  id: string;
  logo?: string;
  name?: string;
  source: AiProviderSourceType;
}

export interface EnabledAiModel {
  abilities: ModelAbilities;
  config?: AiModelConfig;
  contextWindowTokens?: number;
  displayName?: string;
  enabled?: boolean;
  id: string;
  providerId: string;
  sort?: number;
  type: AiModelType;
}

export interface AiProviderRuntimeConfig {
  fetchOnClient?: boolean;
  keyVaults: Record<string, string>;
  settings: AiProviderSettings;
}

export interface AiProviderRuntimeState {
  enabledAiModels: EnabledAiModel[];
  enabledAiProviders: EnabledProvider[];
  runtimeConfig: Record<string, AiProviderRuntimeConfig>;
}
