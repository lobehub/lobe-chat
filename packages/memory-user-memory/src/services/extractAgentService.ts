import type { LobeChatDatabase } from '@lobechat/database';
import { ModelRuntime } from '@lobechat/model-runtime';
import type { Embeddings } from '@lobechat/model-runtime';
import {
  gateKeeperCallDurationHistogram,
  gateKeeperCallsCounter,
  layerCallDurationHistogram,
  layerEntriesHistogram,
  layersCallsCounter,
  processedDurationHistogram,
  processedSourceCounter,
} from '@lobechat/observability-otel/api';

import { DEFAULT_USER_MEMORY_EMBEDDING_DIMENSIONS } from '@/const/settings';
import { UserMemoryModel } from '@/database/models/userMemory';
import { LayersEnum, MergeStrategyEnum, TypesEnum } from '@/types/userMemory';

import {
  ContextExtractor,
  ExperienceExtractor,
  IdentityExtractor,
  PreferenceExtractor,
  UserMemoryGateKeeper,
} from '../extractors';
import { ChatTopicProvider } from '../providers/chatTopic';
import {
  BaseExtractorDependencies,
  GatekeeperDecision,
  MemoryExtractionJob,
  MemoryExtractionLLMConfig,
  MemoryExtractionLogger,
  MemoryExtractionProvider,
  MemoryExtractionResult,
  MemoryExtractionSourceType,
  MemoryLayer,
  PersistedMemoryResult,
  PreparedExtractionContext,
} from '../types';
import { resolvePromptRoot } from '../utils/path';

const LAYER_ORDER: MemoryLayer[] = ['identity', 'context', 'preference', 'experience'];

const DEFAULT_LOGGER: MemoryExtractionLogger = {
  debug: () => {},
  error: (message, meta) => console.error('[memory-extract]', message, meta),
  info: () => {},
  warn: (message, meta) => console.warn('[memory-extract]', message, meta),
};

const LAYER_LABEL_MAP: Record<MemoryLayer, string> = {
  context: 'contexts',
  experience: 'experiences',
  identity: 'identities',
  preference: 'preferences',
};

export interface MemoryExtractionRuntimeOptions {
  embeddings?: ModelRuntime;
  gatekeeper: ModelRuntime;
  layerExtractor: ModelRuntime;
}

export interface MemoryExtractionServiceOptions {
  config: MemoryExtractionLLMConfig;
  db: LobeChatDatabase;
  logger?: MemoryExtractionLogger;
  promptRoot?: string;
  providers?: MemoryExtractionProvider[];
  runtimes: MemoryExtractionRuntimeOptions;
}

interface EmbeddingRequest {
  index: number;
  text: string;
}

export class MemoryExtractAgentService {
  private readonly config: MemoryExtractionLLMConfig;
  private readonly db: LobeChatDatabase;
  private readonly gatekeeper: UserMemoryGateKeeper;
  private readonly identityExtractor: IdentityExtractor;
  private readonly contextExtractor: ContextExtractor;
  private readonly experienceExtractor: ExperienceExtractor;
  private readonly preferenceExtractor: PreferenceExtractor;
  private readonly providers: Map<MemoryExtractionSourceType, MemoryExtractionProvider> = new Map();
  private readonly gatekeeperRuntime: ModelRuntime;
  private readonly layerRuntime: ModelRuntime;
  private readonly embeddingRuntime: ModelRuntime;
  private readonly logger: MemoryExtractionLogger;
  private readonly promptRoot: string;

  constructor(options: MemoryExtractionServiceOptions) {
    this.config = options.config;
    this.db = options.db;
    this.gatekeeperRuntime = options.runtimes.gatekeeper;
    this.layerRuntime = options.runtimes.layerExtractor;
    this.embeddingRuntime = options.runtimes.embeddings ?? options.runtimes.layerExtractor;
    this.logger = options.logger ?? DEFAULT_LOGGER;
    this.promptRoot = options.promptRoot ?? resolvePromptRoot();

    const gatekeeperConfig: BaseExtractorDependencies = {
      model: this.config.gateModel,
      modelRuntime: this.gatekeeperRuntime,
      promptRoot: this.promptRoot,
    };

    this.gatekeeper = new UserMemoryGateKeeper(gatekeeperConfig);

    const buildExtractorConfig = (layer: MemoryLayer): BaseExtractorDependencies => {
      const model = this.config.layerModels[layer];
      if (!model) {
        throw new Error(`Missing model configuration for memory layer: ${layer}`);
      }

      return {
        model,
        modelRuntime: this.layerRuntime,
        promptRoot: this.promptRoot,
      } satisfies BaseExtractorDependencies;
    };

    this.identityExtractor = new IdentityExtractor(buildExtractorConfig('identity'));
    this.contextExtractor = new ContextExtractor(buildExtractorConfig('context'));
    this.experienceExtractor = new ExperienceExtractor(buildExtractorConfig('experience'));
    this.preferenceExtractor = new PreferenceExtractor(buildExtractorConfig('preference'));

    const defaultProvider = new ChatTopicProvider();
    this.providers.set(defaultProvider.type, defaultProvider);

    options.providers?.forEach((provider) => {
      this.providers.set(provider.type, provider);
    });
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

  private recordGatekeeperMetrics(
    job: MemoryExtractionJob,
    durationMs: number,
    status: 'ok' | 'error',
  ) {
    const attributes = {
      source: job.source,
      status,
      user_id: job.userId,
    };
    gateKeeperCallsCounter.add(1, attributes);
    gateKeeperCallDurationHistogram.record(durationMs, attributes);
  }

  private recordLayerCallMetrics(
    job: MemoryExtractionJob,
    layer: MemoryLayer,
    durationMs: number,
    status: 'ok' | 'error',
  ) {
    const attributes = {
      layer: LAYER_LABEL_MAP[layer],
      source: job.source,
      status,
      user_id: job.userId,
    };
    layersCallsCounter.add(1, attributes);
    layerCallDurationHistogram.record(durationMs, attributes);
  }

  private recordLayerEntries(job: MemoryExtractionJob, layer: MemoryLayer, count: number) {
    const attributes = {
      layer: LAYER_LABEL_MAP[layer],
      source: job.source,
      user_id: job.userId,
    };
    layerEntriesHistogram.record(count, attributes);
  }

  private async runLayerExtractor<T>(
    job: MemoryExtractionJob,
    layer: MemoryLayer,
    extractor: () => Promise<T>,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await extractor();
      this.recordLayerCallMetrics(job, layer, Date.now() - start, 'ok');

      return result;
    } catch (error) {
      this.recordLayerCallMetrics(job, layer, Date.now() - start, 'error');
      throw error;
    }
  }

  registerProvider(provider: MemoryExtractionProvider) {
    this.providers.set(provider.type, provider);
  }

  async run(job: MemoryExtractionJob): Promise<MemoryExtractionResult | null> {
    const startTime = Date.now();
    const provider = this.providers.get(job.source);
    if (!provider) {
      this.recordJobMetrics(job, 'failed', Date.now() - startTime);
      throw new Error(`No provider registered for source ${job.source}`);
    }

    let context: PreparedExtractionContext | null;
    try {
      context = await provider.prepare(job, {
        db: this.db,
        embeddingsModel: this.config.embeddingsModel,
        runtime: this.layerRuntime,
      });
    } catch (error) {
      this.recordJobMetrics(job, 'failed', Date.now() - startTime);
      throw error;
    }

    if (!context) {
      this.logger.debug('No extraction context returned by provider', { job });
      this.recordJobMetrics(job, 'completed', Date.now() - startTime);
      return null;
    }

    try {
      const decision = await this.runGatekeeper(job, context);
      const layersToExtract = this.resolveLayers(decision);

      const userMemoryModel = new UserMemoryModel(this.db, job.userId);
      const persisted = await this.persistLayers(job, context, layersToExtract, userMemoryModel);

      await provider.complete(job, context, persisted, {
        db: this.db,
        embeddingsModel: this.config.embeddingsModel,
        runtime: this.layerRuntime,
      });

      this.recordJobMetrics(job, 'completed', Date.now() - startTime);

      return {
        decisions: decision,
        inserted: persisted,
      };
    } catch (error) {
      await provider.fail?.(job, context, error as Error, {
        db: this.db,
        embeddingsModel: this.config.embeddingsModel,
        runtime: this.layerRuntime,
      });
      this.recordJobMetrics(job, 'failed', Date.now() - startTime);
      throw error;
    }
  }

  private async runGatekeeper(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
  ): Promise<GatekeeperDecision> {
    const start = Date.now();

    try {
      const decision = await this.gatekeeper.check(context.conversation, {
        retrievedContext: context.options.retrievedContext,
        topK: context.options.topK,
      });
      this.recordGatekeeperMetrics(job, Date.now() - start, 'ok');

      return decision;
    } catch (error) {
      this.recordGatekeeperMetrics(job, Date.now() - start, 'error');
      throw error;
    }
  }

  private resolveLayers(decision: GatekeeperDecision): MemoryLayer[] {
    return LAYER_ORDER.filter((layer) => decision[layer]?.shouldExtract);
  }

  private async persistLayers(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    layers: MemoryLayer[],
    userMemoryModel: UserMemoryModel,
  ): Promise<PersistedMemoryResult> {
    const createdIds: string[] = [];
    const perLayer: Partial<Record<MemoryLayer, number>> = {};

    for (const layer of layers) {
      switch (layer) {
        case 'context': {
          const result = await this.runLayerExtractor(job, 'context', () =>
            this.contextExtractor.extract(context.conversation, context.options),
          );
          const ids = await this.persistContextMemories(job, context, result, userMemoryModel);
          createdIds.push(...ids);
          perLayer.context = ids.length;
          this.recordLayerEntries(job, 'context', ids.length);

          break;
        }
        case 'experience': {
          const result = await this.runLayerExtractor(job, 'experience', () =>
            this.experienceExtractor.extract(context.conversation, context.options),
          );
          const ids = await this.persistExperienceMemories(job, context, result, userMemoryModel);
          createdIds.push(...ids);
          perLayer.experience = ids.length;
          this.recordLayerEntries(job, 'experience', ids.length);

          break;
        }
        case 'preference': {
          const result = await this.runLayerExtractor(job, 'preference', () =>
            this.preferenceExtractor.extract(context.conversation, context.options),
          );
          const ids = await this.persistPreferenceMemories(job, context, result, userMemoryModel);
          createdIds.push(...ids);
          perLayer.preference = ids.length;
          this.recordLayerEntries(job, 'preference', ids.length);

          break;
        }
        case 'identity': {
          const identityOptions = {
            ...context.options,
            existingIdentitiesContext: context.existingIdentitiesContext,
          };
          const result = await this.runLayerExtractor(job, 'identity', () =>
            this.identityExtractor.extract(context.conversation, identityOptions),
          );
          const ids = await this.persistIdentityMemories(job, context, result, userMemoryModel);
          createdIds.push(...ids);
          perLayer.identity = ids.length;
          this.recordLayerEntries(job, 'identity', ids.length);

          break;
        }
        // No default
      }
    }

    return { createdIds, layers: perLayer };
  }

  private async persistContextMemories(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    result: Awaited<ReturnType<ContextExtractor['extract']>>,
    userMemoryModel: UserMemoryModel,
  ): Promise<string[]> {
    const insertedIds: string[] = [];

    for (const item of result.memories ?? []) {
      const [summaryVector, detailsVector] = await this.generateEmbeddings([
        item.summary,
        item.details,
      ]);

      const [descriptionVector] = await this.generateEmbeddings([item.withContext?.description]);

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

  private async persistExperienceMemories(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    result: Awaited<ReturnType<ExperienceExtractor['extract']>>,
    userMemoryModel: UserMemoryModel,
  ): Promise<string[]> {
    const insertedIds: string[] = [];

    for (const item of result.memories ?? []) {
      const [summaryVector, detailsVector] = await this.generateEmbeddings([
        item.summary,
        item.details,
      ]);

      const [situationVector, actionVector, keyLearningVector] = await this.generateEmbeddings([
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

  private async persistPreferenceMemories(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    result: Awaited<ReturnType<PreferenceExtractor['extract']>>,
    userMemoryModel: UserMemoryModel,
  ): Promise<string[]> {
    const insertedIds: string[] = [];

    for (const item of result.memories ?? []) {
      const [summaryVector, detailsVector] = await this.generateEmbeddings([
        item.summary,
        item.details,
      ]);

      const [directiveVector] = await this.generateEmbeddings([
        item.withPreference?.conclusionDirectives,
      ]);

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

  private async persistIdentityMemories(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    result: Awaited<ReturnType<IdentityExtractor['extract']>>,
    userMemoryModel: UserMemoryModel,
  ): Promise<string[]> {
    const insertedIds: string[] = [];

    for (const action of result ?? []) {
      if (action.name === 'addIdentity') {
        const { arguments: args } = action;

        const [summaryVector] = await this.generateEmbeddings([args.description]);

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
        const [descriptionVector] = await this.generateEmbeddings([args.set.description]);

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

  private buildBaseMetadata(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    layer: string,
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
    texts: Array<string | undefined | null>,
  ): Promise<Array<Embeddings | null>> {
    const model = this.config.embeddingsModel;
    if (!model || typeof this.embeddingRuntime.embeddings !== 'function') {
      return texts.map(() => null);
    }

    const requests: EmbeddingRequest[] = [];

    texts.forEach((text, index) => {
      if (text && text.trim().length > 0) {
        requests.push({ index, text });
      }
    });

    if (requests.length === 0) {
      return texts.map(() => null);
    }

    try {
      const response = await this.embeddingRuntime.embeddings(
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
    } catch (error) {
      this.logger.warn('Failed to generate embeddings', { error });
      return texts.map(() => null);
    }
  }
}
