import type { LobeChatDatabase } from '@lobechat/database';
import { ModelRuntime } from '@lobechat/model-runtime';
import {
  gateKeeperCallDurationHistogram,
  gateKeeperCallsCounter,
  layerCallDurationHistogram,
  layersCallsCounter,
} from '@lobechat/observability-otel/api';

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
  MemoryExtractionLayerOutputs,
  MemoryExtractionProvider,
  MemoryExtractionResult,
  MemoryExtractionSourceType,
  MemoryLayer,
  PreparedExtractionContext,
} from '../types';
import { resolvePromptRoot } from '../utils/path';

const LAYER_ORDER: MemoryLayer[] = ['identity', 'context', 'preference', 'experience'];

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
  promptRoot?: string;
  providers?: MemoryExtractionProvider[];
  runtimes: MemoryExtractionRuntimeOptions;
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
  private readonly promptRoot: string;

  constructor(options: MemoryExtractionServiceOptions) {
    this.config = options.config;
    this.db = options.db;
    this.gatekeeperRuntime = options.runtimes.gatekeeper;
    this.layerRuntime = options.runtimes.layerExtractor;
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
    const provider = this.providers.get(job.source);
    if (!provider) {
      throw new Error(`No provider registered for source ${job.source}`);
    }

    const context = await provider.prepare(job, {
      db: this.db,
      embeddingsModel: this.config.embeddingsModel,
      runtime: this.layerRuntime,
    });
    if (!context) {
      return null;
    }

    try {
      const decision = await this.runGatekeeper(job, context);
      const layersToExtract = this.resolveJobLayers(decision, job.layers);
      const outputs = await this.runLayers(job, context, layersToExtract);

      return {
        context,
        decision,
        layers: layersToExtract,
        outputs,
        provider,
      };
    } catch (error) {
      await provider.fail?.(job, context, error as Error, {
        db: this.db,
        embeddingsModel: this.config.embeddingsModel,
        runtime: this.layerRuntime,
      });
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

  private resolveJobLayers(decision: GatekeeperDecision, layers?: MemoryLayer[]): MemoryLayer[] {
    if (layers && layers.length > 0) {
      const requested = new Set<MemoryLayer>(layers);

      return this.resolveLayers(decision).filter((layer) => requested.has(layer));
    }

    return this.resolveLayers(decision);
  }

  private async runLayers(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    layers: MemoryLayer[],
  ): Promise<MemoryExtractionLayerOutputs> {
    const outputs: MemoryExtractionLayerOutputs = {};

    for (const layer of layers) {
      const result = await this.runLayer(job, context, layer);

      switch (layer) {
        case 'context': {
          outputs.context = result as Awaited<ReturnType<ContextExtractor['extract']>>;
          break;
        }
        case 'experience': {
          outputs.experience = result as Awaited<ReturnType<ExperienceExtractor['extract']>>;
          break;
        }
        case 'preference': {
          outputs.preference = result as Awaited<ReturnType<PreferenceExtractor['extract']>>;
          break;
        }
        case 'identity': {
          outputs.identity = result as Awaited<ReturnType<IdentityExtractor['extract']>>;
          break;
        }
        default: {
          break;
        }
      }
    }

    return outputs;
  }

  private async runLayer(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    layer: MemoryLayer,
  ) {
    switch (layer) {
      case 'context': {
        return this.runContextLayer(job, context);
      }
      case 'experience': {
        return this.runExperienceLayer(job, context);
      }
      case 'preference': {
        return this.runPreferenceLayer(job, context);
      }
      case 'identity': {
        return this.runIdentityLayer(job, context);
      }
      default: {
        return [];
      }
    }
  }

  private async runContextLayer(job: MemoryExtractionJob, context: PreparedExtractionContext) {
    return this.runLayerExtractor(job, 'context', () =>
      this.contextExtractor.extract(context.conversation, context.options),
    );
  }

  private async runExperienceLayer(job: MemoryExtractionJob, context: PreparedExtractionContext) {
    return this.runLayerExtractor(job, 'experience', () =>
      this.experienceExtractor.extract(context.conversation, context.options),
    );
  }

  private async runPreferenceLayer(job: MemoryExtractionJob, context: PreparedExtractionContext) {
    return this.runLayerExtractor(job, 'preference', () =>
      this.preferenceExtractor.extract(context.conversation, context.options),
    );
  }

  private async runIdentityLayer(job: MemoryExtractionJob, context: PreparedExtractionContext) {
    const identityOptions = {
      ...context.options,
      existingIdentitiesContext: context.existingIdentitiesContext,
    };
    return this.runLayerExtractor(job, 'identity', () =>
      this.identityExtractor.extract(context.conversation, identityOptions),
    );
  }
}
