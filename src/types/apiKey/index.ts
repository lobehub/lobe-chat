import { z } from 'zod';

import { insertApiKeySchema } from '@/database/schemas/apiKey';

export type ApiKeyItem = z.infer<typeof insertApiKeySchema>;

export interface CreateApiKeyParams {
  description?: string;
  expiresAt?: Date;
  name: string;
}

export interface UpdateApiKeyParams {
  description?: string;
  enabled?: boolean;
  expiresAt?: Date;
  name?: string;
}

export interface ApiKeyUsage {
  createdAt: Date;
  expiresAt: Date | null;
  id: string;
  lastUsedAt: Date | null;
  name: string;
}
