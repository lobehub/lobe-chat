export { type ApiKeyItem } from '@/database/schemas/apiKey';

export interface CreateApiKeyParams {
  expiresAt?: Date;
  name: string;
}

export interface UpdateApiKeyParams {
  enabled?: boolean;
  expiresAt?: Date | null;
  name?: string;
}
