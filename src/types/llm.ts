import { ReactNode } from 'react';

import { AiModelType, ChatModelPricing } from '@/types/aiModel';
import { AiProviderSettings } from '@/types/aiProvider';

export type ModelPriceCurrency = 'CNY' | 'USD';

export interface ChatModelCard {
  /**
   * the context window (or input + output tokens limit)
   */
  contextWindowTokens?: number;
  /**
   * only used in azure
   */
  deploymentName?: string;
  description?: string;
  /**
   * the name show for end user
   */
  displayName?: string;
  /**
   * whether model is enabled by default
   */
  enabled?: boolean;
  /**
   * whether model supports file upload
   */
  files?: boolean;
  /**
   * whether model supports function call
   */
  functionCall?: boolean;
  id: string;
  /**
   * whether model is custom
   */
  isCustom?: boolean;
  /**
   * whether model is legacy (deprecated but not removed yet)
   */
  legacy?: boolean;
  maxOutput?: number;
  pricing?: ChatModelPricing;

  /**
   *  whether model supports reasoning
   */
  reasoning?: boolean;

  /**
   * the date when model is released
   */
  releasedAt?: string;

  type?: AiModelType;

  /**
   *  whether model supports vision
   */
  vision?: boolean;
}

export type ResponseAnimationStyle = 'smooth' | 'fadeIn' | 'none';
export type ResponseAnimation =
  | {
      speed?: number;
      text?: ResponseAnimationStyle;
      toolsCalling?: ResponseAnimationStyle;
    }
  | ResponseAnimationStyle;

export interface ModelProviderCard {
  /**
   * url to get api key
   */
  apiKeyUrl?: string;
  /**
   * @deprecated
   */
  chatModels: ChatModelCard[];
  /**
   * the default model that used for connection check
   */
  checkModel?: string;
  /**
   * whether provider show browser request option by default
   * @deprecated
   * @default false
   */
  defaultShowBrowserRequest?: boolean;
  description?: string;
  /**
   * some provider server like stepfun and aliyun don't support browser request,
   * So we should disable it
   * @deprecated
   * @default false
   */
  disableBrowserRequest?: boolean;
  /**
   * whether provider is enabled by default
   */
  enabled?: boolean;
  id: string;
  /**
   * @deprecated
   */
  modelList?: {
    azureDeployName?: boolean;
    notFoundContent?: ReactNode;
    placeholder?: string;
    showModelFetcher?: boolean;
  };
  /**
   * the url show the all models in the provider
   */
  modelsUrl?: string;
  /**
   * the name show for end user
   */
  name: string;
  /**
   * @deprecated
   */
  proxyUrl?:
    | {
        desc?: string;
        placeholder: string;
        title?: string;
      }
    | false;

  settings: AiProviderSettings;
  /**
   * whether show api key in the provider config
   * so provider like ollama don't need api key field
   * @deprecated
   */
  showApiKey?: boolean;
  /**
   * whether show checker in the provider config
   * @deprecated
   */
  showChecker?: boolean;
  /**
   * whether to show the provider config
   */
  showConfig?: boolean;
  /**
   * provider's website url
   */
  url: string;
}

// 语言模型的设置参数
export interface LLMParams {
  /**
   * 控制生成文本中的惩罚系数，用于减少重复性
   * @default 0
   */
  frequency_penalty?: number;
  /**
   * 生成文本的最大长度
   */
  max_tokens?: number;
  /**
   * 控制生成文本中的惩罚系数，用于减少主题的变化
   * @default 0
   */
  presence_penalty?: number;
  /**
   * 生成文本的随机度量，用于控制文本的创造性和多样性
   * @default 1
   */
  reasoning_effort?: string;
  /**
   * 控制模型推理能力
   * @default medium
   */
  temperature?: number;
  /**
   * 控制生成文本中最高概率的单个 token
   * @default 1
   */
  top_p?: number;
}

export type LLMRoleType = 'user' | 'system' | 'assistant' | 'tool';

export interface LLMMessage {
  content: string;
  role: LLMRoleType;
}

export type FewShots = LLMMessage[];
