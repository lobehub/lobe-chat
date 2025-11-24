import {
  IdentityTypeEnum,
  LayersEnum,
  MergeStrategyEnum,
  RelationshipEnum,
  TypesEnum,
} from '@lobechat/types';
import { and, cosineDistance, desc, eq, inArray, sql } from 'drizzle-orm';

import { merge } from '@/utils/merge';

import {
  UserMemoryContext,
  UserMemoryContextsWithoutVectors,
  UserMemoryExperience,
  UserMemoryExperiencesWithoutVectors,
  UserMemoryIdentitiesWithoutVectors,
  UserMemoryIdentity,
  UserMemoryItem,
  UserMemoryPreference,
  UserMemoryPreferencesWithoutVectors,
  userMemories,
  userMemoriesContexts,
  userMemoriesExperiences,
  userMemoriesIdentities,
  userMemoriesPreferences,
} from '../schemas';
import { LobeChatDatabase } from '../type';

const normalizeRelationshipValue = (input: unknown): RelationshipEnum | null => {
  if (input === null) return null;
  if (typeof input !== 'string') return null;
  const normalized = input.trim().toLowerCase();
  return Object.values(RelationshipEnum).includes(normalized as RelationshipEnum)
    ? (normalized as RelationshipEnum)
    : null;
};

const normalizeIdentityTypeValue = (input: unknown): IdentityTypeEnum | null => {
  if (input === null) return null;
  if (typeof input !== 'string') return null;
  const normalized = input.trim().toLowerCase();
  return Object.values(IdentityTypeEnum).includes(normalized as IdentityTypeEnum)
    ? (normalized as IdentityTypeEnum)
    : null;
};

const coerceDate = (input: unknown): Date | null => {
  if (input === null || input === undefined) return null;
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }
  if (typeof input === 'string' || typeof input === 'number') {
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

export interface BaseCreateUserMemoryParams {
  details: string;
  detailsEmbedding?: number[];
  memoryCategory: string;
  memoryLayer: LayersEnum;
  memoryType: TypesEnum;
  summary: string;
  summaryEmbedding?: number[];
  title: string;
  titleEmbedding?: number[];
}

export interface CreateUserMemoryContextParams extends BaseCreateUserMemoryParams {
  context: Omit<
    UserMemoryContext,
    'id' | 'userId' | 'createdAt' | 'updatedAt' | 'accessedAt' | 'userMemoryIds'
  >;
}

export interface CreateUserMemoryExperienceParams extends BaseCreateUserMemoryParams {
  experience: Omit<
    UserMemoryExperience,
    'id' | 'userId' | 'createdAt' | 'updatedAt' | 'accessedAt' | 'userMemoryId'
  >;
}

export interface CreateUserMemoryIdentityParams extends BaseCreateUserMemoryParams {
  identity: Omit<
    UserMemoryIdentity,
    'id' | 'userId' | 'createdAt' | 'updatedAt' | 'accessedAt' | 'userMemoryId'
  >;
}

export interface CreateUserMemoryPreferenceParams extends BaseCreateUserMemoryParams {
  preference: Omit<
    UserMemoryPreference,
    'id' | 'userId' | 'createdAt' | 'updatedAt' | 'accessedAt' | 'userMemoryId'
  >;
}

export type CreateUserMemoryParams =
  | CreateUserMemoryContextParams
  | CreateUserMemoryExperienceParams
  | CreateUserMemoryIdentityParams
  | CreateUserMemoryPreferenceParams;

export interface SearchUserMemoryParams {
  embedding?: number[];
  limit?: number;
  limits?: Partial<Record<'contexts' | 'experiences' | 'preferences', number>>;
  memoryCategory?: string;
  memoryType?: string;
  query?: string;
}

export interface SearchUserMemoryWithEmbeddingParams {
  embedding: number[];
  limits?: Partial<Record<'contexts' | 'experiences' | 'preferences', number>>;
  memoryCategory?: string;
  memoryType?: string;
}

export interface UserMemorySearchAggregatedResult {
  contexts: UserMemoryContextsWithoutVectors[];
  experiences: UserMemoryExperiencesWithoutVectors[];
  preferences: UserMemoryPreferencesWithoutVectors[];
}

export interface UpdateUserMemoryVectorsParams {
  detailsVector1024?: number[] | null;
  summaryVector1024?: number[] | null;
}

export interface UpdateContextVectorsParams {
  descriptionVector?: number[] | null;
  titleVector?: number[] | null;
}

export interface UpdatePreferenceVectorsParams {
  conclusionDirectivesVector?: number[] | null;
}

export interface UpdateIdentityVectorsParams {
  descriptionVector?: number[] | null;
}

export interface UpdateExperienceVectorsParams {
  actionVector?: number[] | null;
  keyLearningVector?: number[] | null;
  situationVector?: number[] | null;
}

export interface IdentityEntryPayload {
  description?: string | null;
  descriptionVector?: number[] | null;
  episodicDate?: string | Date | null;
  metadata?: Record<string, unknown> | null;
  relationship?: RelationshipEnum | string | null;
  role?: string | null;
  tags?: string[] | null;
  type?: IdentityTypeEnum | string | null;
}

export interface IdentityEntryBasePayload {
  details?: string | null;
  detailsVector1024?: number[] | null;
  lastAccessedAt?: string | Date | null;
  memoryCategory?: string | null;
  memoryLayer?: string | null;
  memoryType?: string | null;
  metadata?: Record<string, unknown> | null;
  status?: string | null;
  summary?: string | null;
  summaryVector1024?: number[] | null;
  tags?: string[] | null;
  title?: string | null;
}

export interface AddIdentityEntryParams {
  base: IdentityEntryBasePayload;
  identity: IdentityEntryPayload;
}

export interface AddIdentityEntryResult {
  identityId: string;
  userMemoryId: string;
}

export interface UpdateIdentityEntryParams {
  base?: IdentityEntryBasePayload;
  identity?: IdentityEntryPayload;
  identityId: string;
  mergeStrategy?: MergeStrategyEnum;
}

export class UserMemoryModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  private buildBaseMemoryInsertValues(
    params: BaseCreateUserMemoryParams,
    options?: {
      metadata?: Record<string, unknown> | null;
      status?: string | null;
      tags?: string[] | null;
    },
  ): typeof userMemories.$inferInsert {
    const now = new Date();

    return {
      accessedCount: 0,
      details: params.details ?? null,
      detailsVector1024: params.detailsEmbedding ?? null,
      lastAccessedAt: now,
      memoryCategory: params.memoryCategory ?? null,
      memoryLayer: params.memoryLayer,
      memoryType: params.memoryType ?? null,
      metadata: options?.metadata ?? null,
      status: options?.status ?? null,
      summary: params.summary ?? null,
      summaryVector1024: params.summaryEmbedding ?? null,
      tags: options?.tags ?? null,
      title: params.title ?? null,
      userId: this.userId,
    } satisfies typeof userMemories.$inferInsert;
  }

  create = async (params: CreateUserMemoryParams): Promise<UserMemoryItem> => {
    const [result] = await this.db
      .insert(userMemories)
      .values(this.buildBaseMemoryInsertValues(params))
      .returning();

    return result;
  };

  createContextMemory = async (
    params: CreateUserMemoryContextParams,
  ): Promise<{ context: UserMemoryContext; memory: UserMemoryItem }> => {
    return this.db.transaction(async (tx) => {
      const baseValues = this.buildBaseMemoryInsertValues(params, {
        metadata: params.context.metadata ?? null,
        tags: params.context.tags ?? null,
      });

      const [memory] = await tx.insert(userMemories).values(baseValues).returning();
      if (!memory) throw new Error('Failed to create user memory context');

      const contextValues = {
        associatedObjects: params.context.associatedObjects ?? [],
        associatedSubjects: params.context.associatedSubjects ?? [],
        currentStatus: params.context.currentStatus ?? null,
        description: params.context.description ?? null,
        descriptionVector: params.context.descriptionVector ?? null,
        metadata: params.context.metadata ?? null,
        scoreImpact: params.context.scoreImpact ?? null,
        scoreUrgency: params.context.scoreUrgency ?? null,
        tags: params.context.tags ?? [],
        title: params.context.title ?? null,
        type: params.context.type ?? null,
        userId: this.userId,
        userMemoryIds: [memory.id],
      } satisfies typeof userMemoriesContexts.$inferInsert;

      const [context] = await tx.insert(userMemoriesContexts).values(contextValues).returning();

      return { context, memory };
    });
  };

  createExperienceMemory = async (
    params: CreateUserMemoryExperienceParams,
  ): Promise<{ experience: UserMemoryExperience; memory: UserMemoryItem }> => {
    return this.db.transaction(async (tx) => {
      const baseValues = this.buildBaseMemoryInsertValues(params, {
        metadata: params.experience.metadata ?? null,
        tags: params.experience.tags ?? null,
      });

      const [memory] = await tx.insert(userMemories).values(baseValues).returning();
      if (!memory) throw new Error('Failed to create user memory experience');

      const experienceValues = {
        action: params.experience.action ?? null,
        actionVector: params.experience.actionVector ?? null,
        keyLearning: params.experience.keyLearning ?? null,
        keyLearningVector: params.experience.keyLearningVector ?? null,
        metadata: params.experience.metadata ?? null,
        possibleOutcome: params.experience.possibleOutcome ?? null,
        reasoning: params.experience.reasoning ?? null,
        scoreConfidence: params.experience.scoreConfidence ?? null,
        situation: params.experience.situation ?? null,
        situationVector: params.experience.situationVector ?? null,
        tags: params.experience.tags ?? [],
        type: params.experience.type ?? params.memoryType ?? null,
        userId: this.userId,
        userMemoryId: memory.id,
      } satisfies typeof userMemoriesExperiences.$inferInsert;

      const [experience] = await tx
        .insert(userMemoriesExperiences)
        .values(experienceValues)
        .returning();

      return { experience, memory };
    });
  };

  createPreferenceMemory = async (
    params: CreateUserMemoryPreferenceParams,
  ): Promise<{ memory: UserMemoryItem; preference: UserMemoryPreference }> => {
    return this.db.transaction(async (tx) => {
      const baseValues = this.buildBaseMemoryInsertValues(params, {
        metadata: params.preference.metadata ?? null,
        tags: params.preference.tags ?? null,
      });

      const [memory] = await tx.insert(userMemories).values(baseValues).returning();
      if (!memory) throw new Error('Failed to create user memory preference');

      const preferenceValues = {
        conclusionDirectives: params.preference.conclusionDirectives ?? null,
        conclusionDirectivesVector: params.preference.conclusionDirectivesVector ?? null,
        metadata: params.preference.metadata ?? null,
        scorePriority: params.preference.scorePriority ?? null,
        suggestions: params.preference.suggestions ?? null,
        tags: params.preference.tags ?? [],
        type: params.preference.type ?? params.memoryType ?? null,
        userId: this.userId,
        userMemoryId: memory.id,
      } satisfies typeof userMemoriesPreferences.$inferInsert;

      const [preference] = await tx
        .insert(userMemoriesPreferences)
        .values(preferenceValues)
        .returning();

      return { memory, preference };
    });
  };

  search = async (params: SearchUserMemoryParams): Promise<UserMemorySearchAggregatedResult> => {
    const { embedding, limits } = params;

    const resolvedLimits = {
      contexts: limits?.contexts,
      experiences: limits?.experiences,
      preferences: limits?.preferences,
    };

    const [experiences, contexts, preferences] = await Promise.all([
      this.searchExperiences({
        embedding,
        limit: resolvedLimits.experiences,
      }),
      this.searchContexts({
        embedding,
        limit: resolvedLimits.contexts,
      }),
      this.searchPreferences({
        embedding,
        limit: resolvedLimits.preferences,
      }),
    ]);

    const accessedMemoryIds = new Set<string>();
    experiences.forEach((experience) => {
      if (experience.userMemoryId) accessedMemoryIds.add(experience.userMemoryId);
    });
    preferences.forEach((preference) => {
      if (preference.userMemoryId) accessedMemoryIds.add(preference.userMemoryId);
    });
    const contextLinkIds: string[] = [];
    contexts.forEach((context) => {
      const ids = Array.isArray(context.userMemoryIds) ? (context.userMemoryIds as string[]) : [];
      ids.forEach((id) => accessedMemoryIds.add(id));
      contextLinkIds.push(context.id);
    });

    if (accessedMemoryIds.size > 0 || contextLinkIds.length > 0) {
      await this.updateAccessMetrics([...accessedMemoryIds], {
        contextIds: contextLinkIds,
        timestamp: new Date(),
      });
    }

    return {
      contexts,
      experiences,
      preferences,
    };
  };

  searchWithEmbedding = async (
    params: SearchUserMemoryWithEmbeddingParams,
  ): Promise<UserMemorySearchAggregatedResult> => {
    return this.search(params);
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

  updateUserMemoryVectors = async (
    id: string,
    vectors: UpdateUserMemoryVectorsParams,
  ): Promise<void> => {
    const vectorUpdates: Partial<typeof userMemories.$inferInsert> = {};
    if (vectors.detailsVector1024 !== undefined) {
      vectorUpdates.detailsVector1024 = vectors.detailsVector1024;
    }
    if (vectors.summaryVector1024 !== undefined) {
      vectorUpdates.summaryVector1024 = vectors.summaryVector1024;
    }

    if (Object.keys(vectorUpdates).length === 0) {
      return;
    }

    await this.db
      .update(userMemories)
      .set({
        ...vectorUpdates,
        updatedAt: new Date(),
      })
      .where(and(eq(userMemories.id, id), eq(userMemories.userId, this.userId)));
  };

  updateContextVectors = async (id: string, vectors: UpdateContextVectorsParams): Promise<void> => {
    const vectorUpdates: Partial<typeof userMemoriesContexts.$inferInsert> = {};
    if (vectors.descriptionVector !== undefined) {
      vectorUpdates.descriptionVector = vectors.descriptionVector;
    }
    if (Object.keys(vectorUpdates).length === 0) {
      return;
    }

    await this.db
      .update(userMemoriesContexts)
      .set({
        ...vectorUpdates,
        updatedAt: new Date(),
      })
      .where(and(eq(userMemoriesContexts.id, id), eq(userMemoriesContexts.userId, this.userId)));
  };

  updatePreferenceVectors = async (
    id: string,
    vectors: UpdatePreferenceVectorsParams,
  ): Promise<void> => {
    const vectorUpdates: Partial<typeof userMemoriesPreferences.$inferInsert> = {};
    if (vectors.conclusionDirectivesVector !== undefined) {
      vectorUpdates.conclusionDirectivesVector = vectors.conclusionDirectivesVector;
    }

    if (Object.keys(vectorUpdates).length === 0) {
      return;
    }

    await this.db
      .update(userMemoriesPreferences)
      .set({
        ...vectorUpdates,
        updatedAt: new Date(),
      })
      .where(
        and(eq(userMemoriesPreferences.id, id), eq(userMemoriesPreferences.userId, this.userId)),
      );
  };

  updateIdentityVectors = async (
    id: string,
    vectors: UpdateIdentityVectorsParams,
  ): Promise<void> => {
    const vectorUpdates: Partial<typeof userMemoriesIdentities.$inferInsert> = {};
    if (vectors.descriptionVector !== undefined) {
      vectorUpdates.descriptionVector = vectors.descriptionVector;
    }

    if (Object.keys(vectorUpdates).length === 0) {
      return;
    }

    await this.db
      .update(userMemoriesIdentities)
      .set({
        ...vectorUpdates,
        updatedAt: new Date(),
      })
      .where(
        and(eq(userMemoriesIdentities.id, id), eq(userMemoriesIdentities.userId, this.userId)),
      );
  };

  updateExperienceVectors = async (
    id: string,
    vectors: UpdateExperienceVectorsParams,
  ): Promise<void> => {
    const vectorUpdates: Partial<typeof userMemoriesExperiences.$inferInsert> = {};
    if (vectors.actionVector !== undefined) {
      vectorUpdates.actionVector = vectors.actionVector;
    }
    if (vectors.keyLearningVector !== undefined) {
      vectorUpdates.keyLearningVector = vectors.keyLearningVector;
    }
    if (vectors.situationVector !== undefined) {
      vectorUpdates.situationVector = vectors.situationVector;
    }

    if (Object.keys(vectorUpdates).length === 0) {
      return;
    }

    await this.db
      .update(userMemoriesExperiences)
      .set({
        ...vectorUpdates,
        updatedAt: new Date(),
      })
      .where(
        and(eq(userMemoriesExperiences.id, id), eq(userMemoriesExperiences.userId, this.userId)),
      );
  };

  addIdentityEntry = async (params: AddIdentityEntryParams): Promise<AddIdentityEntryResult> => {
    const now = new Date();

    return this.db.transaction(async (tx) => {
      const base = params.base ?? {};
      const baseValues: typeof userMemories.$inferInsert = {
        accessedCount: 0,
        details: base.details ?? null,
        detailsVector1024: base.detailsVector1024 ?? null,
        lastAccessedAt: coerceDate(base.lastAccessedAt) ?? now,
        memoryCategory: base.memoryCategory ?? null,
        memoryLayer: base.memoryLayer ?? 'identity',
        memoryType: base.memoryType ?? null,
        metadata: base.metadata ?? null,
        status: base.status === undefined ? 'active' : base.status,
        summary: base.summary ?? null,
        summaryVector1024: base.summaryVector1024 ?? null,
        tags: base.tags ?? null,
        title: base.title ?? null,
        userId: this.userId,
      };

      const [userMemoryRecord] = await tx
        .insert(userMemories)
        .values(baseValues)
        .returning({ id: userMemories.id });

      const identity = params.identity ?? {};
      const identityValues: typeof userMemoriesIdentities.$inferInsert = {
        description: identity.description ?? null,
        descriptionVector: identity.descriptionVector ?? null,
        episodicDate:
          identity.episodicDate === undefined ? null : coerceDate(identity.episodicDate),
        metadata: identity.metadata ?? null,
        relationship:
          identity.relationship === undefined
            ? null
            : identity.relationship === null
              ? null
              : (normalizeRelationshipValue(identity.relationship) ?? null),
        role: identity.role ?? null,
        tags: identity.tags ?? null,
        type:
          identity.type === undefined
            ? null
            : identity.type === null
              ? null
              : (normalizeIdentityTypeValue(identity.type) ?? null),
        userId: this.userId,
        userMemoryId: userMemoryRecord.id,
      };

      const [identityRecord] = await tx
        .insert(userMemoriesIdentities)
        .values(identityValues)
        .returning({ id: userMemoriesIdentities.id });

      return {
        identityId: identityRecord.id,
        userMemoryId: userMemoryRecord.id,
      };
    });
  };

  updateIdentityEntry = async (params: UpdateIdentityEntryParams): Promise<boolean> => {
    const mergeStrategy = params.mergeStrategy ?? 'merge';

    return this.db.transaction(async (tx) => {
      const identity = await tx.query.userMemoriesIdentities.findFirst({
        where: and(
          eq(userMemoriesIdentities.id, params.identityId),
          eq(userMemoriesIdentities.userId, this.userId),
        ),
      });
      if (!identity || !identity.userMemoryId) {
        return false;
      }

      let baseUpdate: Partial<typeof userMemories.$inferInsert> = {};
      let identityUpdate: Partial<typeof userMemoriesIdentities.$inferInsert> = {};

      if (params.base) {
        baseUpdate = merge(baseUpdate, params.base);
        if (baseUpdate.lastAccessedAt !== undefined) {
          baseUpdate.lastAccessedAt = coerceDate(baseUpdate.lastAccessedAt) ?? new Date();
        }

        if (Object.keys(baseUpdate).length > 0) {
          baseUpdate.updatedAt = new Date();
          await tx
            .update(userMemories)
            .set(baseUpdate)
            .where(
              and(eq(userMemories.id, identity.userMemoryId), eq(userMemories.userId, this.userId)),
            );
        }
      }

      if (params.identity) {
        if (mergeStrategy === 'replace') {
          const identity = params.identity;

          identityUpdate = {
            description: identity.description ?? null,
            descriptionVector: identity.descriptionVector ?? null,
            episodicDate:
              identity.episodicDate === undefined ? null : coerceDate(identity.episodicDate),
            metadata: identity.metadata ?? null,
            relationship:
              identity.relationship === undefined
                ? null
                : identity.relationship === null
                  ? null
                  : (normalizeRelationshipValue(identity.relationship) ?? null),
            role: identity.role ?? null,
            tags: identity.tags ?? null,
            type:
              identity.type === undefined
                ? null
                : identity.type === null
                  ? null
                  : (normalizeIdentityTypeValue(identity.type) ?? null),
          };
        } else {
          identityUpdate = merge(identityUpdate, params.identity);

          if (params.identity.type !== undefined) {
            identityUpdate.type =
              params.identity.type === null
                ? null
                : (normalizeIdentityTypeValue(params.identity.type) ?? null);
          }

          if (params.identity.relationship !== undefined) {
            identityUpdate.relationship =
              params.identity.relationship === null
                ? null
                : (normalizeRelationshipValue(params.identity.relationship) ?? null);
          }

          if (params.identity.episodicDate !== undefined) {
            identityUpdate.episodicDate = coerceDate(params.identity.episodicDate);
          }
        }

        if (Object.keys(identityUpdate).length > 0) {
          identityUpdate.updatedAt = new Date();
          await tx
            .update(userMemoriesIdentities)
            .set(identityUpdate)
            .where(
              and(
                eq(userMemoriesIdentities.id, params.identityId),
                eq(userMemoriesIdentities.userId, this.userId),
              ),
            );
        }
      }

      return true;
    });
  };

  removeIdentityEntry = async (identityId: string): Promise<boolean> => {
    return this.db.transaction(async (tx) => {
      const identity = await tx.query.userMemoriesIdentities.findFirst({
        where: and(
          eq(userMemoriesIdentities.id, identityId),
          eq(userMemoriesIdentities.userId, this.userId),
        ),
      });

      if (!identity || !identity.userMemoryId) {
        return false;
      }

      await tx
        .delete(userMemories)
        .where(
          and(eq(userMemories.id, identity.userMemoryId), eq(userMemories.userId, this.userId)),
        );

      return true;
    });
  };

  delete = async (id: string): Promise<void> => {
    await this.db
      .delete(userMemories)
      .where(and(eq(userMemories.id, id), eq(userMemories.userId, this.userId)));
  };

  deleteAll = async (): Promise<void> => {
    await this.db.delete(userMemories).where(eq(userMemories.userId, this.userId));
  };

  searchContexts = async (params: {
    embedding?: number[];
    limit?: number;
    type?: string;
  }): Promise<UserMemoryContextsWithoutVectors[]> => {
    const { embedding, limit = 5, type } = params;
    if (limit <= 0) {
      return [];
    }

    let query = this.db
      .select({
        accessedAt: userMemoriesContexts.accessedAt,
        associatedObjects: userMemoriesContexts.associatedObjects,
        associatedSubjects: userMemoriesContexts.associatedSubjects,
        createdAt: userMemoriesContexts.createdAt,
        currentStatus: userMemoriesContexts.currentStatus,
        description: userMemoriesContexts.description,
        id: userMemoriesContexts.id,
        metadata: userMemoriesContexts.metadata,
        scoreImpact: userMemoriesContexts.scoreImpact,
        scoreUrgency: userMemoriesContexts.scoreUrgency,
        tags: userMemoriesContexts.tags,
        title: userMemoriesContexts.title,
        type: userMemoriesContexts.type,
        updatedAt: userMemoriesContexts.updatedAt,
        userId: userMemoriesContexts.userId,
        userMemoryIds: userMemoriesContexts.userMemoryIds,
        ...(embedding && {
          similarity: sql<number>`1 - (${cosineDistance(userMemoriesContexts.descriptionVector, embedding)}) AS similarity`,
        }),
      })
      .from(userMemoriesContexts)
      .$dynamic();

    const conditions = [eq(userMemoriesContexts.userId, this.userId)];
    if (type) {
      conditions.push(eq(userMemoriesContexts.type, type));
    }

    query = query.where(and(...conditions));

    if (embedding) {
      query = query.orderBy(desc(sql`similarity`));
    } else {
      query = query.orderBy(desc(userMemoriesContexts.createdAt));
    }

    return query.limit(limit);
  };

  searchExperiences = async (params: {
    embedding?: number[];
    limit?: number;
    type?: string;
  }): Promise<UserMemoryExperiencesWithoutVectors[]> => {
    const { embedding, limit = 5, type } = params;
    if (limit <= 0) {
      return [];
    }

    let query = this.db
      .select({
        accessedAt: userMemoriesExperiences.accessedAt,
        action: userMemoriesExperiences.action,
        createdAt: userMemoriesExperiences.createdAt,
        id: userMemoriesExperiences.id,
        keyLearning: userMemoriesExperiences.keyLearning,
        metadata: userMemoriesExperiences.metadata,
        possibleOutcome: userMemoriesExperiences.possibleOutcome,
        reasoning: userMemoriesExperiences.reasoning,
        scoreConfidence: userMemoriesExperiences.scoreConfidence,
        situation: userMemoriesExperiences.situation,
        tags: userMemoriesExperiences.tags,
        type: userMemoriesExperiences.type,
        updatedAt: userMemoriesExperiences.updatedAt,
        userId: userMemoriesExperiences.userId,
        userMemoryId: userMemoriesExperiences.userMemoryId,
        ...(embedding && {
          similarity: sql<number>`1 - (${cosineDistance(userMemoriesExperiences.situationVector, embedding)}) AS similarity`,
        }),
      })
      .from(userMemoriesExperiences)
      .$dynamic();

    const conditions = [eq(userMemoriesExperiences.userId, this.userId)];
    if (type) {
      conditions.push(eq(userMemoriesExperiences.type, type));
    }

    query = query.where(and(...conditions));

    if (embedding) {
      query = query.orderBy(desc(sql`similarity`));
    } else {
      query = query.orderBy(desc(userMemoriesExperiences.createdAt));
    }

    return query.limit(limit);
  };

  searchPreferences = async (params: {
    embedding?: number[];
    limit?: number;
    type?: string;
  }): Promise<UserMemoryPreferencesWithoutVectors[]> => {
    const { embedding, limit = 5, type } = params;
    if (limit <= 0) {
      return [];
    }

    let query = this.db
      .select({
        accessedAt: userMemoriesPreferences.accessedAt,
        conclusionDirectives: userMemoriesPreferences.conclusionDirectives,
        createdAt: userMemoriesPreferences.createdAt,
        id: userMemoriesPreferences.id,
        metadata: userMemoriesPreferences.metadata,
        scorePriority: userMemoriesPreferences.scorePriority,
        suggestions: userMemoriesPreferences.suggestions,
        tags: userMemoriesPreferences.tags,
        type: userMemoriesPreferences.type,
        updatedAt: userMemoriesPreferences.updatedAt,
        userId: userMemoriesPreferences.userId,
        userMemoryId: userMemoriesPreferences.userMemoryId,
        ...(embedding && {
          similarity: sql<number>`1 - (${cosineDistance(userMemoriesPreferences.conclusionDirectivesVector, embedding)}) AS similarity`,
        }),
      })
      .from(userMemoriesPreferences)
      .$dynamic();

    const conditions = [eq(userMemoriesPreferences.userId, this.userId)];
    if (type) {
      conditions.push(eq(userMemoriesPreferences.type, type));
    }

    query = query.where(and(...conditions));

    if (embedding) {
      query = query.orderBy(desc(sql`similarity`));
    } else {
      query = query.orderBy(desc(userMemoriesPreferences.createdAt));
    }

    return query.limit(limit);
  };

  getAllIdentities = async (): Promise<UserMemoryIdentitiesWithoutVectors[]> => {
    return this.db.query.userMemoriesIdentities.findMany({
      orderBy: [desc(userMemoriesIdentities.createdAt)],
      where: eq(userMemoriesIdentities.userId, this.userId),
    });
  };

  getIdentitiesByType = async (type: string): Promise<UserMemoryIdentitiesWithoutVectors[]> => {
    return this.db.query.userMemoriesIdentities.findMany({
      orderBy: [desc(userMemoriesIdentities.createdAt)],
      where: and(
        eq(userMemoriesIdentities.userId, this.userId),
        eq(userMemoriesIdentities.type, type),
      ),
    });
  };

  private updateAccessMetrics = async (
    memoryIds: string[],
    options?: { contextIds?: string[]; timestamp?: Date },
  ): Promise<void> => {
    const contextIds = options?.contextIds ?? [];
    if (memoryIds.length === 0 && contextIds.length === 0) return;

    const now = options?.timestamp ?? new Date();

    await this.db.transaction(async (tx) => {
      if (memoryIds.length > 0) {
        await tx
          .update(userMemories)
          .set({
            accessedAt: now,
            accessedCount: sql`${userMemories.accessedCount} + 1`,
            lastAccessedAt: now,
          })
          .where(and(eq(userMemories.userId, this.userId), inArray(userMemories.id, memoryIds)));

        const memories = await tx
          .select({
            id: userMemories.id,
            layer: userMemories.memoryLayer,
          })
          .from(userMemories)
          .where(and(eq(userMemories.userId, this.userId), inArray(userMemories.id, memoryIds)));

        const experienceIds = memories
          .filter((memory) => memory.layer === 'experience')
          .map((memory) => memory.id);
        if (experienceIds.length > 0) {
          await tx
            .update(userMemoriesExperiences)
            .set({ accessedAt: now })
            .where(
              and(
                eq(userMemoriesExperiences.userId, this.userId),
                inArray(userMemoriesExperiences.userMemoryId, experienceIds),
              ),
            );
        }

        const identityIds = memories
          .filter((memory) => memory.layer === 'identity')
          .map((memory) => memory.id);
        if (identityIds.length > 0) {
          await tx
            .update(userMemoriesIdentities)
            .set({ accessedAt: now })
            .where(
              and(
                eq(userMemoriesIdentities.userId, this.userId),
                inArray(userMemoriesIdentities.userMemoryId, identityIds),
              ),
            );
        }

        const preferenceIds = memories
          .filter((memory) => memory.layer === 'preference')
          .map((memory) => memory.id);
        if (preferenceIds.length > 0) {
          await tx
            .update(userMemoriesPreferences)
            .set({ accessedAt: now })
            .where(
              and(
                eq(userMemoriesPreferences.userId, this.userId),
                inArray(userMemoriesPreferences.userMemoryId, preferenceIds),
              ),
            );
        }
      }

      if (contextIds.length > 0) {
        await tx
          .update(userMemoriesContexts)
          .set({ accessedAt: now })
          .where(
            and(
              eq(userMemoriesContexts.userId, this.userId),
              inArray(userMemoriesContexts.id, contextIds),
            ),
          );
      }
    });
  };
}
