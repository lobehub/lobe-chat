import { z } from 'zod';

import { AiModelSelectItem } from '@/database/schemas';

import { IPaginationQuery, PaginationQueryResponse } from './common.type';

// ==================== Model List Query Types ====================

/**
 * 模型列表查询参数
 */
export interface ModelsListQuery extends IPaginationQuery {
  enabled?: boolean;
  provider?: string;
  type?: 'chat' | 'embedding' | 'tts' | 'stt' | 'image' | 'text2video' | 'text2music' | 'realtime';
}

// ==================== Model Response Types ====================

export type GetModelsResponse = PaginationQueryResponse<{
  models?: AiModelSelectItem[];
}>;

// ==================== Model Detail / Mutation Types ====================

export type ModelDetailResponse = AiModelSelectItem;

const ModelPayloadBaseSchema = z.object({
  abilities: z.record(z.unknown()).nullish(),
  config: z.record(z.unknown()).nullish(),
  contextWindowTokens: z.number().int().nullish(),
  description: z.string().nullish(),
  displayName: z.string().min(1, '模型显示名称不能为空'),
  enabled: z.boolean().nullish(),
  organization: z.string().nullish(),
  parameters: z.record(z.unknown()).nullish(),
  pricing: z.record(z.unknown()).nullish(),
  releasedAt: z.string().nullish(),
  sort: z.number().int().nullish(),
  source: z.enum(['remote', 'custom', 'builtin']).nullish(),
  type: z
    .enum(['chat', 'embedding', 'tts', 'stt', 'image', 'text2video', 'text2music', 'realtime'])
    .nullish(),
});

export const CreateModelRequestSchema = ModelPayloadBaseSchema.extend({
  displayName: z.string().min(1, '模型显示名称不能为空'),
  id: z.string().min(1, '模型 ID 不能为空'),
  providerId: z.string().min(1, 'Provider ID 不能为空'),
});

export const UpdateModelRequestSchema = ModelPayloadBaseSchema.partial();

export type CreateModelRequest = z.infer<typeof CreateModelRequestSchema>;
export type UpdateModelRequest = z.infer<typeof UpdateModelRequestSchema>;

export const ModelIdParamSchema = z.object({
  modelId: z.string().min(1, '模型 ID 不能为空'),
  providerId: z.string().min(1, 'Provider ID 不能为空'),
});
