import { AiModelSourceType } from '@lobechat/types';
import { z } from 'zod';

import { AiModelSelectItem } from '@/database/schemas';

// 根据 provider 和 model 获取模型配置
export interface GetModelConfigRequest {
  model: string;
  provider: string;
}

// 根据 sessionId 获取模型配置
export interface GetModelConfigBySessionRequest {
  sessionId: string;
}

// 模型列表查询参数 Schema
export const ModelsListQuerySchema = z.object({
  // 过滤参数
  enabled: z
    .string()
    .nullish()
    .transform((val) => val === 'true'),

  limit: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),

  order: z.enum(['asc', 'desc']).nullish().default('asc'),

  // 分页参数 (标准化：pageSize -> limit)
  page: z
    .string()
    .nullish()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),

  provider: z.string().nullish(),

  // 替代 groupedByProvider，更灵活
  // 排序参数
  sort: z.enum(['createdAt', 'updatedAt', 'sort']).nullish().default('sort'),

  type: z
    .enum(['chat', 'embedding', 'tts', 'stt', 'image', 'text2video', 'text2music', 'realtime'])
    .nullish(),
});

// 模型配置查询参数 Schema (合并两个配置接口)
export const ModelConfigsQuerySchema = z
  .object({
    model: z.string().nullish(),

    // 按 provider/model 查询
    provider: z.string().nullish(),

    // 按 sessionId 查询
    sessionId: z.string().nullish(),
  })
  .refine(
    (data) => {
      // 确保至少提供一种查询方式
      return (data.provider && data.model) || data.sessionId;
    },
    {
      message: '必须提供 (provider 和 model) 或 sessionId 参数',
    },
  );

// TypeScript 接口
export interface ModelsListQuery {
  enabled?: boolean;
  limit?: number;
  order?: 'asc' | 'desc';
  page?: number;
  provider?: string;
  sort?: 'createdAt' | 'updatedAt' | 'sort';
  type?: 'chat' | 'embedding' | 'tts' | 'stt' | 'image' | 'text2video' | 'text2music' | 'realtime';
}

export interface ModelConfigsQuery {
  model?: string;
  provider?: string;
  sessionId?: string;
}

export interface GetModelsResponse {
  models?: AiModelSelectItem[];
  totalModels: number;
}

// Model config response types
export interface ModelConfigResponse extends AiModelSelectItem {
  providerId: string;
  source: AiModelSourceType | null;
}
