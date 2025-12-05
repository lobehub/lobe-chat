import { topics } from '@lobechat/database/schemas';
import { MemoryExtractionService } from '@lobechat/memory-user-memory';
import type {
  MemoryExtractionJob,
  MemoryExtractionResult,
  MemoryExtractionSourceType,
  MemoryLayer,
  PersistedMemoryResult,
  PreparedExtractionContext,
} from '@lobechat/memory-user-memory';
import { ModelRuntime } from '@lobechat/model-runtime';
import type { Embeddings } from '@lobechat/model-runtime';
import {
  layerEntriesHistogram,
  processedDurationHistogram,
  processedSourceCounter,
} from '@lobechat/observability-otel/api';
import { Client } from '@upstash/workflow';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

import {
  DEFAULT_USER_MEMORY_EMBEDDING_DIMENSIONS,
  DEFAULT_USER_MEMORY_EMBEDDING_MODEL_ITEM,
} from '@/const/settings';
import type { ListTopicsForMemoryExtractorCursor } from '@/database/models/topic';
import { TopicModel } from '@/database/models/topic';
import type { ListUsersForMemoryExtractorCursor } from '@/database/models/user';
import { UserModel } from '@/database/models/user';
import { UserMemoryModel } from '@/database/models/userMemory';
import { getServerDB } from '@/database/server';
import { getServerGlobalConfig } from '@/server/globalConfig';
import {
  MemoryAgentConfig,
  parseMemoryExtractionConfig,
} from '@/server/globalConfig/parseMemoryExtractionConfig';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import type { GlobalMemoryLayer } from '@/types/serverConfig';
import type { UserKeyVaults } from '@/types/user/settings';
import { LayersEnum, MergeStrategyEnum, TypesEnum } from '@/types/userMemory';

const SOURCE_ALIAS_MAP: Record<string, MemoryExtractionSourceType> = {
  chatTopic: 'chat_topic',
  chatTopics: 'chat_topic',
  chat_topic: 'chat_topic',
  lark: 'lark',
  notion: 'notion',
  obsidian: 'obsidian',
};

const LAYER_ALIAS = new Set<MemoryLayer>(['context', 'experience', 'identity', 'preference']);

const LAYER_LABEL_MAP: Record<MemoryLayer, string> = {
  context: 'contexts',
  experience: 'experiences',
  identity: 'identities',
  preference: 'preferences',
};

export interface MemoryExtractionWorkflowCursor {
  createdAt: string;
  id: string;
}

export interface TopicWorkflowCursor extends MemoryExtractionWorkflowCursor {
  userId: string;
}

export interface MemoryExtractionNormalizedPayload {
  baseUrl: string;
  forceAll: boolean;
  forceTopics: boolean;
  from?: Date;
  layers: MemoryLayer[];
  /**
   * - `workflow` depends on Upstash Workflows to process the extraction asynchronously.
   * - `direct` processes the extraction within the webhook request itself.
   */
  mode: 'workflow' | 'direct';
  sources: MemoryExtractionSourceType[];
  to?: Date;
  topicCursor?: TopicWorkflowCursor;
  topicIds: string[];
  userCursor?: MemoryExtractionWorkflowCursor;
  userId?: string;
  userIds: string[];
}

export const memoryExtractionPayloadSchema = z.object({
  baseUrl: z.string().url().optional(),
  execution: z.enum(['workflow', 'direct']).optional(),
  forceAll: z.boolean().optional(),
  forceTopics: z.boolean().optional(),
  fromDate: z.coerce.date().optional(),
  layers: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  toDate: z.coerce.date().optional(),
  topicCursor: z
    .object({
      createdAt: z.string(),
      id: z.string(),
      userId: z.string(),
    })
    .optional(),
  topicIds: z.array(z.string()).optional(),
  userCursor: z
    .object({
      createdAt: z.string(),
      id: z.string(),
    })
    .optional(),
  userId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
});

export type MemoryExtractionPayloadInput = z.infer<typeof memoryExtractionPayloadSchema>;

const normalizeSources = (sources?: string[]): MemoryExtractionSourceType[] => {
  if (!sources) return [];

  const normalized = sources
    .map((source) => SOURCE_ALIAS_MAP[source as keyof typeof SOURCE_ALIAS_MAP])
    .filter(Boolean) as MemoryExtractionSourceType[];

  return Array.from(new Set(normalized));
};

const normalizeLayers = (layers?: string[]): MemoryLayer[] => {
  if (!layers) return [];

  const normalized = layers
    .map((layer) => layer.toLowerCase() as MemoryLayer)
    .filter((layer) => LAYER_ALIAS.has(layer));

  return Array.from(new Set(normalized));
};

export const normalizeMemoryExtractionPayload = (
  payload: MemoryExtractionPayloadInput,
  fallbackBaseUrl?: string,
): MemoryExtractionNormalizedPayload => {
  const parsed = memoryExtractionPayloadSchema.parse(payload);
  const baseUrl = parsed.baseUrl || fallbackBaseUrl;
  if (!baseUrl) throw new Error('Missing baseUrl for workflow trigger');

  return {
    baseUrl,
    forceAll: parsed.forceAll ?? false,
    forceTopics: parsed.forceTopics ?? false,
    from: parsed.fromDate,
    layers: normalizeLayers(parsed.layers),
    mode: parsed.execution ?? 'workflow',
    sources: normalizeSources(parsed.sources),
    to: parsed.toDate,
    topicCursor: parsed.topicCursor,
    topicIds: Array.from(new Set(parsed.topicIds || [])).filter(Boolean),
    userCursor: parsed.userCursor,
    userId: parsed.userId ?? parsed.userIds?.[0],
    userIds: Array.from(
      new Set([...(parsed.userIds || []), ...(parsed.userId ? [parsed.userId] : [])]),
    ).filter(Boolean),
  };
};

export type UserTopicWorkflowPayload = MemoryExtractionPayloadInput;

export interface TopicBatchWorkflowPayload extends MemoryExtractionPayloadInput {
  topicIds: string[];
  userId: string;
}

export const buildWorkflowPayloadInput = (
  payload: MemoryExtractionNormalizedPayload,
): MemoryExtractionPayloadInput => ({
  baseUrl: payload.baseUrl,
  execution: payload.mode,
  forceAll: payload.forceAll,
  forceTopics: payload.forceTopics,
  fromDate: payload.from,
  layers: payload.layers,
  sources: payload.sources,
  toDate: payload.to,
  topicCursor: payload.topicCursor,
  topicIds: payload.topicIds,
  userCursor: payload.userCursor,
  userId: payload.userId ?? payload.userIds[0],
  userIds: payload.userIds,
});

const normalizeProvider = (provider: string) => provider.toLowerCase() as keyof UserKeyVaults;

const extractCredentialsFromVault = (provider: string, keyVaults?: UserKeyVaults) => {
  const vault = keyVaults?.[normalizeProvider(provider)];

  if (!vault || typeof vault !== 'object') return {};

  const apiKey = 'apiKey' in vault && typeof vault.apiKey === 'string' ? vault.apiKey : undefined;
  const baseURL =
    'baseURL' in vault && typeof vault.baseURL === 'string' ? vault.baseURL : undefined;

  return { apiKey, baseURL };
};

const resolveLayerModels = (
  layers: Partial<Record<GlobalMemoryLayer, string>> | undefined,
  fallback: Record<GlobalMemoryLayer, string>,
): Record<MemoryLayer, string> => ({
  context: layers?.context ?? fallback.context,
  experience: layers?.experience ?? fallback.experience,
  identity: layers?.identity ?? fallback.identity,
  preference: layers?.preference ?? fallback.preference,
});

const initRuntimeForAgent = async (agent: MemoryAgentConfig, keyVaults?: UserKeyVaults) => {
  const provider = agent.provider || 'openai';
  const { apiKey: userApiKey, baseURL: userBaseURL } = extractCredentialsFromVault(
    provider,
    keyVaults,
  );

  const apiKey = userApiKey || agent.apiKey;
  if (!apiKey) throw new Error(`Missing API key for ${provider} memory extraction runtime`);

  return ModelRuntime.initializeWithProvider(provider, {
    apiKey,
    baseURL: userBaseURL || agent.baseURL,
  });
};

const isTopicExtracted = (metadata: any): boolean => {
  const extractStatus = metadata?.memory_user_memory_extract?.extract_status;
  if (extractStatus) return extractStatus === 'completed';

  const state = metadata?.memoryExtraction?.sources?.chat_topic;
  return state?.status === 'completed' && !!state?.lastRunAt;
};

type RuntimeBundle = {
  embeddings: ModelRuntime;
  gatekeeper: ModelRuntime;
  layerExtractor: ModelRuntime;
};

export interface TopicExtractionJob {
  forceAll: boolean;
  forceTopics: boolean;
  from?: Date;
  layers: MemoryLayer[];
  source: MemoryExtractionSourceType;
  to?: Date;
  topicId: string;
  userId: string;
}

export interface TopicPaginationJob {
  cursor?: ListTopicsForMemoryExtractorCursor;
  forceAll: boolean;
  forceTopics: boolean;
  from?: Date;
  to?: Date;
  userId: string;
}

export interface UserPaginationResult {
  cursor?: ListUsersForMemoryExtractorCursor;
  ids: string[];
}

type MemoryExtractionConfig = ReturnType<typeof parseMemoryExtractionConfig>;
type ServerConfig = Awaited<ReturnType<typeof getServerGlobalConfig>>;

export class MemoryExtractionExecutor {
  private readonly privateConfig: MemoryExtractionConfig;
  private readonly serverConfig: ServerConfig;
  private readonly modelConfig: {
    embeddingsModel: string;
    gateModel: string;
    layerModels: Partial<Record<MemoryLayer, string>>;
  };

  private readonly runtimeCache = new Map<string, RuntimeBundle>();
  private readonly db = getServerDB();

  private constructor(serverConfig: ServerConfig, privateConfig: MemoryExtractionConfig) {
    this.serverConfig = serverConfig;
    this.privateConfig = privateConfig;

    const publicMemoryConfig = serverConfig.memory?.userMemory;

    this.modelConfig = {
      embeddingsModel:
        publicMemoryConfig?.embedding?.model ??
        privateConfig.embedding?.model ??
        privateConfig.agentLayerExtractor.model ??
        DEFAULT_USER_MEMORY_EMBEDDING_MODEL_ITEM.model,
      gateModel: publicMemoryConfig?.agentGateKeeper?.model ?? privateConfig.agentGateKeeper.model,
      layerModels: resolveLayerModels(
        publicMemoryConfig?.agentLayerExtractor.layers,
        privateConfig.agentLayerExtractor.layers,
      ),
    };
  }

  static async create() {
    const [serverConfig, privateConfig] = await Promise.all([
      getServerGlobalConfig(),
      Promise.resolve(parseMemoryExtractionConfig()),
    ]);

    return new MemoryExtractionExecutor(serverConfig, privateConfig);
  }

  private buildBaseMetadata(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    layer: MemoryLayer,
    labels?: string[] | null,
  ) {
    return {
      conversationDigest: context.metadata.conversationDigest,
      labels: labels ?? undefined,
      layer,
      messageIds: context.metadata.messageIds ?? [],
      source: job.source,
      sourceId: job.sourceId,
      topicId: context.topicId,
    };
  }

  private async generateEmbeddings(
    runtimes: ModelRuntime,
    model: string,
    texts: Array<string | undefined | null>,
  ) {
    const requests = texts
      .map((text, index) => ({ index, text }))
      .filter(
        (item): item is { index: number; text: string } =>
          typeof item.text === 'string' && item.text.trim().length > 0,
      );

    if (requests.length === 0) return texts.map(() => null);

    try {
      const response = await runtimes.embeddings(
        {
          dimensions: DEFAULT_USER_MEMORY_EMBEDDING_DIMENSIONS,
          input: requests.map((item) => item.text),
          model,
        },
        { user: 'memory-extraction' },
      );

      const vectors = texts.map<Embeddings | null>(() => null);
      response?.forEach((embedding, idx) => {
        const request = requests[idx];
        if (request) {
          vectors[request.index] = embedding;
        }
      });

      return vectors;
    } catch {
      return texts.map(() => null);
    }
  }

  async persistContextMemories(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    result: NonNullable<MemoryExtractionResult['outputs']['context']>,
    runtime: ModelRuntime,
    model: string,
    db: Awaited<ReturnType<typeof getServerDB>>,
  ) {
    const insertedIds: string[] = [];
    const userMemoryModel = new UserMemoryModel(db, job.userId);

    for (const item of result.memories ?? []) {
      const [summaryVector, detailsVector, descriptionVector] = await this.generateEmbeddings(
        runtime,
        model,
        [item.summary, item.details, item.withContext?.description],
      );
      const baseMetadata = this.buildBaseMetadata(
        job,
        context,
        'context',
        item.withContext?.labels,
      );

      const { memory } = await userMemoryModel.createContextMemory({
        context: {
          associatedObjects: UserMemoryModel.normalizeAssociations(
            item.withContext?.associatedObjects,
          ),
          associatedSubjects: UserMemoryModel.normalizeAssociations(
            item.withContext?.associatedSubjects,
          ),
          currentStatus: item.withContext?.currentStatus ?? null,
          description: item.withContext?.description ?? null,
          descriptionVector: descriptionVector || null,
          metadata: baseMetadata,
          scoreImpact: item.withContext?.scoreImpact ?? null,
          scoreUrgency: item.withContext?.scoreUrgency ?? null,
          tags: item.withContext?.labels ?? null,
          title: item.withContext?.title ?? null,
          type: item.withContext?.type ?? null,
        },
        details: item.details ?? '',
        detailsEmbedding: detailsVector ?? undefined,
        memoryCategory: item.memoryCategory ?? null,
        memoryLayer: (item.memoryLayer as LayersEnum) ?? LayersEnum.Context,
        memoryType: (item.memoryType as TypesEnum) ?? TypesEnum.Context,
        summary: item.summary ?? '',
        summaryEmbedding: summaryVector ?? undefined,
        title: item.title ?? '',
      });

      insertedIds.push(memory.id);
    }

    return insertedIds;
  }

  async persistExperienceMemories(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    result: NonNullable<MemoryExtractionResult['outputs']['experience']>,
    runtime: ModelRuntime,
    model: string,
    db: Awaited<ReturnType<typeof getServerDB>>,
  ) {
    const insertedIds: string[] = [];
    const userMemoryModel = new UserMemoryModel(db, job.userId);

    for (const item of result.memories ?? []) {
      const [summaryVector, detailsVector, situationVector, actionVector, keyLearningVector] =
        await this.generateEmbeddings(runtime, model, [
          item.summary,
          item.details,
          item.withExperience?.situation,
          item.withExperience?.action,
          item.withExperience?.keyLearning,
        ]);
      const baseMetadata = this.buildBaseMetadata(
        job,
        context,
        'experience',
        item.withExperience?.labels,
      );

      const { memory } = await userMemoryModel.createExperienceMemory({
        details: item.details ?? '',
        detailsEmbedding: detailsVector ?? undefined,
        experience: {
          action: item.withExperience?.action ?? null,
          actionVector: actionVector || null,
          keyLearning: item.withExperience?.keyLearning ?? null,
          keyLearningVector: keyLearningVector || null,
          metadata: baseMetadata,
          possibleOutcome: item.withExperience?.possibleOutcome ?? null,
          reasoning: item.withExperience?.reasoning ?? null,
          scoreConfidence: item.withExperience?.scoreConfidence ?? null,
          situation: item.withExperience?.situation ?? null,
          situationVector: situationVector || null,
          tags: item.withExperience?.labels ?? null,
          type: item.withExperience?.type ?? null,
        },
        memoryCategory: item.memoryCategory ?? null,
        memoryLayer: (item.memoryLayer as LayersEnum) ?? LayersEnum.Experience,
        memoryType: (item.memoryType as TypesEnum) ?? TypesEnum.Activity,
        summary: item.summary ?? '',
        summaryEmbedding: summaryVector ?? undefined,
        title: item.title ?? '',
      });

      insertedIds.push(memory.id);
    }

    return insertedIds;
  }

  async persistPreferenceMemories(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    result: NonNullable<MemoryExtractionResult['outputs']['preference']>,
    runtime: ModelRuntime,
    model: string,
    db: Awaited<ReturnType<typeof getServerDB>>,
  ) {
    const insertedIds: string[] = [];
    const userMemoryModel = new UserMemoryModel(db, job.userId);

    for (const item of result.memories ?? []) {
      const [summaryVector, detailsVector, directiveVector] = await this.generateEmbeddings(
        runtime,
        model,
        [item.summary, item.details, item.withPreference?.conclusionDirectives],
      );
      const baseMetadata = this.buildBaseMetadata(
        job,
        context,
        'preference',
        item.withPreference?.extractedLabels,
      );

      const { memory } = await userMemoryModel.createPreferenceMemory({
        details: item.details ?? '',
        detailsEmbedding: detailsVector ?? undefined,
        memoryCategory: item.memoryCategory ?? null,
        memoryLayer: (item.memoryLayer as LayersEnum) ?? LayersEnum.Preference,
        memoryType: (item.memoryType as TypesEnum) ?? TypesEnum.Preference,
        preference: {
          conclusionDirectives: item.withPreference?.conclusionDirectives ?? null,
          conclusionDirectivesVector: directiveVector ?? null,
          metadata: {
            ...baseMetadata,
            scopes: item.withPreference?.extractedScopes ?? undefined,
          },
          scorePriority: item.withPreference?.scorePriority ?? null,
          suggestions: item.withPreference?.suggestions?.join('\n') ?? null,
          tags: item.withPreference?.extractedLabels ?? null,
          type: item.withPreference?.type ?? null,
        },
        summary: item.summary ?? '',
        summaryEmbedding: summaryVector ?? undefined,
        title: item.title ?? '',
      });

      insertedIds.push(memory.id);
    }

    return insertedIds;
  }

  async persistIdentityMemories(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    result: NonNullable<MemoryExtractionResult['outputs']['identity']>,
    runtime: ModelRuntime,
    model: string,
    db: Awaited<ReturnType<typeof getServerDB>>,
  ) {
    const insertedIds: string[] = [];
    const userMemoryModel = new UserMemoryModel(db, job.userId);

    for (const action of result ?? []) {
      if (action.name === 'addIdentity') {
        const { arguments: args } = action;
        const [summaryVector] = await this.generateEmbeddings(runtime, model, [args.description]);
        const metadata = this.buildBaseMetadata(job, context, 'identity', args.extractedLabels);

        const res = await userMemoryModel.addIdentityEntry({
          base: {
            details: args.description,
            detailsVector1024: summaryVector ?? undefined,
            memoryCategory: 'people',
            memoryLayer: LayersEnum.Identity,
            memoryType: TypesEnum.People,
            metadata,
            summary: args.description,
            summaryVector1024: summaryVector ?? undefined,
          },
          identity: {
            description: args.description,
            metadata,
            relationship: args.relationship ?? undefined,
            role: args.role ?? undefined,
            tags: args.extractedLabels ?? undefined,
            type: args.type ?? undefined,
          },
        });

        insertedIds.push(res.userMemoryId);
      }

      if (action.name === 'updateIdentity') {
        const { arguments: args } = action;
        const [descriptionVector] = await this.generateEmbeddings(runtime, model, [
          args.set.description,
        ]);

        await userMemoryModel.updateIdentityEntry({
          identity: {
            description: args.set.description,
            descriptionVector: descriptionVector ?? undefined,
            metadata: args.set.extractedLabels
              ? this.buildBaseMetadata(job, context, 'identity', args.set.extractedLabels)
              : undefined,
            relationship: args.set.relationship ?? undefined,
            role: args.set.role ?? undefined,
            type: args.set.type ?? undefined,
          },
          identityId: args.id,
          mergeStrategy: args.mergeStrategy as MergeStrategyEnum,
        });
      }

      if (action.name === 'removeIdentity' && action.arguments?.id) {
        await userMemoryModel.removeIdentityEntry(action.arguments.id);
      }
    }

    return insertedIds;
  }

  async extractTopic(job: TopicExtractionJob) {
    const startTime = Date.now();
    const db = await this.db;
    const topic = await db.query.topics.findFirst({
      columns: { createdAt: true, id: true, metadata: true, userId: true },
      where: and(eq(topics.id, job.topicId), eq(topics.userId, job.userId)),
    });

    if (!topic) {
      console.warn(`[memory-extraction] topic ${job.topicId} not found for user ${job.userId}`);
      return false;
    }
    if ((job.from && topic.createdAt < job.from) || (job.to && topic.createdAt > job.to)) {
      return false;
    }
    if (!job.forceAll && !job.forceTopics && isTopicExtracted(topic.metadata)) {
      return false;
    }

    const userModel = new UserModel(db, job.userId);
    const userState = await userModel.getUserState(KeyVaultsGateKeeper.getUserKeyVaults);
    const keyVaults = userState.settings?.keyVaults as UserKeyVaults | undefined;

    const runtimes = await this.getRuntime(job.userId, keyVaults);
    const service = new MemoryExtractionService({
      config: this.modelConfig,
      db,
      runtimes,
    });

    let extraction: MemoryExtractionResult | null = null;
    const extractionJob: MemoryExtractionJob = {
      force: job.forceAll || job.forceTopics,
      layers: job.layers,
      source: job.source,
      sourceId: topic.id,
      userId: job.userId,
    };

    try {
      extraction = await service.run(extractionJob);
      if (!extraction) {
        this.recordJobMetrics(extractionJob, 'completed', Date.now() - startTime);
        return false;
      }

      const persisted = await this.persistExtraction(extractionJob, extraction, runtimes, db);

      await extraction.provider.complete(extractionJob, extraction.context, persisted, {
        db,
        embeddingsModel: this.modelConfig.embeddingsModel,
        runtime: runtimes.layerExtractor,
      });

      this.recordJobMetrics(extractionJob, 'completed', Date.now() - startTime);

      return true;
    } catch (error) {
      if (extraction) {
        await extraction.provider.fail?.(extractionJob, extraction.context, error as Error, {
          db,
          embeddingsModel: this.modelConfig.embeddingsModel,
          runtime: runtimes.layerExtractor,
        });
      }
      this.recordJobMetrics(extractionJob, 'failed', Date.now() - startTime);
      throw error;
    }
  }

  async runDirect(payload: MemoryExtractionNormalizedPayload) {
    if (!payload.sources.includes('chat_topic')) {
      return { message: 'Direct execution currently supports chat_topic only.', processed: 0 };
    }
    if (!payload.userIds.length) {
      throw new Error('Direct execution requires at least one user id.');
    }
    if (!payload.topicIds.length) {
      throw new Error('Direct execution requires topicIds for chat_topic sources.');
    }

    const results: { extracted: boolean; topicId: string; userId: string }[] = [];

    for (const userId of payload.userIds) {
      const topicIds = await this.filterTopicIdsForUser(userId, payload.topicIds);
      for (const topicId of topicIds) {
        const extracted = await this.extractTopic({
          forceAll: payload.forceAll,
          forceTopics: payload.forceTopics,
          from: payload.from,
          layers: payload.layers,
          source: 'chat_topic',
          to: payload.to,
          topicId,
          userId,
        });

        results.push({ extracted, topicId, userId });
      }
    }

    return { processed: results.length, results };
  }

  async getTopicsForUser(
    job: TopicPaginationJob,
    pageSize: number,
  ): Promise<{ cursor?: ListTopicsForMemoryExtractorCursor; ids: string[] }> {
    const db = await this.db;
    const topicModel = new TopicModel(db, job.userId);
    const rows = await topicModel.listTopicsForMemoryExtractor({
      cursor: job.cursor,
      endDate: job.to,
      ignoreExtracted: job.forceAll || job.forceTopics,
      limit: pageSize,
      startDate: job.from,
    });

    if (!rows?.length) return { ids: [] };

    const last = rows.at(-1);
    const nextCursor = last
      ? {
          createdAt: last.createdAt,
          id: last.id,
        }
      : undefined;

    return {
      cursor: nextCursor,
      ids: rows.map((topic) => topic.id),
    };
  }

  async getUsers(
    limit: number,
    cursor?: ListUsersForMemoryExtractorCursor,
  ): Promise<UserPaginationResult> {
    const db = await this.db;

    const rows = await UserModel.listUsersForMemoryExtractor(db, { cursor, limit });
    if (!rows?.length) return { ids: [] };

    const last = rows.at(-1);

    return {
      cursor: last ? { createdAt: last.createdAt, id: last.id } : undefined,
      ids: rows.map((row) => row.id),
    };
  }

  async filterTopicIdsForUser(userId: string, topicIds: string[]) {
    if (!topicIds.length) return [];

    const db = await this.db;
    const rows = await db.query.topics.findMany({
      columns: { id: true },
      where: and(eq(topics.userId, userId), inArray(topics.id, topicIds)),
    });

    return rows.map((row) => row.id);
  }

  private recordJobMetrics(
    job: MemoryExtractionJob,
    status: 'completed' | 'failed',
    durationMs: number,
  ) {
    processedSourceCounter.add(1, {
      source: job.source,
      status,
      user_id: job.userId,
    });
    processedDurationHistogram.record(durationMs, {
      source: job.source,
      user_id: job.userId,
    });
  }

  private recordLayerEntries(job: MemoryExtractionJob, layer: MemoryLayer, count: number) {
    const attributes = {
      layer: LAYER_LABEL_MAP[layer],
      source: job.source,
      user_id: job.userId,
    };
    layerEntriesHistogram.record(count, attributes);
  }

  private async persistExtraction(
    job: MemoryExtractionJob,
    extraction: MemoryExtractionResult,
    runtimes: RuntimeBundle,
    db: Awaited<ReturnType<typeof getServerDB>>,
  ): Promise<PersistedMemoryResult> {
    const createdIds: string[] = [];
    const perLayer: Partial<Record<MemoryLayer, number>> = {};

    if (extraction.outputs.context) {
      const ids = await this.persistContextMemories(
        job,
        extraction.context,
        extraction.outputs.context,
        runtimes.embeddings,
        this.modelConfig.embeddingsModel,
        db,
      );
      createdIds.push(...ids);
      perLayer.context = ids.length;
      this.recordLayerEntries(job, 'context', ids.length);
    }

    if (extraction.outputs.experience) {
      const ids = await this.persistExperienceMemories(
        job,
        extraction.context,
        extraction.outputs.experience,
        runtimes.embeddings,
        this.modelConfig.embeddingsModel,
        db,
      );
      createdIds.push(...ids);
      perLayer.experience = ids.length;
      this.recordLayerEntries(job, 'experience', ids.length);
    }

    if (extraction.outputs.preference) {
      const ids = await this.persistPreferenceMemories(
        job,
        extraction.context,
        extraction.outputs.preference,
        runtimes.embeddings,
        this.modelConfig.embeddingsModel,
        db,
      );
      createdIds.push(...ids);
      perLayer.preference = ids.length;
      this.recordLayerEntries(job, 'preference', ids.length);
    }

    if (extraction.outputs.identity) {
      const ids = await this.persistIdentityMemories(
        job,
        extraction.context,
        extraction.outputs.identity,
        runtimes.embeddings,
        this.modelConfig.embeddingsModel,
        db,
      );
      createdIds.push(...ids);
      perLayer.identity = ids.length;
      this.recordLayerEntries(job, 'identity', ids.length);
    }

    return { createdIds, layers: perLayer };
  }

  private async getRuntime(userId: string, keyVaults?: UserKeyVaults): Promise<RuntimeBundle> {
    const cached = this.runtimeCache.get(userId);
    if (cached) return cached;

    const runtimes: RuntimeBundle = {
      embeddings: await initRuntimeForAgent(this.privateConfig.embedding, keyVaults),
      gatekeeper: await initRuntimeForAgent(this.privateConfig.agentGateKeeper, keyVaults),
      layerExtractor: await initRuntimeForAgent(this.privateConfig.agentLayerExtractor, keyVaults),
    };

    this.runtimeCache.set(userId, runtimes);

    return runtimes;
  }
}

const WORKFLOW_PATHS = {
  topicBatch: '/api/workflows/memory-user-memory/pipelines/process-topic',
  userTopics: '/api/workflows/memory-user-memory/pipelines/process-user-topics',
  users: '/api/workflows/memory-user-memory/pipelines/process-users',
} as const;

const getWorkflowUrl = (path: string, baseUrl: string) => {
  const url = new URL(path, baseUrl);

  return url.toString();
};

const getWorkflowClient = () => {
  const token = process.env.QSTASH_TOKEN;
  if (!token) throw new Error('QSTASH_TOKEN is required to trigger workflows');

  const config: ConstructorParameters<typeof Client>[0] = { token };

  if (process.env.QSTASH_URL) {
    (config as Record<string, unknown>).url = process.env.QSTASH_URL;
  }

  return new Client(config);
};

export class MemoryExtractionWorkflowService {
  private static client: Client;

  private static getClient() {
    if (!this.client) {
      this.client = getWorkflowClient();
    }

    return this.client;
  }

  static triggerProcessUsers(payload: MemoryExtractionPayloadInput) {
    if (!payload.baseUrl) {
      throw new Error('Missing baseUrl for workflow trigger');
    }

    const url = getWorkflowUrl(WORKFLOW_PATHS.users, payload.baseUrl);
    return this.getClient().trigger({ body: payload, url });
  }

  static triggerProcessUserTopics(payload: UserTopicWorkflowPayload) {
    if (!payload.baseUrl) {
      throw new Error('Missing baseUrl for workflow trigger');
    }

    const url = getWorkflowUrl(WORKFLOW_PATHS.userTopics, payload.baseUrl);
    return this.getClient().trigger({ body: payload, url });
  }

  static triggerProcessTopicBatch(payload: TopicBatchWorkflowPayload) {
    if (!payload.baseUrl) {
      throw new Error('Missing baseUrl for workflow trigger');
    }

    const url = getWorkflowUrl(WORKFLOW_PATHS.topicBatch, payload.baseUrl);
    return this.getClient().trigger({ body: payload, url });
  }
}
