import { and, asc, desc, eq, inArray } from 'drizzle-orm/expressions';

import { LobeChatDatabase } from '@/database/type';
import {
  AiModelSortMap,
  AiModelSourceEnum,
  AiProviderModelListItem,
  EnabledAiModel,
  ToggleAiModelEnableParams,
} from '@/types/aiModel';

import { AiModelSelectItem, NewAiModelItem, aiModels } from '../../schemas';

export class AiModelModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: NewAiModelItem) => {
    const [result] = await this.db
      .insert(aiModels)
      .values({
        ...params,
        enabled: true, // enabled by default
        source: AiModelSourceEnum.Custom,
        userId: this.userId,
      })
      .returning();

    return result;
  };

  delete = async (id: string, providerId: string) => {
    return this.db
      .delete(aiModels)
      .where(
        and(
          eq(aiModels.id, id),
          eq(aiModels.providerId, providerId),
          eq(aiModels.userId, this.userId),
        ),
      );
  };

  deleteAll = async () => {
    return this.db.delete(aiModels).where(eq(aiModels.userId, this.userId));
  };

  query = async () => {
    return this.db.query.aiModels.findMany({
      orderBy: [desc(aiModels.updatedAt)],
      where: eq(aiModels.userId, this.userId),
    });
  };

  getModelListByProviderId = async (providerId: string) => {
    const result = await this.db
      .select({
        abilities: aiModels.abilities,
        config: aiModels.config,
        contextWindowTokens: aiModels.contextWindowTokens,
        description: aiModels.description,
        displayName: aiModels.displayName,
        enabled: aiModels.enabled,
        id: aiModels.id,
        pricing: aiModels.pricing,
        source: aiModels.source,
        type: aiModels.type,
      })
      .from(aiModels)
      .where(and(eq(aiModels.providerId, providerId), eq(aiModels.userId, this.userId)))
      .orderBy(
        asc(aiModels.sort),
        desc(aiModels.enabled),
        desc(aiModels.releasedAt),
        desc(aiModels.updatedAt),
      );

    return result as AiProviderModelListItem[];
  };

  getAllModels = async () => {
    const data = await this.db
      .select({
        abilities: aiModels.abilities,
        config: aiModels.config,
        contextWindowTokens: aiModels.contextWindowTokens,
        displayName: aiModels.displayName,
        enabled: aiModels.enabled,
        id: aiModels.id,
        providerId: aiModels.providerId,
        sort: aiModels.sort,
        source: aiModels.source,
        type: aiModels.type,
      })
      .from(aiModels)
      .where(and(eq(aiModels.userId, this.userId)));

    return data as EnabledAiModel[];
  };

  findById = async (id: string) => {
    return this.db.query.aiModels.findFirst({
      where: and(eq(aiModels.id, id), eq(aiModels.userId, this.userId)),
    });
  };

  update = async (id: string, providerId: string, value: Partial<AiModelSelectItem>) => {
    return this.db
      .insert(aiModels)
      .values({ ...value, id, providerId, updatedAt: new Date(), userId: this.userId })
      .onConflictDoUpdate({
        set: value,
        target: [aiModels.id, aiModels.providerId, aiModels.userId],
      });
  };

  toggleModelEnabled = async (value: ToggleAiModelEnableParams) => {
    return this.db
      .insert(aiModels)
      .values({ ...value, updatedAt: new Date(), userId: this.userId })
      .onConflictDoUpdate({
        set: { enabled: value.enabled, updatedAt: new Date() },
        target: [aiModels.id, aiModels.providerId, aiModels.userId],
      });
  };

  batchUpdateAiModels = async (providerId: string, models: AiProviderModelListItem[]) => {
    const records = models.map(({ id, ...model }) => ({
      ...model,
      id,
      providerId,
      updatedAt: new Date(),
      userId: this.userId,
    }));

    return this.db
      .insert(aiModels)
      .values(records)
      .onConflictDoNothing({
        target: [aiModels.id, aiModels.userId, aiModels.providerId],
      })
      .returning();
  };

  batchToggleAiModels = async (providerId: string, models: string[], enabled: boolean) => {
    return this.db.transaction(async (trx) => {
      // 1. insert models that are not in the db
      const insertedRecords = await trx
        .insert(aiModels)
        .values(
          models.map((i) => ({
            enabled,
            id: i,
            providerId,
            // if the model is not in the db, it's a builtin model
            source: AiModelSourceEnum.Builtin,
            updatedAt: new Date(),
            userId: this.userId,
          })),
        )
        .onConflictDoNothing({
          target: [aiModels.id, aiModels.userId, aiModels.providerId],
        })
        .returning();

      // 2. update models that are in the db
      const insertedIds = new Set(insertedRecords.map((r) => r.id));
      const recordsToUpdate = models.filter((r) => !insertedIds.has(r));

      await trx
        .update(aiModels)
        .set({ enabled })
        .where(
          and(
            eq(aiModels.providerId, providerId),
            inArray(aiModels.id, recordsToUpdate),
            eq(aiModels.userId, this.userId),
          ),
        );
    });
  };

  clearRemoteModels(providerId: string) {
    return this.db
      .delete(aiModels)
      .where(
        and(
          eq(aiModels.providerId, providerId),
          eq(aiModels.source, AiModelSourceEnum.Remote),
          eq(aiModels.userId, this.userId),
        ),
      );
  }

  clearModelsByProvider(providerId: string) {
    return this.db
      .delete(aiModels)
      .where(and(eq(aiModels.providerId, providerId), eq(aiModels.userId, this.userId)));
  }

  updateModelsOrder = async (providerId: string, sortMap: AiModelSortMap[]) => {
    await this.db.transaction(async (tx) => {
      const updates = sortMap.map(({ id, sort }) => {
        return tx
          .insert(aiModels)
          .values({
            enabled: true,
            id,
            providerId,
            sort,
            // source: isBuiltin ? 'builtin' : 'custom',
            updatedAt: new Date(),
            userId: this.userId,
          })
          .onConflictDoUpdate({
            set: { sort, updatedAt: new Date() },
            target: [aiModels.id, aiModels.userId, aiModels.providerId],
          });
      });

      await Promise.all(updates);
    });
  };
}
