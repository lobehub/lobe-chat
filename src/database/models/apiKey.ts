import { and, desc, eq } from 'drizzle-orm/expressions';

import { LobeChatDatabase } from '@/database/type';
import { generateApiKey, isApiKeyExpired, validateApiKeyFormat } from '@/utils/apiKey';

import { ApiKeyItem, NewApiKeyItem, apiKeys } from '../schemas';

export class ApiKeyModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: Omit<NewApiKeyItem, 'userId' | 'id' | 'key'>) => {
    const key = generateApiKey();
    const [result] = await this.db
      .insert(apiKeys)
      .values({ ...params, key, userId: this.userId })
      .returning();

    return result;
  };

  delete = async (id: number) => {
    return this.db.delete(apiKeys).where(and(eq(apiKeys.id, id), eq(apiKeys.userId, this.userId)));
  };

  deleteAll = async () => {
    return this.db.delete(apiKeys).where(eq(apiKeys.userId, this.userId));
  };

  query = async () => {
    return this.db.query.apiKeys.findMany({
      orderBy: [desc(apiKeys.updatedAt)],
      where: eq(apiKeys.userId, this.userId),
    });
  };

  findByKey = async (key: string) => {
    if (!validateApiKeyFormat(key)) {
      return null;
    }

    return this.db.query.apiKeys.findFirst({
      where: eq(apiKeys.key, key),
    });
  };

  validateKey = async (key: string) => {
    const apiKey = await this.findByKey(key);

    if (!apiKey) return false;
    if (!apiKey.enabled) return false;
    if (isApiKeyExpired(apiKey.expiresAt)) return false;

    return true;
  };

  update = async (id: number, value: Partial<ApiKeyItem>) => {
    return this.db
      .update(apiKeys)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, this.userId)));
  };

  findById = async (id: number) => {
    return this.db.query.apiKeys.findFirst({
      where: and(eq(apiKeys.id, id), eq(apiKeys.userId, this.userId)),
    });
  };

  updateLastUsed = async (id: number) => {
    return this.db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, this.userId)));
  };
}
