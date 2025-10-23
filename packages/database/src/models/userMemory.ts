import { and, cosineDistance, desc, eq, inArray, sql } from 'drizzle-orm';

import {
  NewUserMemoryContext,
  NewUserMemoryPreference,
  UserMemoryContext,
  UserMemoryItem,
  UserMemoryPreference,
  userMemories,
  userMemoriesContexts,
  userMemoriesPreferences,
} from '../schemas';
import { LobeChatDatabase } from '../type';

export interface CreateUserMemoryParams {
  details?: string;
  detailsVector1024?: number[];
  memoryCategory?: string;
  memoryLayer?: string;
  memoryType?: string;
  summary: string;
  summaryVector1024?: number[];
  title: string;
}

export interface SearchUserMemoryParams {
  embedding?: number[];
  limit?: number;
  memoryCategory?: string;
  memoryType?: string;
  query?: string;
}

export interface SearchUserMemoryWithEmbeddingParams {
  embedding: number[];
  limit?: number;
  memoryCategory?: string;
  memoryType?: string;
}

export interface UserMemoryResult {
  details?: string;
  id: string;
  lastAccessedAt: string;
  memoryCategory?: string;
  memoryType?: string;
  relevanceScore?: number;
  summary: string;
  title: string;
}

export interface CategorizeUserMemoryContextParams {
  associatedObjects?: unknown;
  associatedSubjects?: unknown;
  contextId?: string;
  currentStatus?: string;
  description?: string;
  descriptionVector?: number[];
  extractedLabels?: unknown;
  labels?: unknown;
  scoreImpact?: number;
  scoreUrgency?: number;
  title?: string;
  titleVector?: number[];
  type?: string;
  userMemoryIds?: string[];
}

export interface CategorizeUserMemoryContextResult {
  context: UserMemoryContext;
  created: boolean;
}

export interface CategorizeUserMemoryPreferenceParams {
  conclusionDirectives?: string;
  conclusionDirectivesVector?: number[];
  contextId?: string;
  extractedLabels?: unknown;
  extractedScopes?: unknown;
  labels?: unknown;
  preferenceId?: string;
  scorePriority?: number;
  suggestions?: string;
  type?: string;
  userMemoryId?: string;
}

export interface CategorizeUserMemoryPreferenceResult {
  created: boolean;
  preference: UserMemoryPreference;
}

export class UserMemoryModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: CreateUserMemoryParams): Promise<UserMemoryItem> => {
    const [result] = await this.db
      .insert(userMemories)
      .values({
        ...params,
        accessedCount: 0,
        lastAccessedAt: new Date(),
        userId: this.userId,
      })
      .returning();

    return result;
  };

  search = async (params: SearchUserMemoryParams): Promise<UserMemoryResult[]> => {
    const { embedding, limit = 5, memoryType, memoryCategory } = params;

    let query = this.db
      .select({
        accessedCount: userMemories.accessedCount,
        details: userMemories.details,
        id: userMemories.id,
        lastAccessedAt: userMemories.lastAccessedAt,
        memoryCategory: userMemories.memoryCategory,
        memoryType: userMemories.memoryType,
        summary: userMemories.summary,
        title: userMemories.title,
        // Similarity search
        ...(embedding && {
          similarity: sql<number>`1 - (${cosineDistance(userMemories.summaryVector1024, embedding)}) AS similarity`,
        }),
      })
      .from(userMemories)
      .$dynamic();

    const conditions = [eq(userMemories.userId, this.userId)];
    if (memoryType) {
      conditions.push(eq(userMemories.memoryType, memoryType));
    }
    if (memoryCategory) {
      conditions.push(eq(userMemories.memoryCategory, memoryCategory));
    }

    query = query.where(and(...conditions));

    // TODO: when we need forgetting curve, we need to add a decay function based
    // on the lastAccessedAt timestamp along with score column and order by it.
    //
    // use similarity if embedding provided, otherwise lastAccessed
    if (embedding) {
      query = query.orderBy(desc(sql`similarity`));
    } else {
      query = query.orderBy(desc(userMemories.lastAccessedAt));
    }

    const results = await query.limit(limit);

    // Same as other query implementation, update access metrics
    if (results.length > 0) {
      const memoryIds = results.map((r) => r.id);
      await this.updateAccessMetrics(memoryIds);
    }

    return results.map((item) => ({
      details: item.details || undefined,
      id: item.id,
      lastAccessedAt: item.lastAccessedAt.toISOString(),
      memoryCategory: item.memoryCategory || undefined,
      memoryType: item.memoryType || undefined,
      relevanceScore: (item as any).similarity || 1,
      summary: item.summary || '',
      title: item.title || '',
    }));
  };

  searchWithEmbedding = async (
    params: SearchUserMemoryWithEmbeddingParams,
  ): Promise<UserMemoryResult[]> => {
    const { embedding, limit = 5, memoryType, memoryCategory } = params;

    let query = this.db
      .select({
        accessedCount: userMemories.accessedCount,
        details: userMemories.details,
        id: userMemories.id,
        lastAccessedAt: userMemories.lastAccessedAt,
        memoryCategory: userMemories.memoryCategory,
        memoryType: userMemories.memoryType,
        // Similarity search
        similarity: sql<number>`1 - (${cosineDistance(userMemories.summaryVector1024, embedding)}) AS similarity`,
        summary: userMemories.summary,
        title: userMemories.title,
      })
      .from(userMemories)
      .$dynamic();

    const conditions = [eq(userMemories.userId, this.userId)];
    if (memoryType) {
      conditions.push(eq(userMemories.memoryType, memoryType));
    }
    if (memoryCategory) {
      conditions.push(eq(userMemories.memoryCategory, memoryCategory));
    }

    query = query.where(and(...conditions)).orderBy(desc(sql`similarity`));

    const results = await query.limit(limit);

    // Same as other query implementation, update access metrics
    if (results.length > 0) {
      const memoryIds = results.map((r) => r.id);
      await this.updateAccessMetrics(memoryIds);
    }

    return results.map((item) => ({
      details: item.details || undefined,
      id: item.id,
      lastAccessedAt: item.lastAccessedAt.toISOString(),
      memoryCategory: item.memoryCategory || undefined,
      memoryType: item.memoryType || undefined,
      relevanceScore: (item as any).similarity || 1,
      summary: item.summary || '',
      title: item.title || '',
    }));
  };

  findById = async (id: string): Promise<UserMemoryItem | undefined> => {
    const result = await this.db.query.userMemories.findFirst({
      where: and(eq(userMemories.id, id), eq(userMemories.userId, this.userId)),
    });

    if (result) {
      await this.updateAccessMetrics([id]);
    }

    return result;
  };

  update = async (id: string, params: Partial<CreateUserMemoryParams>): Promise<void> => {
    await this.db
      .update(userMemories)
      .set({ ...params, updatedAt: new Date() })
      .where(and(eq(userMemories.id, id), eq(userMemories.userId, this.userId)));
  };

  delete = async (id: string): Promise<void> => {
    await this.db
      .delete(userMemories)
      .where(and(eq(userMemories.id, id), eq(userMemories.userId, this.userId)));
  };

  deleteAll = async (): Promise<void> => {
    await this.db.delete(userMemories).where(eq(userMemories.userId, this.userId));
  };

  getByCategory = async (memoryCategory: string): Promise<UserMemoryItem[]> => {
    return this.db.query.userMemories.findMany({
      orderBy: [desc(userMemories.lastAccessedAt)],
      where: and(
        eq(userMemories.userId, this.userId),
        eq(userMemories.memoryCategory, memoryCategory),
      ),
    });
  };

  getByType = async (memoryType: string): Promise<UserMemoryItem[]> => {
    return this.db.query.userMemories.findMany({
      orderBy: [desc(userMemories.lastAccessedAt)],
      where: and(eq(userMemories.userId, this.userId), eq(userMemories.memoryType, memoryType)),
    });
  };

  categorizeContext = async (
    params: CategorizeUserMemoryContextParams,
  ): Promise<CategorizeUserMemoryContextResult> => {
    const {
      associatedObjects,
      associatedSubjects,
      contextId,
      currentStatus,
      description,
      descriptionVector,
      extractedLabels,
      labels,
      scoreImpact,
      scoreUrgency,
      title,
      titleVector,
      type,
      userMemoryIds,
    } = params;

    await this.ensureMemoriesBelongToUser(userMemoryIds);

    const basePayload: Partial<NewUserMemoryContext> = {
      associatedObjects,
      associatedSubjects,
      currentStatus,
      description,
      descriptionVector,
      extractedLabels,
      labels,
      scoreImpact,
      scoreUrgency,
      title,
      titleVector,
      type,
      userMemoryIds,
    };
    const payload = this.pickDefined(basePayload);

    if (contextId) {
      await this.assertContextOwnership(contextId);

      const [context] = await this.db
        .update(userMemoriesContexts)
        .set(payload)
        .where(eq(userMemoriesContexts.id, contextId))
        .returning();

      if (!context) {
        throw new Error('Failed to update context');
      }

      return { context, created: false };
    }

    const [context] = await this.db.insert(userMemoriesContexts).values(payload).returning();

    if (!context) {
      throw new Error('Failed to create context');
    }

    return { context, created: true };
  };

  categorizePreference = async (
    params: CategorizeUserMemoryPreferenceParams,
  ): Promise<CategorizeUserMemoryPreferenceResult> => {
    const {
      conclusionDirectives,
      conclusionDirectivesVector,
      contextId,
      extractedLabels,
      extractedScopes,
      labels,
      preferenceId,
      scorePriority,
      suggestions,
      type,
      userMemoryId,
    } = params;

    if (contextId) {
      await this.assertContextOwnership(contextId);
    }

    if (userMemoryId) {
      await this.ensureMemoriesBelongToUser([userMemoryId]);
    }

    const basePayload: Partial<NewUserMemoryPreference> = {
      conclusionDirectives,
      conclusionDirectivesVector,
      contextId,
      extractedLabels,
      extractedScopes,
      labels,
      scorePriority,
      suggestions,
      type,
      userMemoryId,
    };
    const payload = this.pickDefined(basePayload);

    if (preferenceId) {
      await this.assertPreferenceOwnership(preferenceId);

      const [preference] = await this.db
        .update(userMemoriesPreferences)
        .set(payload)
        .where(eq(userMemoriesPreferences.id, preferenceId))
        .returning();

      if (!preference) {
        throw new Error('Failed to update preference');
      }

      return { created: false, preference };
    }

    const [preference] = await this.db.insert(userMemoriesPreferences).values(payload).returning();

    if (!preference) {
      throw new Error('Failed to create preference');
    }

    return { created: true, preference };
  };

  private updateAccessMetrics = async (memoryIds: string[]): Promise<void> => {
    const updatePromises = memoryIds.map((id) =>
      this.db
        .update(userMemories)
        .set({
          accessedCount: sql`${userMemories.accessedCount} + 1`,
          lastAccessedAt: new Date(),
        })
        .where(and(eq(userMemories.id, id), eq(userMemories.userId, this.userId))),
    );

    await Promise.all(updatePromises);
  };

  private async ensureMemoriesBelongToUser(
    memoryIds: string[] | undefined,
    allowEmpty = false,
  ): Promise<void> {
    const uniqueIds = Array.from(new Set(this.normalizeStringArray(memoryIds)));

    if (!allowEmpty && uniqueIds.length === 0) {
      throw new Error('At least one userMemoryId must be provided');
    }

    if (uniqueIds.length === 0) return;

    const rows = await this.db
      .select({ id: userMemories.id })
      .from(userMemories)
      .where(and(eq(userMemories.userId, this.userId), inArray(userMemories.id, uniqueIds)));

    if (rows.length !== uniqueIds.length) {
      throw new Error('Memory IDs must belong to the current user');
    }
  }

  private async assertContextOwnership(contextId: string): Promise<UserMemoryContext> {
    const context = await this.db.query.userMemoriesContexts.findFirst({
      where: eq(userMemoriesContexts.id, contextId),
    });

    if (!context) {
      throw new Error('Context not found');
    }

    const memoryIds = this.normalizeStringArray(context.userMemoryIds);
    await this.ensureMemoriesBelongToUser(memoryIds);

    return context;
  }

  private async assertPreferenceOwnership(preferenceId: string): Promise<UserMemoryPreference> {
    const preference = await this.db.query.userMemoriesPreferences.findFirst({
      where: eq(userMemoriesPreferences.id, preferenceId),
    });

    if (!preference) {
      throw new Error('Preference not found');
    }

    if (preference.contextId) {
      await this.assertContextOwnership(preference.contextId);
    }

    if (preference.userMemoryId) {
      await this.ensureMemoriesBelongToUser([preference.userMemoryId]);
    }

    return preference;
  }

  private normalizeStringArray(value: unknown): string[] {
    if (!value || !Array.isArray(value)) return [];

    return value.filter((item): item is string => typeof item === 'string');
  }

  private pickDefined<T extends object>(payload: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(payload as Record<string, unknown>).filter(([, value]) => value !== undefined),
    ) as Partial<T>;
  }
}
