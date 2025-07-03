import { z } from 'zod';

import { AiModelSelectItem } from '@/database/schemas';
import { AiFullModelCard, AiModelSourceType } from '@/types/aiModel';

// Request schemas
export const GetModelConfigRequestSchema = z.object({
  model: z.string().min(1, '模型名称不能为空'),
  provider: z.string().min(1, '提供商不能为空'),
});

export type GetModelConfigRequest = z.infer<typeof GetModelConfigRequestSchema>;

export const GetModelConfigBySessionRequestSchema = z.object({
  sessionId: z.string().min(1, '会话ID不能为空'),
});

export type GetModelConfigBySessionRequest = z.infer<typeof GetModelConfigBySessionRequestSchema>;

export const GetModelsRequestSchema = z.object({
  enabled: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional(),
  groupedByProvider: z
    .string()
    .optional()
    .default('true')
    .transform((val) => val === 'true'),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .optional(),
  pageSize: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(200))
    .optional(),
  provider: z.string().optional(),
  type: z
    .enum(['chat', 'embedding', 'tts', 'stt', 'image', 'text2video', 'text2music', 'realtime'])
    .optional(),
});

export interface GetModelsRequest {
  enabled?: boolean;
  groupedByProvider?: boolean;
  page?: number;
  pageSize?: number;
  provider?: string;
  type?: 'chat' | 'embedding' | 'tts' | 'stt' | 'image' | 'text2video' | 'text2music' | 'realtime';
}

// Response types
export interface ModelAbilities {
  files?: boolean;
  functionCall?: boolean;
  imageOutput?: boolean;
  reasoning?: boolean;
  search?: boolean;
  vision?: boolean;
}

export interface ModelConfig {
  deploymentName?: string;
  enabledSearch?: boolean;
}

export interface ModelSettings {
  extendParams?: string[];
  searchImpl?: string;
  searchProvider?: string;
}

export interface ModelItem {
  abilities?: ModelAbilities;
  config?: ModelConfig;
  contextWindowTokens?: number;
  createdAt: string;
  displayName?: string;
  enabled: boolean;
  id: string;
  settings?: ModelSettings;
  sort?: number;
  source: 'builtin' | 'custom' | 'remote';
  type: string;
  updatedAt: string;
}

export interface ProviderWithModels {
  modelCount: number;
  models: AiModelSelectItem[];
  providerEnabled: boolean;
  providerId: string;
  providerName?: string;
  providerSort?: number;
}

export interface GetModelsResponse {
  models?: ModelItem[];
  providers?: ProviderWithModels[]; // 扁平化的模型列表
  totalModels: number;
  totalProviders: number;
}

// Model config response types
export interface ModelConfigResponse extends AiFullModelCard {
  providerId: string;
  source: AiModelSourceType;
}

export interface DatabaseModelItem {
  abilities?: any;
  config?: any;
  contextWindowTokens?: number;
  createdAt?: Date;
  description?: string;
  displayName?: string;
  enabled?: boolean;
  id: string;
  organization?: string;
  parameters?: any;
  pricing?: any;
  providerId: string;
  releasedAt?: string;
  sort?: number;
  source?: AiModelSourceType;
  type: string;
  updatedAt?: Date;
}
