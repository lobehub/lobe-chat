import { messages, topics } from '@lobechat/database/schemas';
import {
  LobeChatTopicContextProvider,
  LobeChatTopicResultRecorder,
  MemoryExtractionService,
  RetrievalUserMemoryContextProvider,
  RetrievalUserMemoryIdentitiesProvider,
} from '@lobechat/memory-user-memory';
import type {
  MemoryExtractionJob,
  MemoryExtractionResult,
  MemoryExtractionSourceType,
  PersistedMemoryResult,
} from '@lobechat/memory-user-memory';
import { ModelRuntime } from '@lobechat/model-runtime';
import type {
  Embeddings,
  GenerateObjectPayload,
  LLMRoleType,
  OpenAIChatMessage,
} from '@lobechat/model-runtime';
import { SpanStatusCode } from '@lobechat/observability-otel/api';
import {
  layerEntriesHistogram,
  processedDurationHistogram,
  processedSourceCounter,
  tracer,
} from '@lobechat/observability-otel/modules/memory-user-memory';
import { Client } from '@upstash/workflow';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { join } from 'pathe';
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
import { S3 } from '@/server/modules/S3';
import type { GlobalMemoryLayer } from '@/types/serverConfig';
import type { UserKeyVaults } from '@/types/user/settings';
import { LayersEnum, MergeStrategyEnum, TypesEnum, UserMemoryLayer } from '@/types/userMemory';

const SOURCE_ALIAS_MAP: Record<string, MemoryExtractionSourceType> = {
  chatTopic: 'chat_topic',
  chatTopics: 'chat_topic',
  chat_topic: 'chat_topic',
  lark: 'lark',
  notion: 'notion',
  obsidian: 'obsidian',
};

const LAYER_ALIAS = new Set<UserMemoryLayer>([
  UserMemoryLayer.Context,
  UserMemoryLayer.Experience,
  UserMemoryLayer.Identity,
  UserMemoryLayer.Preference,
]);

const LAYER_LABEL_MAP: Record<UserMemoryLayer, string> = {
  [UserMemoryLayer.Context]: 'contexts',
  [UserMemoryLayer.Experience]: 'experiences',
  [UserMemoryLayer.Identity]: 'identities',
  [UserMemoryLayer.Preference]: 'preferences',
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
  layers: UserMemoryLayer[];
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
  forceAll: z.boolean().optional(),
  forceTopics: z.boolean().optional(),
  fromDate: z.coerce.date().optional(),
  layers: z.array(z.string()).optional(),
  mode: z.enum(['workflow', 'direct']).optional(),
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

const normalizeLayers = (layers?: string[]): UserMemoryLayer[] => {
  if (!layers) return [];

  const normalized = layers
    .map((layer) => layer.toLowerCase() as UserMemoryLayer)
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
    mode: parsed.mode ?? 'workflow',
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
  forceAll: payload.forceAll,
  forceTopics: payload.forceTopics,
  fromDate: payload.from,
  layers: payload.layers,
  mode: payload.mode,
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
): Record<UserMemoryLayer, string> => ({
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
  layers: UserMemoryLayer[];
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
    layerModels: Partial<Record<UserMemoryLayer, string>>;
    observabilityS3: MemoryExtractionConfig['observabilityS3'];
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
      observabilityS3: privateConfig.observabilityS3,
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
    messageIds: string[],
    layer: UserMemoryLayer,
    labels?: string[] | null,
  ) {
    return {
      labels: labels ?? undefined,
      layer,
      messageIds,
      source: job.source,
      sourceId: job.sourceId,
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
    messageIds: string[],
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
        messageIds,
        UserMemoryLayer.Context,
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
    messageIds: string[],
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
        messageIds,
        UserMemoryLayer.Experience,
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
    messageIds: string[],
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
        messageIds,
        UserMemoryLayer.Preference,
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
    messageIds: string[],
    result: NonNullable<MemoryExtractionResult['outputs']['identity']>,
    runtime: ModelRuntime,
    model: string,
    db: Awaited<ReturnType<typeof getServerDB>>,
  ) {
    const insertedIds: string[] = [];
    const userMemoryModel = new UserMemoryModel(db, job.userId);

    const actions = result.withIdentities?.actions;
    const addActions = actions?.add ?? [];
    const updateActions = actions?.update ?? [];
    const removeActions = actions?.remove ?? [];

    for (const action of addActions) {
      const [summaryVector] = await this.generateEmbeddings(runtime, model, [action.description]);
      const metadata = this.buildBaseMetadata(
        job,
        messageIds,
        UserMemoryLayer.Identity,
        action.extractedLabels,
      );

      const res = await userMemoryModel.addIdentityEntry({
        base: {
          details: action.description,
          detailsVector1024: summaryVector ?? undefined,
          memoryCategory: 'people',
          memoryLayer: LayersEnum.Identity,
          memoryType: TypesEnum.People,
          metadata,
          summary: action.description,
          summaryVector1024: summaryVector ?? undefined,
        },
        identity: {
          description: action.description,
          metadata,
          relationship: action.relationship ?? undefined,
          role: action.role ?? undefined,
          tags: action.extractedLabels ?? undefined,
          type: action.type ?? undefined,
        },
      });

      insertedIds.push(res.userMemoryId);
    }

    for (const action of updateActions) {
      const { set } = action;
      const [descriptionVector] = set.description
        ? await this.generateEmbeddings(runtime, model, [set.description])
        : [];

      await userMemoryModel.updateIdentityEntry({
        identity: {
          description: set.description,
          descriptionVector: descriptionVector ?? undefined,
          metadata: set.extractedLabels
            ? this.buildBaseMetadata(job, messageIds, UserMemoryLayer.Identity, set.extractedLabels)
            : undefined,
          relationship: set.relationship ?? undefined,
          role: set.role ?? undefined,
          type: set.type ?? undefined,
        },
        identityId: action.id,
        mergeStrategy: action.mergeStrategy as MergeStrategyEnum,
      });
    }

    for (const action of removeActions) {
      await userMemoryModel.removeIdentityEntry(action.id);
    }

    return insertedIds;
  }

  async listConversationsForTopic(userId: string, topicId: string, topicUpdatedAt: Date) {
    const db = await this.db;
    const rows = await db
      .select({
        content: messages.content,
        createdAt: messages.createdAt,
        id: messages.id,
        role: messages.role,
      })
      .from(messages)
      .where(and(eq(messages.userId, userId), eq(messages.topicId, topicId)))
      .orderBy(asc(messages.createdAt));

    const conversation = rows
      .filter((row) => typeof row.content === 'string' && row.content.trim().length > 0)
      .map(
        (row) =>
          ({
            content: row.content as string,
            createdAt: row.createdAt ?? topicUpdatedAt,
            id: row.id,
            role: (row.role ?? 'assistant') as LLMRoleType,
          }) satisfies OpenAIChatMessage & { createdAt: Date; id: string },
      );

    if (conversation.length === 0) {
      return [];
    }

    return conversation;
  }

  async listRelevantUserMemories(
    job: MemoryExtractionJob,
    runtime: ModelRuntime,
    embeddingModel: string,
    userId: string,
    conversations: OpenAIChatMessage[],
  ) {
    const db = await this.db;
    const userMemoryModel = new UserMemoryModel(db, userId);
    // TODO: make topK configurable
    const topK = 10;
    const aggregatedContent = conversations
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    const embeddings = await runtime.embeddings({
      dimensions: DEFAULT_USER_MEMORY_EMBEDDING_DIMENSIONS,
      input: [aggregatedContent],
      model: embeddingModel,
    });

    const vector = embeddings?.[0];
    if (vector) {
      const retrieved = await userMemoryModel.searchWithEmbedding({
        embedding: vector,
        limits: { contexts: topK, experiences: topK, preferences: topK },
      });

      return retrieved;
    }

    return {
      contexts: [],
      experiences: [],
      preferences: [],
    };
  }

  async listUserMemoryIdentities(job: MemoryExtractionJob, userId: string) {
    const db = await this.db;
    const userMemoryModel = new UserMemoryModel(db, userId);

    return userMemoryModel.getAllIdentities();
  }

  async extractTopic(job: TopicExtractionJob) {
    const attributes = {
      source: job.source,
      source_id: job.topicId,
      user_id: job.userId,
    };

    let observabilityS3: S3 | undefined;
    if (this.modelConfig.observabilityS3?.enabled) {
      observabilityS3 = new S3(
        this.modelConfig.observabilityS3?.accessKeyId,
        this.modelConfig.observabilityS3?.secretAccessKey,
        this.modelConfig.observabilityS3?.endpoint,
        {
          bucket: this.modelConfig.observabilityS3?.bucketName,
          forcePathStyle: this.modelConfig.observabilityS3?.forcePathStyle,
          region: this.modelConfig.observabilityS3?.region,
          setAcl: false,
        },
      );
    }

    return tracer.startActiveSpan(
      'Memory User Memory: Extract Chat Topic',
      { attributes },
      async (span) => {
        const startTime = Date.now();
        let extractionJob: MemoryExtractionJob | null = null;
        let extraction: MemoryExtractionResult | null = null;
        let resultRecorder: LobeChatTopicResultRecorder | null = null;

        try {
          const db = await this.db;
          const topic = await db.query.topics.findFirst({
            columns: { createdAt: true, id: true, metadata: true, updatedAt: true, userId: true },
            where: and(eq(topics.id, job.topicId), eq(topics.userId, job.userId)),
          });

          if (!topic) {
            console.warn(
              `[memory-extraction] topic ${job.topicId} not found for user ${job.userId}`,
            );
            span.setStatus({ code: SpanStatusCode.OK, message: 'topic_not_found' });
            return {
              extracted: false,
              layers: {},
              memoryIds: [],
              traceId: span.spanContext().traceId,
            };
          }
          if ((job.from && topic.createdAt < job.from) || (job.to && topic.createdAt > job.to)) {
            span.setStatus({ code: SpanStatusCode.OK, message: 'topic_out_of_range' });
            return {
              extracted: false,
              layers: {},
              memoryIds: [],
              traceId: span.spanContext().traceId,
            };
          }
          if (!job.forceAll && !job.forceTopics && isTopicExtracted(topic.metadata)) {
            span.setStatus({ code: SpanStatusCode.OK, message: 'already_extracted' });
            return {
              extracted: false,
              layers: {},
              memoryIds: [],
              traceId: span.spanContext().traceId,
            };
          }

          extractionJob = {
            force: job.forceAll || job.forceTopics,
            layers: job.layers,
            source: job.source,
            sourceId: topic.id,
            userId: job.userId,
          };

          const userModel = new UserModel(db, job.userId);
          const userState = await userModel.getUserState(KeyVaultsGateKeeper.getUserKeyVaults);
          const keyVaults = userState.settings?.keyVaults as UserKeyVaults | undefined;
          const language = userState.settings?.general?.language;

          const runtimes = await this.getRuntime(job.userId, keyVaults);

          const conversations = await this.listConversationsForTopic(
            job.userId,
            topic.id,
            topic.updatedAt,
          );
          if (!conversations || conversations.length === 0) {
            if (extractionJob) {
              this.recordJobMetrics(extractionJob, 'completed', Date.now() - startTime);
            }
            span.setStatus({ code: SpanStatusCode.OK, message: 'empty_conversations' });
            return {
              extracted: false,
              layers: {},
              memoryIds: [],
              traceId: span.spanContext().traceId,
            };
          }

          const messageIds = conversations.map((item) => item.id);

          const topicContextProvider = new LobeChatTopicContextProvider({
            conversations: conversations,
            topic: topic,
            topicId: topic.id,
          });
          const topicContext = await topicContextProvider.buildContext(extractionJob);

          resultRecorder = new LobeChatTopicResultRecorder({
            currentMetadata: topic.metadata || {},
            database: db,
            lastMessageAt: (conversations?.at(-1)?.createdAt || topic.updatedAt).toISOString(),
            messageCount: conversations.length,
            topicId: topic.id,
          });

          const retrievedMemories = await this.listRelevantUserMemories(
            extractionJob,
            runtimes.embeddings,
            this.modelConfig.embeddingsModel,
            job.userId,
            conversations,
          );
          const retrievedMemoryContextProvider = new RetrievalUserMemoryContextProvider({
            retrievedMemories,
          });
          const retrievalMemoryContext =
            await retrievedMemoryContextProvider.buildContext(extractionJob);

          const retrievedMemoryIdentities = await this.listUserMemoryIdentities(
            extractionJob,
            job.userId,
          );
          const retrievedMemoryIdentitiesContextProvider =
            new RetrievalUserMemoryIdentitiesProvider({
              retrievedIdentities: retrievedMemoryIdentities,
            });
          const retrievedIdentityContext =
            await retrievedMemoryIdentitiesContextProvider.buildContext(extractionJob);

          const service = new MemoryExtractionService({
            config: this.modelConfig,
            db,
            language,
            runtimes,
          });

          extraction = await service.run(extractionJob, {
            callbacks: {
              onExtractRequest: this.onExtractRequestHook(
                job.userId,
                extractionJob?.source,
                extractionJob?.sourceId,
                observabilityS3,
              ),
              onExtractResponse: this.onExtractResponseHook(
                job.userId,
                extractionJob?.source,
                extractionJob?.sourceId,
                observabilityS3,
              ),
            },
            contextProvider: topicContextProvider,
            language: language,
            resultRecorder: resultRecorder,
            retrievedContexts: [topicContext.context, retrievalMemoryContext.context],
            retrievedIdentitiesContext: retrievedIdentityContext.context,

            sessionDate: topic.updatedAt.toISOString(),
            // TODO: make topK configurable
            topK: 10,
            username:
              userState.fullName || `${userState.firstName} ${userState.lastName}`.trim() || 'User',
          });
          if (!extraction) {
            this.recordJobMetrics(extractionJob, 'completed', Date.now() - startTime);
            span.setStatus({ code: SpanStatusCode.OK, message: 'no_extraction' });
            return {
              extracted: false,
              layers: {},
              memoryIds: [],
              traceId: span.spanContext().traceId,
            };
          }

          const persistedRes = await this.persistExtraction(
            extractionJob,
            messageIds,
            extraction,
            runtimes,
            db,
          );
          await resultRecorder.recordComplete(extractionJob, {
            ...persistedRes,
            processedMemoryCount: persistedRes.createdIds.length,
          });
          this.recordJobMetrics(extractionJob, 'completed', Date.now() - startTime);
          span.setStatus({ code: SpanStatusCode.OK });
          span.setAttribute('memory.processed_memory_count', persistedRes.createdIds.length);

          return {
            extracted: true,
            layers: persistedRes.layers,
            memoryIds: persistedRes.createdIds,
            traceId: span.spanContext().traceId,
          };
        } catch (error) {
          if (extraction && extractionJob && resultRecorder) {
            await resultRecorder.recordFail?.(extractionJob, error as Error);
          }
          if (extractionJob) {
            this.recordJobMetrics(extractionJob, 'failed', Date.now() - startTime);
          }
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : 'Extraction failed',
          });
          span.recordException(error as Error);
          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  private getOnExtractHooksPath(
    userId: string,
    source: string,
    sourceId: string,
  ): string | undefined {
    if (!this.modelConfig.observabilityS3?.enabled) {
      return undefined;
    }

    const withoutBase = `memory-extraction/${userId}/${source}/${sourceId}/`;
    const base = this.modelConfig.observabilityS3?.pathPrefix
      ? this.modelConfig.observabilityS3?.pathPrefix.startsWith('/')
        ? this.modelConfig.observabilityS3?.pathPrefix.slice(1)
        : this.modelConfig.observabilityS3?.pathPrefix
      : '';

    const key = join(`/${base}`, withoutBase);
    return key;
  }

  onExtractRequestHook(
    userId: string,
    source: string,
    sourceId: string,
    s3?: S3,
  ): ((payload: GenerateObjectPayload) => Promise<void>) | undefined {
    if (!this.modelConfig.observabilityS3?.enabled) {
      return undefined;
    }

    return async (payload: GenerateObjectPayload) => {
      await s3!.uploadContent(
        join(
          this.getOnExtractHooksPath(userId, source, sourceId)!,
          'requests',
          `${new Date().toISOString()}.json`,
        ),
        JSON.stringify(payload, null, 2),
      );
    };
  }

  onExtractResponseHook<TOutput>(
    userId: string,
    source: string,
    sourceId: string,
    s3?: S3,
  ): ((response: TOutput) => Promise<void>) | undefined {
    if (!this.modelConfig.observabilityS3?.enabled) {
      return undefined;
    }

    return async (response: TOutput) => {
      await s3!.uploadContent(
        join(
          this.getOnExtractHooksPath(userId, source, sourceId)!,
          'response',
          `${new Date().toISOString()}.json`,
        ),
        JSON.stringify(response, null, 2),
      );
    };
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

    const results: {
      extracted: boolean;
      layers: Record<string, number>;
      memoryIds: string[];
      topicId: string;
      userId: string;
    }[] = [];

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

        results.push({ ...extracted, topicId, userId });
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
    console.log('Fetched topics for user', job.userId, 'count:', rows);
    if (!rows?.length) {
      return { ids: [] };
    }

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

    const rows = await UserModel.listUsersForMemoryExtractor(db, {
      cursor,
      limit,
      whitelist: this.privateConfig.whitelistUsers,
    });
    if (!rows?.length) {
      return { ids: [] };
    }

    const last = rows.at(-1);
    const nextCursor = last
      ? {
          createdAt: last.createdAt,
          id: last.id,
        }
      : undefined;

    return {
      cursor: nextCursor,
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

  private recordLayerEntries(job: MemoryExtractionJob, layer: UserMemoryLayer, count: number) {
    const attributes = {
      layer: LAYER_LABEL_MAP[layer],
      source: job.source,
      user_id: job.userId,
    };
    layerEntriesHistogram.record(count, attributes);
  }

  private async persistExtraction(
    job: MemoryExtractionJob,
    messageIds: string[],
    extraction: MemoryExtractionResult,
    runtimes: RuntimeBundle,
    db: Awaited<ReturnType<typeof getServerDB>>,
  ): Promise<PersistedMemoryResult> {
    const createdIds: string[] = [];
    const perLayer: Partial<Record<UserMemoryLayer, number>> = {};

    if (extraction.outputs.context) {
      const ids = await this.persistContextMemories(
        job,
        messageIds,
        extraction.outputs.context,
        runtimes.embeddings,
        this.modelConfig.embeddingsModel,
        db,
      );
      createdIds.push(...ids);
      perLayer.context = ids.length;
      this.recordLayerEntries(job, UserMemoryLayer.Context, ids.length);
    }

    if (extraction.outputs.experience) {
      const ids = await this.persistExperienceMemories(
        job,
        messageIds,
        extraction.outputs.experience,
        runtimes.embeddings,
        this.modelConfig.embeddingsModel,
        db,
      );
      createdIds.push(...ids);
      perLayer.experience = ids.length;
      this.recordLayerEntries(job, UserMemoryLayer.Experience, ids.length);
    }

    if (extraction.outputs.preference) {
      const ids = await this.persistPreferenceMemories(
        job,
        messageIds,
        extraction.outputs.preference,
        runtimes.embeddings,
        this.modelConfig.embeddingsModel,
        db,
      );
      createdIds.push(...ids);
      perLayer.preference = ids.length;
      this.recordLayerEntries(job, UserMemoryLayer.Preference, ids.length);
    }

    if (extraction.outputs.identity) {
      const ids = await this.persistIdentityMemories(
        job,
        messageIds,
        extraction.outputs.identity,
        runtimes.embeddings,
        this.modelConfig.embeddingsModel,
        db,
      );
      createdIds.push(...ids);
      perLayer.identity = ids.length;
      this.recordLayerEntries(job, UserMemoryLayer.Identity, ids.length);
    }

    return { createdIds, layers: perLayer };
  }

  private async getRuntime(userId: string, keyVaults?: UserKeyVaults): Promise<RuntimeBundle> {
    // TODO: implement a better cache eviction strategy
    // TODO: make cache size configurable
    if (this.runtimeCache.keys.length > 200) {
      this.runtimeCache.clear();
    }

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
