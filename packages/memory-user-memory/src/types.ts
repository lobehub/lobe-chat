import type { LobeChatDatabase } from '@lobechat/database';
import type { ModelRuntime } from '@lobechat/model-runtime';

import type {
  ContextExtractor,
  ExperienceExtractor,
  IdentityExtractor,
  PreferenceExtractor,
} from './extractors';

export type MemoryLayer = 'context' | 'experience' | 'identity' | 'preference';

export interface ExtractionMessage {
  content: string;
  createdAt?: Date;
  role: string;
}

export interface ExtractorOptions {
  availableCategories?: string[];
  existingContext?: string;
  language?: string;
  retrievedContext?: string;
  sessionDate?: string;
  topK?: number;
  username?: string;
}

export interface GatekeeperOptions {
  retrievedContext?: string;
  topK?: number;
}

export interface BaseExtractorDependencies {
  model: string;
  modelRuntime: ModelRuntime;
  promptRoot: string;
}

export interface MemoryExtractionLLMConfig {
  embeddingsModel?: string;
  gateModel: string;
  layerModels: Partial<Record<MemoryLayer, string>>;
  provider?: string;
}

export interface MemoryExtractionJob {
  force?: boolean;
  layers?: MemoryLayer[];
  source: MemoryExtractionSourceType;
  sourceId: string;
  userId: string;
}

export interface MemoryExtractionSourceMetadata {
  error?: string;
  lastConversationDigest?: string;
  lastProcessedAt?: string;
  lastProcessedMessageId?: string;
  status?: 'pending' | 'completed' | 'failed';
  version?: string;
}

export type MemoryExtractionSourceType = 'chat_topic' | 'obsidian' | 'notion' | 'lark';

export interface ProviderDeps {
  db: LobeChatDatabase;
  embeddingsModel?: string;
  runtime: ModelRuntime;
}

export interface PreparedExtractionContext {
  conversation: ExtractionMessage[];
  existingIdentitiesContext?: string;
  metadata: Record<string, unknown>;
  options: ExtractorOptions;
  retrievedContext?: string;
  sourceId: string;
  topicId?: string;
  userId: string;
}

export interface MemoryExtractionProvider {
  complete(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    result: PersistedMemoryResult,
    deps: ProviderDeps,
  ): Promise<void>;
  fail?(
    job: MemoryExtractionJob,
    context: PreparedExtractionContext,
    error: Error,
    deps: ProviderDeps,
  ): Promise<void>;
  prepare(job: MemoryExtractionJob, deps: ProviderDeps): Promise<PreparedExtractionContext | null>;
  type: MemoryExtractionSourceType;
}

export interface PersistedMemoryResult {
  createdIds: string[];
  layers: Partial<Record<MemoryLayer, number>>;
}

export type MemoryExtractionLayerOutputs = Partial<{
  context: Awaited<ReturnType<ContextExtractor['extract']>>;
  experience: Awaited<ReturnType<ExperienceExtractor['extract']>>;
  identity: Awaited<ReturnType<IdentityExtractor['extract']>>;
  preference: Awaited<ReturnType<PreferenceExtractor['extract']>>;
}>;

export interface GatekeeperDecision {
  activity: MemoryLayerDecision;
  context: MemoryLayerDecision;
  experience: MemoryLayerDecision;
  identity: MemoryLayerDecision;
  preference: MemoryLayerDecision;
}

export interface MemoryLayerDecision {
  reasoning: string;
  shouldExtract: boolean;
}

export interface MemoryExtractionResult {
  context: PreparedExtractionContext;
  decision: GatekeeperDecision;
  layers: MemoryLayer[];
  outputs: MemoryExtractionLayerOutputs;
  provider: MemoryExtractionProvider;
}

export interface TemplateProps {
  [key: string]: unknown;
}
