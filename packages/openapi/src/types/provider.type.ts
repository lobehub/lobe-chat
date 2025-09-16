import { z } from 'zod';

import { AiProviderSelectItem } from '@/database/schemas';
import { AiProviderConfig, AiProviderSettings, AiProviderSourceType } from '@/types/aiProvider';

import { IPaginationQuery, PaginationQueryResponse, PaginationQuerySchema } from './common.type';

// ==================== Provider Common Types ====================

export type ProviderKeyVaults = Record<string, string | undefined>;

export type ProviderRecord = Omit<AiProviderSelectItem, 'keyVaults'>;

export interface ProviderDetailResponse extends ProviderRecord {
  keyVaults?: ProviderKeyVaults;
}

export type GetProvidersResponse = PaginationQueryResponse<{
  providers: ProviderRecord[];
}>;

export interface GetProviderDetailRequest {
  id: string;
}

export interface DeleteProviderRequest {
  id: string;
}

// ==================== Provider Query Types ====================

export interface ProviderListQuery extends IPaginationQuery {
  enabled?: boolean;
  source?: AiProviderSourceType;
}

const EnabledQuerySchema = z.preprocess(
  (val) => {
    if (typeof val === 'boolean') return val;
    if (val === undefined || val === null || val === '') return undefined;
    if (typeof val === 'string') {
      const normalized = val.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') return true;
      if (normalized === 'false' || normalized === '0') return false;
    }

    return undefined;
  },
  z.boolean().optional(),
);

export const ProviderListQuerySchema = PaginationQuerySchema.extend({
  enabled: EnabledQuerySchema,
  source: z.enum(['builtin', 'custom']).optional(),
}).passthrough();

export type ProviderListQuerySchemaType = z.infer<typeof ProviderListQuerySchema>;

// ==================== Provider Mutation Schemas ====================

const ProviderPayloadBaseSchema = z.object({
  checkModel: z.string().nullable().optional(),
  config: z.record(z.unknown()).optional(),
  description: z.string().nullable().optional(),
  enabled: z.boolean().optional(),
  fetchOnClient: z.boolean().nullable().optional(),
  keyVaults: z.record(z.string()).optional(),
  logo: z.string().nullable().optional(),
  name: z.string().min(1, 'Provider 名称不能为空').nullable().optional(),
  settings: z.record(z.unknown()).optional(),
  sort: z.number().int().nullable().optional(),
  source: z.enum(['builtin', 'custom']).optional(),
});

export const CreateProviderRequestSchema = ProviderPayloadBaseSchema.extend({
  id: z.string().min(1, 'Provider ID 不能为空'),
  source: z.enum(['builtin', 'custom']),
});

export const UpdateProviderRequestSchema = ProviderPayloadBaseSchema.extend({
  keyVaults: z.record(z.string()).nullable().optional(),
});

export type CreateProviderRequestSchemaType = z.infer<typeof CreateProviderRequestSchema>;
export type UpdateProviderRequestSchemaType = z.infer<typeof UpdateProviderRequestSchema>;

export interface CreateProviderRequest
  extends Omit<CreateProviderRequestSchemaType, 'config' | 'settings' | 'keyVaults'> {
  config?: AiProviderConfig;
  settings?: AiProviderSettings;
  keyVaults?: ProviderKeyVaults;
}

export type UpdateProviderRequestBody = Omit<
  UpdateProviderRequestSchemaType,
  'config' | 'settings' | 'keyVaults'
> & {
  config?: AiProviderConfig;
  settings?: AiProviderSettings;
  keyVaults?: ProviderKeyVaults | null;
};

export interface UpdateProviderRequest extends UpdateProviderRequestBody {
  id: string;
}

export interface CreateProviderResponse extends ProviderDetailResponse {}
export interface UpdateProviderResponse extends ProviderDetailResponse {}

// ==================== Provider Param Schemas ====================

export const ProviderIdParamSchema = z.object({
  id: z.string().min(1, 'Provider ID 不能为空'),
});

export type ProviderIdParam = z.infer<typeof ProviderIdParamSchema>;
