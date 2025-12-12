import type { LobeChatDatabase } from '@lobechat/database';
import { GenerateObjectPayload, ModelRuntime } from '@lobechat/model-runtime';
import { SpanStatusCode } from '@lobechat/observability-otel/api';
import {
  gateKeeperCallDurationHistogram,
  gateKeeperCallsCounter,
  layerCallDurationHistogram,
  layersCallsCounter,
  tracer,
} from '@lobechat/observability-otel/modules/memory-user-memory';
import { LayersEnum } from '@lobechat/types';

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
import { attributesCommon } from '@lobechat/observability-otel/node';

const LAYER_ORDER: LayersEnum[] = [
  'identity' as LayersEnum,
  'context' as LayersEnum,
  'preference' as LayersEnum,
  'experience' as LayersEnum,
];

const LAYER_LABEL_MAP: Record<LayersEnum, string> = {
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
  callbacks?: {
    onExtractRequest?: (request: GenerateObjectPayload) => Promise<void> | void;
    onExtractResponse?: <TOutput>(response: TOutput) => Promise<void> | void;
  };
  config: MemoryExtractionLLMConfig;
  db: LobeChatDatabase;
  language?: string;
  promptRoot?: string;
  runtimes: MemoryExtractionRuntimeOptions;
}

export class MemoryExtractionService<RO> {
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

    const buildExtractorConfig = (layer: LayersEnum): BaseExtractorDependencies => {
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

    this.identityExtractor = new IdentityExtractor(buildExtractorConfig(LayersEnum.Identity));
    this.contextExtractor = new ContextExtractor(buildExtractorConfig(LayersEnum.Context));
    this.experienceExtractor = new ExperienceExtractor(buildExtractorConfig(LayersEnum.Experience));
    this.preferenceExtractor = new PreferenceExtractor(buildExtractorConfig(LayersEnum.Preference));
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
      ...attributesCommon(),
    };

    gateKeeperCallsCounter.add(1, attributes);
    gateKeeperCallDurationHistogram.record(durationMs, attributes);
  }

  private recordLayerCallMetrics(
    job: MemoryExtractionJob,
    layer: LayersEnum,
    durationMs: number,
    status: 'ok' | 'error',
  ) {
    const attributes = {
      layer: LAYER_LABEL_MAP[layer],
      source: job.source,
      status,
      user_id: job.userId,
      ...attributesCommon(),
    };

    layersCallsCounter.add(1, attributes);
    layerCallDurationHistogram.record(durationMs, attributes);
  }

  private async runLayerExtractor<T>(
    job: MemoryExtractionJob,
    layer: LayersEnum,
    extractor: () => Promise<T>,
  ): Promise<T> {
    const attributes = {
      layer: LAYER_LABEL_MAP[layer],
      source: job.source,
      source_id: job.sourceId,
      user_id: job.userId,
      ...attributesCommon(),
    };

    return tracer.startActiveSpan(
      `run${layer.charAt(0).toUpperCase() + layer.slice(1)}LayerExtractor`,
      { attributes },
      async (span) => {
        const start = Date.now();

        try {
          const result = await extractor();
          const duration = Date.now() - start;

          this.recordLayerCallMetrics(job, layer, duration, 'ok');
          span.setStatus({ code: SpanStatusCode.OK });

          return result;
        } catch (error) {
          const duration = Date.now() - start;

          this.recordLayerCallMetrics(job, layer, duration, 'error');
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : 'Layer extraction failed',
          });
          span.recordException(error as Error);
          throw error;
        } finally {
          span.end();
        }
      },
    );
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
        context: outputs.context?.data ? outputs.context?.data?.memories?.length : 0,
        experience: outputs.experience?.data ? outputs.experience?.data?.memories?.length : 0,
        identity: outputs.identity?.data ? (outputs.identity?.data?.add?.length || 0) + (outputs.identity?.data?.update?.length || 0) + (outputs.identity?.data?.remove?.length || 0) : 0,
        preference: outputs.preference?.data ? outputs.preference?.data?.memories?.length : 0,
      };
      const processedErrorsCount = {
        context: outputs.context?.error ? 1 : 0,
        experience: outputs.experience?.error ? 1 : 0,
        identity: outputs.identity?.error ? 1 : 0,
        preference: outputs.preference?.error ? 1 : 0,
      }

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
        processedErrorsCount: processedErrorsCount,
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
        retrievedContexts: options.retrievedContexts,
      });
      this.recordGatekeeperMetrics(job, Date.now() - start, 'ok');

      return decision;
    } catch (error) {
      this.recordGatekeeperMetrics(job, Date.now() - start, 'error');
      throw error;
    }
  }

  private async runContextLayer(job: MemoryExtractionJob, options: ExtractorOptions) {
    return this.runLayerExtractor(job, LayersEnum.Context, () =>
      this.contextExtractor.structuredCall({
        ...options,
        language: options.language ?? 'English',
      }),
    );
  }

  private async runExperienceLayer(job: MemoryExtractionJob, options: ExtractorOptions) {
    return this.runLayerExtractor(job, LayersEnum.Experience, () =>
      this.experienceExtractor.structuredCall({
        ...options,
        language: options.language ?? 'English',
      }),
    );
  }

  private async runPreferenceLayer(job: MemoryExtractionJob, options: ExtractorOptions) {
    return this.runLayerExtractor(job, LayersEnum.Preference, () =>
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
    return this.runLayerExtractor(job, LayersEnum.Identity, () =>
      this.identityExtractor.structuredCall({
        ...options,
        language: options.language ?? 'English',
      }),
    );
  }

  private resolveLayers(decision: GatekeeperDecision): LayersEnum[] {
    return LAYER_ORDER.filter((layer) => decision[layer]?.shouldExtract);
  }

  private resolveJobLayers(decision: GatekeeperDecision, layers?: LayersEnum[]): LayersEnum[] {
    if (layers && layers.length > 0) {
      const requested = new Set<LayersEnum>(layers);

      return this.resolveLayers(decision).filter((layer) => requested.has(layer));
    }

    return this.resolveLayers(decision);
  }

  private async runLayers(
    job: MemoryExtractionJob,
    layers: LayersEnum[],
    options: ExtractorOptions & {
      existingIdentitiesContext?: string;
    },
  ): Promise<MemoryExtractionLayerOutputs> {
    const outputs: Partial<MemoryExtractionLayerOutputs> = {};

    await Promise.all(
      ([
        LayersEnum.Context,
        LayersEnum.Experience,
        LayersEnum.Preference,
        LayersEnum.Identity,
      ] as LayersEnum[])
        .filter((layer) => layers.includes(layer))
        .map(async (layer) => {
          const result = await this.runLayer(job, layer, options);

          switch (layer) {
            case LayersEnum.Context: {
              outputs.context = result;
              break;
            }
            case LayersEnum.Experience: {
              outputs.experience = result;
              break;
            }
            case LayersEnum.Preference: {
              outputs.preference = result;
              break;
            }
            case LayersEnum.Identity: {
              outputs.identity = result;
              break;
            }
            default: {
              break;
            }
          }
        }),
    );

    return outputs as MemoryExtractionLayerOutputs;
  }

  private async runLayer(
    job: MemoryExtractionJob,
    layer: LayersEnum,
    options: ExtractorOptions & {
      existingIdentitiesContext?: string;
    },
  ): Promise<any> {
    switch (layer) {
      case LayersEnum.Context: {
        return this.runContextLayer(job, options);
      }
      case LayersEnum.Experience: {
        return this.runExperienceLayer(job, options);
      }
      case LayersEnum.Preference: {
        return this.runPreferenceLayer(job, options);
      }
      case LayersEnum.Identity: {
        return this.runIdentityLayer(job, options);
      }
      default: {
        return [];
      }
    }
  }
}
