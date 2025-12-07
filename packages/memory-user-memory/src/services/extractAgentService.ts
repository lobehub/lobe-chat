import type { LobeChatDatabase } from '@lobechat/database';
import { ModelRuntime } from '@lobechat/model-runtime';
import {
  gateKeeperCallDurationHistogram,
  gateKeeperCallsCounter,
  layerCallDurationHistogram,
  layersCallsCounter,
} from '@lobechat/observability-otel/api';
import { UserMemoryLayer } from '@lobechat/types';

import {
  ContextExtractor,
  ExperienceExtractor,
  IdentityExtractor,
  PreferenceExtractor,
  UserMemoryGateKeeper,
} from '../extractors';
import {
  BaseExtractorDependencies,
  ExtractorOptions,
  GatekeeperDecision,
  MemoryContextProvider,
  MemoryExtractionJob,
  MemoryExtractionLLMConfig,
  MemoryExtractionLayerOutputs,
  MemoryExtractionResult,
  MemoryResultRecorder,
} from '../types';
import { resolvePromptRoot } from '../utils/path';

const LAYER_ORDER: UserMemoryLayer[] = [
  'identity' as UserMemoryLayer,
  'context' as UserMemoryLayer,
  'preference' as UserMemoryLayer,
  'experience' as UserMemoryLayer,
];

const LAYER_LABEL_MAP: Record<UserMemoryLayer, string> = {
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
  language?: string;
  promptRoot?: string;
  runtimes: MemoryExtractionRuntimeOptions;
}

export class MemoryExtractAgentService<RO> {
  private readonly config: MemoryExtractionLLMConfig;

  private readonly gatekeeper: UserMemoryGateKeeper;

  private readonly identityExtractor: IdentityExtractor;
  private readonly contextExtractor: ContextExtractor;
  private readonly experienceExtractor: ExperienceExtractor;
  private readonly preferenceExtractor: PreferenceExtractor;

  private readonly gatekeeperRuntime: ModelRuntime;
  private readonly layerRuntime: ModelRuntime;

  private readonly promptRoot: string;

  constructor(options: MemoryExtractionServiceOptions) {
    this.config = options.config;
    this.gatekeeperRuntime = options.runtimes.gatekeeper;
    this.layerRuntime = options.runtimes.layerExtractor;
    this.promptRoot = options.promptRoot ?? resolvePromptRoot();

    const gatekeeperConfig: BaseExtractorDependencies = {
      model: this.config.gateModel,
      modelRuntime: this.gatekeeperRuntime,
      promptRoot: this.promptRoot,
    };

    this.gatekeeper = new UserMemoryGateKeeper(gatekeeperConfig);

    const buildExtractorConfig = (layer: UserMemoryLayer): BaseExtractorDependencies => {
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

    this.identityExtractor = new IdentityExtractor(buildExtractorConfig(UserMemoryLayer.Identity));
    this.contextExtractor = new ContextExtractor(buildExtractorConfig(UserMemoryLayer.Context));
    this.experienceExtractor = new ExperienceExtractor(
      buildExtractorConfig(UserMemoryLayer.Experience),
    );
    this.preferenceExtractor = new PreferenceExtractor(
      buildExtractorConfig(UserMemoryLayer.Preference),
    );
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
    layer: UserMemoryLayer,
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
    layer: UserMemoryLayer,
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

  async run(
    job: MemoryExtractionJob,
    options: {
      contextProvider: MemoryContextProvider<{ topK?: number }>;
      resultRecorder?: MemoryResultRecorder<RO>;
    } & ExtractorOptions & {
        existingIdentitiesContext?: string;
      },
  ): Promise<MemoryExtractionResult | null> {
    try {
      const decision = await this.runGatekeeper(job, { ...options });
      const layersToExtract = this.resolveJobLayers(decision, job.layers);
      const outputs = await this.runLayers(job, layersToExtract, { ...options });

      const processedLayersCount = {
        context: outputs.context ? outputs.context?.memories?.length : 0,
        experience: outputs.experience ? outputs.experience?.memories?.length : 0,
        // NOTICE: Identity layer does not process accumulatively, so we set it to 0
        identity: 0,
        preference: outputs.preference ? outputs.preference?.memories?.length : 0,
      };

      const processedCount = Object.values(processedLayersCount).reduce((a, b) => a + b, 0);

      return {
        decision,
        inputs: {
          retrievedContexts: options.retrievedContexts,
          retrievedIdentitiesContext: options.retrievedIdentitiesContext,
        },
        layers: layersToExtract,
        outputs,
        processedCounts: processedCount,
        processedLayersCount: processedLayersCount,
      };
    } catch (error) {
      await options?.resultRecorder?.recordFail?.(job, error as Error);
      throw error;
    }
  }

  private async runGatekeeper(
    job: MemoryExtractionJob,
    options: ExtractorOptions,
  ): Promise<GatekeeperDecision> {
    const start = Date.now();

    try {
      const decision = await this.gatekeeper.check({
        language: options.language ?? 'English',
      });
      this.recordGatekeeperMetrics(job, Date.now() - start, 'ok');

      return decision;
    } catch (error) {
      this.recordGatekeeperMetrics(job, Date.now() - start, 'error');
      throw error;
    }
  }

  private async runContextLayer(job: MemoryExtractionJob, options: ExtractorOptions) {
    return this.runLayerExtractor(job, UserMemoryLayer.Context, () =>
      this.contextExtractor.structuredCall({
        ...options,
        language: options.language ?? 'English',
      }),
    );
  }

  private async runExperienceLayer(job: MemoryExtractionJob, options: ExtractorOptions) {
    return this.runLayerExtractor(job, UserMemoryLayer.Experience, () =>
      this.experienceExtractor.structuredCall({
        ...options,
        language: options.language ?? 'English',
      }),
    );
  }

  private async runPreferenceLayer(job: MemoryExtractionJob, options: ExtractorOptions) {
    return this.runLayerExtractor(job, UserMemoryLayer.Preference, () =>
      this.preferenceExtractor.structuredCall({
        ...options,
        language: options.language ?? 'English',
      }),
    );
  }

  private async runIdentityLayer(
    job: MemoryExtractionJob,
    options: ExtractorOptions & {
      existingIdentitiesContext?: string;
    },
  ) {
    return this.runLayerExtractor(job, UserMemoryLayer.Identity, () =>
      this.identityExtractor.structuredCall({
        ...options,
        language: options.language ?? 'English',
      }),
    );
  }

  private resolveLayers(decision: GatekeeperDecision): UserMemoryLayer[] {
    return LAYER_ORDER.filter((layer) => decision[layer]?.shouldExtract);
  }

  private resolveJobLayers(
    decision: GatekeeperDecision,
    layers?: UserMemoryLayer[],
  ): UserMemoryLayer[] {
    if (layers && layers.length > 0) {
      const requested = new Set<UserMemoryLayer>(layers);

      return this.resolveLayers(decision).filter((layer) => requested.has(layer));
    }

    return this.resolveLayers(decision);
  }

  private async runLayers(
    job: MemoryExtractionJob,
    layers: UserMemoryLayer[],
    options: ExtractorOptions & {
      existingIdentitiesContext?: string;
    },
  ): Promise<MemoryExtractionLayerOutputs> {
    const outputs: MemoryExtractionLayerOutputs = {};

    for (const layer of layers as UserMemoryLayer[]) {
      const result = await this.runLayer(job, layer, options);

      switch (layer) {
        case UserMemoryLayer.Context: {
          outputs.context = result as Awaited<ReturnType<ContextExtractor['structuredCall']>>;
          break;
        }
        case UserMemoryLayer.Experience: {
          outputs.experience = result as Awaited<ReturnType<ExperienceExtractor['structuredCall']>>;
          break;
        }
        case UserMemoryLayer.Preference: {
          outputs.preference = result as Awaited<ReturnType<PreferenceExtractor['structuredCall']>>;
          break;
        }
        case UserMemoryLayer.Identity: {
          outputs.identity = result as Awaited<ReturnType<IdentityExtractor['structuredCall']>>;
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
    layer: UserMemoryLayer,
    options: ExtractorOptions & {
      existingIdentitiesContext?: string;
    },
  ): Promise<any> {
    switch (layer) {
      case UserMemoryLayer.Context: {
        return this.runContextLayer(job, options);
      }
      case UserMemoryLayer.Experience: {
        return this.runExperienceLayer(job, options);
      }
      case UserMemoryLayer.Preference: {
        return this.runPreferenceLayer(job, options);
      }
      case UserMemoryLayer.Identity: {
        return this.runIdentityLayer(job, options);
      }
      default: {
        return [];
      }
    }
  }
}
