// RN 端简化版本的 AI 模型配置
// 基于 Web 端 src/config/aiModels/index.ts

import { AiModelType, ModelAbilities } from '@/types/aiModel';

export interface DefaultAiModel {
  abilities: ModelAbilities;
  contextWindowTokens?: number;
  displayName?: string;
  enabled: boolean;
  id: string;
  name?: string;
  providerId: string;
  type: AiModelType;
}

// 简化的默认 AI 模型列表
export const LOBE_DEFAULT_MODEL_LIST: DefaultAiModel[] = [
  // OpenAI Models
  {
    abilities: {
      files: true,
      functionCall: true,
      vision: false,
    },
    contextWindowTokens: 8192,
    displayName: 'GPT-4',
    enabled: true,
    id: 'gpt-4',
    providerId: 'openai',
    type: 'chat',
  },
  {
    abilities: {
      files: true,
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 128_000,
    displayName: 'GPT-4 Turbo',
    enabled: true,
    id: 'gpt-4-turbo',
    providerId: 'openai',
    type: 'chat',
  },
  {
    abilities: {
      files: false,
      functionCall: true,
      vision: false,
    },
    contextWindowTokens: 16_385,
    displayName: 'GPT-3.5 Turbo',
    enabled: true,
    id: 'gpt-3.5-turbo',
    providerId: 'openai',
    type: 'chat',
  },
  {
    abilities: {
      files: false,
      functionCall: false,
      vision: false,
    },
    displayName: 'DALL-E 3',
    enabled: true,
    id: 'dall-e-3',
    providerId: 'openai',
    type: 'image',
  },

  // Anthropic Models
  {
    abilities: {
      files: true,
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    displayName: 'Claude 3 Opus',
    enabled: true,
    id: 'claude-3-opus',
    providerId: 'anthropic',
    type: 'chat',
  },
  {
    abilities: {
      files: true,
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 200_000,
    displayName: 'Claude 3 Sonnet',
    enabled: true,
    id: 'claude-3-sonnet',
    providerId: 'anthropic',
    type: 'chat',
  },

  // Google Models
  {
    abilities: {
      files: false,
      functionCall: true,
      vision: false,
    },
    contextWindowTokens: 32_768,
    displayName: 'Gemini Pro',
    enabled: true,
    id: 'gemini-pro',
    providerId: 'google',
    type: 'chat',
  },
  {
    abilities: {
      files: false,
      functionCall: true,
      vision: true,
    },
    contextWindowTokens: 32_768,
    displayName: 'Gemini Pro Vision',
    enabled: true,
    id: 'gemini-pro-vision',
    providerId: 'google',
    type: 'chat',
  },
];
