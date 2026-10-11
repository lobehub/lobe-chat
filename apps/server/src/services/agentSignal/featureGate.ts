import { INBOX_SESSION_ID } from '@lobechat/const';

import type { LobeChatDatabase } from '@/database/type';
import { getServerFeatureFlagsStateFromRuntimeConfig } from '@/server/featureFlags';

/**
 * Input used to resolve Agent Signal self-iteration capability.
 */
export interface AgentSelfIterationCapabilityInput {
  /**
   * Agent-level `chatConfig.selfIteration` setting.
   */
  agentSelfIteration?: AgentSelfIterationOptInInput['selfIteration'];
  /**
   * User-level rollout result from `enableAgentSelfIteration`.
   */
  isAgentSelfIterationFeatureEnabled: boolean;
  /**
   * Whether the agent is the product-owned Lobe AI agent.
   */
  isLobeAiAgent: boolean;
}

/**
 * Checks whether a slug belongs to Lobe AI.
 *
 * Use when:
 * - Agent Signal must special-case the product-owned default assistant
 * - Code must avoid treating every virtual/builtin agent as Lobe AI
 *
 * Expects:
 * - `slug` is the persisted agent slug or `undefined` when unavailable
 *
 * Returns:
 * - `true` only for the builtin inbox agent slug
 */
export const isLobeAiAgentSlug = (slug?: string | null) => slug === INBOX_SESSION_ID;

/**
 * Input used to resolve the per-agent self-iteration opt-in.
 */
export interface AgentSelfIterationOptInInput {
  /**
   * Whether the agent is the product-owned Lobe AI agent.
   */
  isLobeAiAgent: boolean;
  /**
   * Resolved `chatConfig.selfIteration`, as stored or default-merged.
   */
  selfIteration?: { enabled?: boolean; optedOut?: boolean } | null;
}

/**
 * Resolves the per-agent self-iteration opt-in, ignoring the user-level rollout.
 *
 * Use when:
 * - A server path must decide whether one agent participates in self-iteration
 *   (turn signal enqueue, tool exposure, rollout-aware capability)
 * - Callers need one rule instead of re-deriving the Lobe AI special case
 *
 * Expects:
 * - `selfIteration` is the agent's `chatConfig.selfIteration`
 *
 * Returns:
 * - Lobe AI: `true` unless the user turned it off (`optedOut === true`). `enabled` is ignored
 *   because `DEFAULT_AGENT_CHAT_CONFIG` carries `enabled: false`, which is merged into every
 *   runtime config and persisted on inbox rows, so it cannot express a user choice.
 * - Other agents: `true` only when explicitly turned on (`enabled === true`)
 *
 * Keep in sync with `agentSelfIterationOptedInSql` in `@lobechat/database`, which
 * expresses the same rule for database-side agent targeting.
 */
export const isAgentSelfIterationOptedIn = (input: AgentSelfIterationOptInInput) =>
  input.isLobeAiAgent
    ? input.selfIteration?.optedOut !== true
    : input.selfIteration?.enabled === true;

/**
 * Resolves whether one agent may run Agent Signal self-iteration.
 *
 * Use when:
 * - Server code has an agent context and must combine rollout with per-agent capability
 *
 * Expects:
 * - `isAgentSelfIterationFeatureEnabled` already includes the user-level feature-flag result
 *
 * Returns:
 * - `false` whenever the feature flag is off
 * - Otherwise the per-agent opt-in from {@link isAgentSelfIterationOptedIn}
 */
export const resolveAgentSelfIterationCapability = (input: AgentSelfIterationCapabilityInput) => {
  if (!input.isAgentSelfIterationFeatureEnabled) return false;

  return isAgentSelfIterationOptedIn({
    isLobeAiAgent: input.isLobeAiAgent,
    selfIteration: input.agentSelfIteration,
  });
};

/**
 * Resolves whether Agent Self-iteration is feature-flag enabled for the current user.
 *
 * Use when:
 * - UI or server code needs to know whether Agent Self-iteration can be used
 * - RuntimeConfig-backed feature flags are the source of truth for rollout eligibility
 *
 * Expects:
 * - `userId` belongs to the current authenticated user
 *
 * Returns:
 * - `true` only when the Agent Self-iteration feature flag is enabled for the user
 */
export const isAgentSelfIterationFeatureEnabledForUser = async (userId: string) => {
  const featureFlags = await getServerFeatureFlagsStateFromRuntimeConfig(userId);

  return featureFlags.enableAgentSelfIteration === true;
};

/**
 * Resolves whether Agent Signal execution is enabled for the current user.
 *
 * Use when:
 * - A server entrypoint needs to decide whether Agent Signal may execute
 * - RuntimeConfig-backed feature flags are the source of truth for rollout eligibility
 *
 * Expects:
 * - `userId` belongs to the current authenticated user
 *
 * Returns:
 * - `true` only when the Agent Self-iteration feature flag is enabled for the user
 */
export const isAgentSignalEnabledForUser = async (_db: LobeChatDatabase, userId: string) => {
  try {
    return await isAgentSelfIterationFeatureEnabledForUser(userId);
  } catch {
    return false;
  }
};
