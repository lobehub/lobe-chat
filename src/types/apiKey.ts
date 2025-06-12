import { z } from 'zod';

import { insertApiKeySchema } from '@/database/schemas/apiKey';

export type ApiKeyItem = z.infer<typeof insertApiKeySchema>;

export interface CreateApiKeyParams {
  expiresAt?: Date;
  name: string;
}

export interface UpdateApiKeyParams {
  enabled?: boolean;
  expiresAt?: Date;
  name?: string;
}
