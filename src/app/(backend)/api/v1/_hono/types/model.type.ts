import { z } from 'zod';

// Request schemas
export const GetModelsRequestSchema = z.object({
  enabled: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional(),
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
  providerId: z.string().optional(),
  type: z
    .enum(['chat', 'embedding', 'tts', 'stt', 'image', 'text2video', 'text2music', 'realtime'])
    .optional(),
});

export interface GetModelsRequest {
  enabled?: boolean;
  page?: number;
  pageSize?: number;
  providerId?: string;
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
  models: ModelItem[];
  providerEnabled: boolean;
  providerId: string;
  providerName?: string;
  providerSort?: number;
}

export interface GetModelsResponse {
  providers?: ProviderWithModels[];
  totalModels: number;
  totalProviders: number;
}
