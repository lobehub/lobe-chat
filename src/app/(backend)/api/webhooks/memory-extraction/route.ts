import type { MemoryLayer } from '@lobechat/memory-user-memory';
import { MemoryExtractionService, MemoryExtractionSourceType } from '@lobechat/memory-user-memory';
import { ModelRuntime } from '@lobechat/model-runtime';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { UserModel } from '@/database/models/user';
import { getServerDB } from '@/database/server';
import { getServerGlobalConfig } from '@/server/globalConfig';
import {
  MemoryAgentConfig,
  parseMemoryExtractionConfig,
} from '@/server/globalConfig/parseMemoryExtractionConfig';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';
import type { GlobalMemoryLayer } from '@/types/serverConfig';
import type { UserKeyVaults } from '@/types/user/settings';

const RequestSchema = z.object({
  force: z.boolean().optional(),
  source: z.string().optional(),
  topicId: z.string().min(1),
  userId: z.string().min(1),
});

const SUPPORTED_SOURCES = new Set<MemoryExtractionSourceType>([
  'chat_topic',
  'obsidian',
  'notion',
  'lark',
]);

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

export const POST = async (req: Request) => {
  try {
    const json = await req.json();
    const body = RequestSchema.parse(json);

    const db = await getServerDB();
    const userModel = new UserModel(db, body.userId);
    const userState = await userModel.getUserState(KeyVaultsGateKeeper.getUserKeyVaults);
    const keyVaults = userState.settings?.keyVaults as UserKeyVaults | undefined;

    const [serverConfig, privateConfig] = await Promise.all([
      getServerGlobalConfig(),
      Promise.resolve(parseMemoryExtractionConfig()),
    ]);

    const publicMemoryConfig = serverConfig.memory?.userMemory;

    const modelConfig = {
      embeddingsModel:
        publicMemoryConfig?.embedding?.model ??
        privateConfig.embedding?.model ??
        privateConfig.agentLayerExtractor.model,
      gateModel: publicMemoryConfig?.agentGateKeeper?.model ?? privateConfig.agentGateKeeper.model,
      layerModels: resolveLayerModels(
        publicMemoryConfig?.agentLayerExtractor.layers,
        privateConfig.agentLayerExtractor.layers,
      ),
    };

    const gatekeeperRuntime = await initRuntimeForAgent(privateConfig.agentGateKeeper, keyVaults);
    const layerExtractorRuntime = await initRuntimeForAgent(
      privateConfig.agentLayerExtractor,
      keyVaults,
    );
    const embeddingRuntime = privateConfig.embedding
      ? await initRuntimeForAgent(privateConfig.embedding, keyVaults)
      : undefined;

    const service = new MemoryExtractionService({
      config: modelConfig,
      db,
      runtimes: {
        embeddings: embeddingRuntime,
        gatekeeper: gatekeeperRuntime,
        layerExtractor: layerExtractorRuntime,
      },
    });

    const sourceInput = (body.source ?? 'chat_topic') as MemoryExtractionSourceType;
    if (!SUPPORTED_SOURCES.has(sourceInput)) {
      return NextResponse.json(
        { error: `Unsupported memory extraction source: ${body.source}` },
        { status: 400 },
      );
    }

    const result = await service.run({
      force: body.force,
      source: sourceInput,
      sourceId: body.topicId,
      userId: body.userId,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('[memory-extraction] failed', error);
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }
};
