import type { LobeChatDatabase } from '@lobechat/database';
import { RequestTrigger } from '@lobechat/types';

import { getAutoRoutingConfig } from '@/envs/autoRouting';
import { AiGenerationService } from '@/server/services/aiGeneration';

import { createChatJudge, createOpenAICompatibleJudge, JUDGE_JSON_SCHEMA } from './chat';
import { createSystemOneJudge } from './systemOne';
import type { JudgeClient } from './types';

export type { JudgeClient, JudgeTurnInput } from './types';

/**
 * Build the judge model client from `AUTO_ROUTING_JUDGE_*`, or `undefined`
 * when none is configured (the router then uses its rule-based fallback).
 *
 * - `AUTO_ROUTING_JUDGE_PROVIDER` reuses a provider configured on this server
 *   (chat protocol only — it goes through the regular model runtime).
 * - `AUTO_ROUTING_JUDGE_BASE_URL` (+ `AUTO_ROUTING_JUDGE_API_KEY`) targets a
 *   custom endpoint speaking either protocol.
 */
export const createJudgeClient = (
  db: LobeChatDatabase,
  userId: string,
  workspaceId?: string,
): JudgeClient | undefined => {
  const env = getAutoRoutingConfig();
  const model = env.AUTO_ROUTING_JUDGE_MODEL;
  if (!model) return;

  if (env.AUTO_ROUTING_JUDGE_PROVIDER) {
    const provider = env.AUTO_ROUTING_JUDGE_PROVIDER;
    const ai = new AiGenerationService(db, userId, workspaceId);
    return createChatJudge((messages, signal) =>
      ai.generateObject(
        { messages, model, provider, schema: JUDGE_JSON_SCHEMA },
        { metadata: { trigger: RequestTrigger.ModelRouting }, signal },
      ),
    );
  }

  const baseURL = env.AUTO_ROUTING_JUDGE_BASE_URL;
  if (!baseURL) return;
  const config = { apiKey: env.AUTO_ROUTING_JUDGE_API_KEY, baseURL, model };
  return env.AUTO_ROUTING_JUDGE_PROTOCOL === 'chat'
    ? createOpenAICompatibleJudge(config)
    : createSystemOneJudge(config);
};

export const getJudgeTimeoutMs = () => getAutoRoutingConfig().AUTO_ROUTING_JUDGE_TIMEOUT_MS;
