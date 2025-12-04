import { DEFAULT_USER_MEMORY_EMBEDDING_MODEL_ITEM } from '@/const/settings';
import {
  GlobalMemoryExtractionConfig,
  GlobalMemoryLayer,
  MemoryAgentPublicConfig,
  MemoryLayerExtractorPublicConfig,
} from '@/types/serverConfig';

const MEMORY_LAYERS: GlobalMemoryLayer[] = ['context', 'experience', 'identity', 'preference'];
const DEFAULT_GATE_MODEL = 'gpt-5-mini';
const DEFAULT_PROVIDER = 'openai';

export type MemoryAgentConfig = MemoryAgentPublicConfig & { apiKey?: string; model: string };
export type MemoryLayerExtractorConfig = MemoryLayerExtractorPublicConfig &
  MemoryAgentConfig & {
    layers: Record<GlobalMemoryLayer, string>;
  };

export interface MemoryExtractionPrivateConfig {
  agentGateKeeper: MemoryAgentConfig;
  agentLayerExtractor: MemoryLayerExtractorConfig;
  concurrency?: number;
  embedding?: MemoryAgentConfig;
}

const parseGateKeeperAgent = (): MemoryAgentConfig => {
  const apiKey = process.env.MEMORY_USER_MEMORY_GATEKEEPER_API_KEY;
  const baseURL = process.env.MEMORY_USER_MEMORY_GATEKEEPER_BASE_URL;
  const model = process.env.MEMORY_USER_MEMORY_GATEKEEPER_MODEL || DEFAULT_GATE_MODEL;
  const provider = process.env.MEMORY_USER_MEMORY_GATEKEEPER_PROVIDER || DEFAULT_PROVIDER;

  return {
    apiKey,
    baseURL,
    model,
    provider,
  };
};

const parseLayerExtractorAgent = (fallbackModel: string): MemoryLayerExtractorConfig => {
  const apiKey = process.env.MEMORY_USER_MEMORY_LAYER_EXTRACTOR_API_KEY;
  const baseURL = process.env.MEMORY_USER_MEMORY_LAYER_EXTRACTOR_BASE_URL;
  const model = process.env.MEMORY_USER_MEMORY_LAYER_EXTRACTOR_MODEL || fallbackModel;
  const provider = process.env.MEMORY_USER_MEMORY_LAYER_EXTRACTOR_PROVIDER || DEFAULT_PROVIDER;

  const layers = MEMORY_LAYERS.reduce<Record<GlobalMemoryLayer, string>>(
    (acc, layer) => {
      const envKey = `MEMORY_USER_MEMORY_LAYER_EXTRACTOR_${layer.toUpperCase()}_MODEL`;
      const override = (process.env as Record<string, string | undefined>)[envKey];
      acc[layer] = override || model;

      return acc;
    },
    {} as Record<GlobalMemoryLayer, string>,
  );

  return {
    apiKey,
    baseURL,
    layers,
    model,
    provider,
  };
};

const parseEmbeddingAgent = (
  fallbackModel: string,
  fallbackProvider: string,
  fallbackApiKey?: string,
): MemoryAgentConfig => {
  const { model: defaultModel, provider: defaultProvider } =
    DEFAULT_USER_MEMORY_EMBEDDING_MODEL_ITEM;
  const model = process.env.MEMORY_USER_MEMORY_EMBEDDING_MODEL || fallbackModel || defaultModel;
  const provider =
    process.env.MEMORY_USER_MEMORY_EMBEDDING_PROVIDER ||
    fallbackProvider ||
    defaultProvider ||
    DEFAULT_PROVIDER;

  return {
    apiKey: process.env.MEMORY_USER_MEMORY_EMBEDDING_API_KEY ?? fallbackApiKey,
    baseURL: process.env.MEMORY_USER_MEMORY_EMBEDDING_BASE_URL,
    model,
    provider,
  };
};

const sanitizeAgent = (agent?: MemoryAgentConfig): MemoryAgentPublicConfig | undefined => {
  if (!agent) return undefined;
  const sanitized: MemoryAgentConfig = { ...agent };
  delete sanitized.apiKey;

  return sanitized as MemoryAgentPublicConfig;
};

export const parseMemoryExtractionConfig = (): MemoryExtractionPrivateConfig => {
  const agentGateKeeper = parseGateKeeperAgent();
  const agentLayerExtractor = parseLayerExtractorAgent(agentGateKeeper.model);
  const embedding = parseEmbeddingAgent(
    agentLayerExtractor.model,
    agentLayerExtractor.provider || DEFAULT_PROVIDER,
    agentGateKeeper.apiKey || agentLayerExtractor.apiKey,
  );
  const concurrencyRaw = process.env.MEMORY_USER_MEMORY_CONCURRENCY;
  const concurrency =
    concurrencyRaw !== undefined
      ? Number.isInteger(Number(concurrencyRaw)) && Number(concurrencyRaw) > 0
        ? Number(concurrencyRaw)
        : undefined
      : undefined;

  return {
    agentGateKeeper,
    agentLayerExtractor,
    concurrency,
    embedding,
  };
};

export const getPublicMemoryExtractionConfig = (): GlobalMemoryExtractionConfig => {
  const privateConfig = parseMemoryExtractionConfig();

  return {
    agentGateKeeper: sanitizeAgent(privateConfig.agentGateKeeper)!,
    agentLayerExtractor: {
      ...sanitizeAgent(privateConfig.agentLayerExtractor),
      layers: privateConfig.agentLayerExtractor.layers,
    },
    concurrency: privateConfig.concurrency,
    embedding: sanitizeAgent(privateConfig.embedding),
  };
};
