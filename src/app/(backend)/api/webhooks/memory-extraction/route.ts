import { newQueue } from '@henrygd/queue';
import { topics } from '@lobechat/database/schemas';
import type { MemoryLayer } from '@lobechat/memory-user-memory';
import { MemoryExtractionService, MemoryExtractionSourceType } from '@lobechat/memory-user-memory';
import { ModelRuntime } from '@lobechat/model-runtime';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { DEFAULT_USER_MEMORY_EMBEDDING_MODEL_ITEM } from '@/const/settings';
import { ListTopicsForMemoryExtractorCursor, TopicModel } from '@/database/models/topic';
import { ListUsersForMemoryExtractorCursor, UserModel } from '@/database/models/user';
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
  forceExtractForTopics: z.boolean().optional(),
  from: z.coerce.date().optional(),
  layers: z.array(z.string()).optional(),
  source: z.string().optional(),
  to: z.coerce.date().optional(),
  topicId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
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

const validateConcurrencyLimit = (limit?: number) => {
  if (limit === undefined) return undefined;

  const parsed = Number(limit);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;

  return parsed;
};

let activeExtractions = 0;

type ExtractionJob = {
  force?: boolean;
  source: MemoryExtractionSourceType;
  topicId: string;
  userId: string;
};
type ExtractionResult =
  | { job: ExtractionJob; result: unknown; status: 'success' }
  | { error: string; job: ExtractionJob; status: 'failed' };

const isTopicExtracted = (metadata: any): boolean => {
  const extractStatus = metadata?.memory_user_memory_extract?.extract_status;
  if (extractStatus) return extractStatus === 'completed';

  const state = metadata?.memoryExtraction?.sources?.chat_topic;
  return state?.status === 'completed' && !!state?.lastRunAt;
};

const PENDING_TOPICS_PAGE_SIZE = 100;
const USERS_PAGE_SIZE = 100;

type MemoryExtractionRequest = z.infer<typeof RequestSchema>;
type MemoryExtractionConfig = ReturnType<typeof parseMemoryExtractionConfig>;
type ServerConfig = Awaited<ReturnType<typeof getServerGlobalConfig>>;

const processExtractionInBackground = async (
  body: MemoryExtractionRequest,
  sourceInput: MemoryExtractionSourceType,
  serverConfig: ServerConfig,
  privateConfig: MemoryExtractionConfig,
  concurrencyLimit?: number,
) => {
  try {
    const publicMemoryConfig = serverConfig.memory?.userMemory;

    const modelConfig = {
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

    const db = await getServerDB();

    const runJob = async (job: ExtractionJob): Promise<ExtractionResult> => {
      try {
        const userModel = new UserModel(db, job.userId);
        const userState = await userModel.getUserState(KeyVaultsGateKeeper.getUserKeyVaults);
        const keyVaults = userState.settings?.keyVaults as UserKeyVaults | undefined;

        const gatekeeperRuntime = await initRuntimeForAgent(
          privateConfig.agentGateKeeper,
          keyVaults,
        );
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

        console.log(`[memory-extraction] running extraction for topic ${job.topicId}`);

        const result = await service.run({
          force: job.force,
          source: job.source,
          sourceId: job.topicId,
          userId: job.userId,
        });

        console.log(`[memory-extraction] completed extraction for topic ${job.topicId}`);

        return { job, result, status: 'success' as const };
      } catch (error) {
        const message = (error as Error).message;
        console.error('[memory-extraction] job failed', { error: message, job });
        return { error: message, job, status: 'failed' as const };
      }
    };

    let completedJobs = 0;
    let totalQueuedJobs = 0;
    const logBatchProgress = (context?: string) => {
      if (totalQueuedJobs === 0) return;
      console.log(
        `[memory-extraction] progress ${completedJobs}/${totalQueuedJobs}${
          context ? ` (${context})` : ''
        }`,
      );
    };

    const queue = newQueue(Math.max(1, concurrencyLimit ?? 1));
    const results: ExtractionResult[] = [];

    const enqueueTopics = async (userId: string) => {
      let cursor: ListTopicsForMemoryExtractorCursor | undefined;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const topicModel = new TopicModel(db, userId);
        const batch = await topicModel.listTopicsForMemoryExtractor({
          cursor,
          endDate: body.to,
          ignoreExtracted: body.force || body.forceExtractForTopics,
          limit: PENDING_TOPICS_PAGE_SIZE,
          startDate: body.from,
        });
        if (!batch || batch.length === 0) {
          break;
        }

        const tasks = batch.map(
          (topic) => () =>
            runJob({
              force: body.force || body.forceExtractForTopics,
              source: sourceInput,
              topicId: topic.id,
              userId: topic.userId,
            }),
        );

        if (tasks.length > 0) {
          console.log(`[memory-extraction] processing ${tasks.length} topics for user ${userId}`);

          totalQueuedJobs += tasks.length;
          const batchResults = await queue.all(tasks);
          results.push(...batchResults);
          completedJobs += tasks.length;
          logBatchProgress(`user:${userId}`);
        }

        const last = batch.at(-1)!;
        cursor = { createdAt: last.createdAt, id: last.id };
      }
    };

    if (body.topicId) {
      const topic = await db.query.topics.findFirst({
        columns: { createdAt: true, id: true, metadata: true, userId: true },
        where: body.userId
          ? and(eq(topics.id, body.topicId), eq(topics.userId, body.userId))
          : eq(topics.id, body.topicId),
      });
      if (!topic) {
        console.warn(`[memory-extraction] topic ${body.topicId} not found, skip extraction.`);
        return;
      }
      if ((body.from && topic.createdAt < body.from) || (body.to && topic.createdAt > body.to)) {
        console.log(
          `[memory-extraction] topic ${body.topicId} outside requested time range, skip extraction.`,
        );
        return;
      }
      if (!body.force && !body.forceExtractForTopics && isTopicExtracted(topic.metadata)) {
        console.log(
          `[memory-extraction] topic ${body.topicId} already extracted, skip extraction.`,
        );
        return;
      }

      const topicTasks = [
        () =>
          runJob({
            force: body.force || body.forceExtractForTopics,
            source: sourceInput,
            topicId: topic.id,
            userId: topic.userId,
          }),
      ];
      totalQueuedJobs += topicTasks.length;
      const topicResults = await queue.all(topicTasks);

      results.push(...topicResults);
      completedJobs += topicTasks.length;
      logBatchProgress('single-topic');
    } else if (body.userId) {
      console.log(`[memory-extraction] processing user ${body.userId}`);
      await enqueueTopics(body.userId);
    } else {
      let userCursor: ListUsersForMemoryExtractorCursor | undefined;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const userBatch = await UserModel.listUsersForMemoryExtractor(db, {
          cursor: userCursor,
          limit: USERS_PAGE_SIZE,
        });
        if (!userBatch || userBatch.length === 0) {
          break;
        }

        console.log(`[memory-extraction] processing for ${userBatch.length} users.`);
        for (const user of userBatch) {
          await enqueueTopics(user.id);
        }

        const last = userBatch.at(-1);
        userCursor = last ? { createdAt: last.createdAt, id: last.id } : undefined;
        console.log(`[memory-extraction] completed a batch of users.`);
      }
    }

    if (results.length === 0) {
      console.log('[memory-extraction] no topics need extraction.');
      return;
    }

    console.log(`[memory-extraction] completed ${results.length} extraction jobs.`);
  } catch (error) {
    console.error('[memory-extraction] failed', error);
  } finally {
    if (activeExtractions > 0) {
      activeExtractions -= 1;
    }
  }
};

export const POST = async (req: Request) => {
  try {
    const json = await req.json();
    const body = RequestSchema.parse(json);
    if (body.from && body.to && body.from > body.to) {
      return NextResponse.json({ error: '`from` cannot be later than `to`' }, { status: 400 });
    }

    const [serverConfig, privateConfig] = await Promise.all([
      getServerGlobalConfig(),
      Promise.resolve(parseMemoryExtractionConfig()),
    ]);

    const sourceInput = (body.source ?? 'chat_topic') as MemoryExtractionSourceType;
    if (!SUPPORTED_SOURCES.has(sourceInput)) {
      return NextResponse.json(
        { error: `Unsupported memory extraction source: ${body.source}` },
        { status: 400 },
      );
    }

    const concurrencyLimit = validateConcurrencyLimit(
      serverConfig.memory?.userMemory?.concurrency ?? privateConfig.concurrency,
    );
    if (concurrencyLimit && activeExtractions >= concurrencyLimit) {
      return NextResponse.json(
        { error: 'Memory extraction is busy, please try again later.' },
        { status: 429 },
      );
    }

    activeExtractions += 1;
    void processExtractionInBackground(
      body,
      sourceInput,
      serverConfig,
      privateConfig,
      concurrencyLimit,
    );

    return NextResponse.json(
      { message: 'Memory extraction started. Processing in background.' },
      { status: 202 },
    );
  } catch (error) {
    console.error('[memory-extraction] failed', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
};
