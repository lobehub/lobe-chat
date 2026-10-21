import type { LobeChatDatabase } from '@lobechat/database';
import type { ProviderConfig } from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import debug from 'debug';
import type {
  AutoRoutingCandidate,
  AutoRoutingMessageMetadata,
  AutoRoutingModelRef,
  AutoRoutingRequirements,
  AutoRoutingSignals,
  AutoRoutingTier,
  TopicAutoRoutingState,
} from 'model-bank/autoRouting';
import {
  estimateDifficulty,
  getAutoRoutingTier,
  isAutoRoutingProvider,
  resolveAutoRoute,
} from 'model-bank/autoRouting';

import { TopicModel } from '@/database/models/topic';
import { AiInfraRepos } from '@/database/repositories/aiInfra';
import { getServerGlobalConfig } from '@/server/globalConfig';

import type { JudgeClient } from './judge';
import { createJudgeClient, getJudgeTimeoutMs } from './judge';
import { buildJudgeState, estimateTokens, loadRecentTurns } from './recentTurns';

const log = debug('lobe-server:auto-model-routing');

export interface ResolveTurnModelParams {
  attachments?: { audios?: number; files?: number; images?: number; videos?: number };
  /** A resumed / approval-continued turn keeps the model it started on. */
  continuation?: boolean;
  model: string;
  prompt: string;
  provider: string;
  topicId?: string;
}

export interface ResolvedTurnModel extends AutoRoutingModelRef {
  metadata: AutoRoutingMessageMetadata;
}

export const isAutoRoutedModel = (model?: string | null, provider?: string | null) =>
  !!getAutoRoutingTier(model, provider);

/**
 * Resolves a Lite / Pro / Ultra virtual model to a real model for one turn,
 * choosing only among the chat models the user can see in the model picker.
 */
export class AutoModelRoutingService {
  private readonly db: LobeChatDatabase;
  private readonly userId: string;
  private readonly workspaceId?: string;
  private readonly judge?: JudgeClient;

  constructor(
    db: LobeChatDatabase,
    userId: string,
    workspaceId?: string,
    judge: JudgeClient | undefined = createJudgeClient(db, userId, workspaceId),
  ) {
    this.db = db;
    this.userId = userId;
    this.workspaceId = workspaceId;
    this.judge = judge;
  }

  /** Enabled, visible chat models of enabled providers — what the picker lists. */
  async getCandidates(): Promise<AutoRoutingCandidate[]> {
    const { aiProvider } = await getServerGlobalConfig();
    const providerConfigs: Record<string, ProviderConfig> = Object.fromEntries(
      Object.entries(aiProvider).map<[string, ProviderConfig]>(([id, config]) => [
        id,
        { ...config, enabled: config?.enabled ?? false },
      ]),
    );
    const infra = new AiInfraRepos(this.db, this.userId, providerConfigs, this.workspaceId);
    const models = await infra.getEnabledModels();
    return models
      .filter(
        (model) =>
          model.enabled !== false &&
          model.visible !== false &&
          model.type === 'chat' &&
          !isAutoRoutingProvider(model.providerId),
      )
      .map((model) => ({
        abilities: model.abilities,
        contextWindowTokens: model.contextWindowTokens,
        displayName: model.displayName,
        id: model.id,
        pricing: model.pricing,
        providerId: model.providerId,
      }));
  }

  private async judgeTurn(state: string, fallback: AutoRoutingSignals) {
    if (!this.judge) return fallback;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), getJudgeTimeoutMs());
    try {
      return await this.judge.judge({ state }, controller.signal);
    } catch (error) {
      // Visible in production logs: a misconfigured judge otherwise degrades
      // every turn to the rule fallback without a trace.
      console.warn('[auto-model-routing] judge failed, using rule fallback:', error);
      return fallback;
    } finally {
      clearTimeout(timer);
    }
  }

  async resolveTurnModel(params: ResolveTurnModelParams): Promise<ResolvedTurnModel | undefined> {
    const tier = getAutoRoutingTier(params.model, params.provider);
    if (!tier) return;

    const topicModel = new TopicModel(this.db, this.userId, this.workspaceId);
    const [candidates, topic, recent] = await Promise.all([
      this.getCandidates(),
      params.topicId ? topicModel.findById(params.topicId) : undefined,
      params.topicId
        ? loadRecentTurns(this.db, {
            topicId: params.topicId,
            userId: this.userId,
            workspaceId: this.workspaceId,
          })
        : undefined,
    ]);

    const { attachments = {}, prompt } = params;
    const attachmentCount = Object.values(attachments).reduce(
      (sum, count) => sum + (count ?? 0),
      0,
    );
    const fallback = estimateDifficulty({ attachmentCount, prompt });
    const state = topic?.metadata?.autoRouting as TopicAutoRoutingState | undefined;
    const contextTokens = (recent?.lastContextTokens ?? 0) + estimateTokens(prompt);
    const requirements: AutoRoutingRequirements = {
      audio: !!attachments.audios,
      // Runs carry default builtin tools even without plugins; a model without
      // function calling would silently drop them.
      functionCall: true,
      minContextTokens: contextTokens,
      video: !!attachments.videos,
      vision: !!attachments.images,
    };

    const signals = params.continuation
      ? fallback
      : await this.judgeTurn(buildJudgeState(recent?.turns ?? [], prompt, attachments), fallback);

    const decision = resolveAutoRoute({
      candidates,
      contextTokens,
      continuation: params.continuation,
      now: Date.now(),
      requirements,
      signals,
      state,
      tier: tier as AutoRoutingTier,
    });
    if (!decision)
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message:
          'Auto routing needs at least one enabled chat model. Enable a model to use Lite / Pro / Ultra.',
      });

    if (params.topicId)
      await topicModel
        .updateMetadata(params.topicId, { autoRouting: decision.state })
        .catch((error) => log('failed to persist routing state: %O', error));

    log(
      'tier %s → %s/%s (%s)',
      tier,
      decision.target.provider,
      decision.target.model,
      decision.metadata.reason,
    );
    return { ...decision.target, metadata: decision.metadata };
  }
}
