import { z } from 'zod';

// Request schemas
export const GetEnabledModelsRequestSchema = z.object({
  type: z
    .enum(['chat', 'embedding', 'tts', 'stt', 'image', 'text2video', 'text2music', 'realtime'])
    .optional(),
});

export interface GetEnabledModelsRequest {
  type?: 'chat' | 'embedding' | 'tts' | 'stt' | 'image' | 'text2video' | 'text2music' | 'realtime';
}

// Response types
export interface EnabledModelItem {
  abilities?: {
    files?: boolean;
    functionCall?: boolean;
    imageOutput?: boolean;
    reasoning?: boolean;
    search?: boolean;
    vision?: boolean;
  };
  config?: {
    deploymentName?: string;
    enabledSearch?: boolean;
  };
  contextWindowTokens?: number;
  createdAt: string;
  displayName?: string;
  enabled: boolean;
  id: string;
  settings?: {
    extendParams?: string[];
    searchImpl?: string;
    searchProvider?: string;
  };
  sort?: number;
  source: 'builtin' | 'custom' | 'remote';
  type: string;
  updatedAt: string;
}

export interface ProviderWithModels {
  modelCount: number;
  models: EnabledModelItem[];
  providerEnabled: boolean;
  providerId: string;
  providerName?: string;
  providerSort?: number;
}

export interface GetEnabledModelsResponse {
  providers: ProviderWithModels[];
  totalModels: number;
  totalProviders: number;
}
