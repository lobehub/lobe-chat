import type {
  DecisionBackendKind,
  UserSystemAgentConfig,
  UserSystemAgentConfigKey,
} from '@lobechat/types';

import { UserModel } from '@/database/models/user';
import type { LobeChatDatabase } from '@/database/type';
import { appEnv } from '@/envs/app';
import { getDecisionConfig } from '@/envs/decision';
import { getLLMConfig } from '@/envs/llm';
import { parseSystemAgent } from '@/server/globalConfig/parseSystemAgent';
import { AiGenerationService } from '@/server/services/aiGeneration';
import { resolveSystemAgentModelConfig } from '@/server/services/systemAgent/modelConfig';

import { OpenRouterDecisionBackend } from './openRouterBackend';
import { ToolChoiceDecisionBackend } from './toolChoiceBackend';
import type { DecisionBackend } from './types';

export { OpenRouterDecisionBackend } from './openRouterBackend';
export { ToolChoiceDecisionBackend } from './toolChoiceBackend';
export type { DecisionBackend, DecisionContext, DecisionErrorReason } from './types';
export { DecisionError } from './types';

export interface DecisionBackendConfig {
  backend: DecisionBackendKind;
  openRouter?: { apiKey?: string; baseURL?: string; model?: string };
}

/** Reads the deployment's decision backend from `QUICK_NOTE_DECISION_*` and `OPENROUTER_API_KEY`. */
export const readDecisionBackendConfig = (): DecisionBackendConfig => {
  const env = getDecisionConfig();
  return {
    backend: env.QUICK_NOTE_DECISION_BACKEND ?? 'tool_choice',
    openRouter: {
      apiKey: getLLMConfig().OPENROUTER_API_KEY,
      model: env.QUICK_NOTE_DECISION_OPENROUTER_MODEL,
    },
  };
};

export interface CreateDecisionBackendOptions {
  /** Defaults to {@link readDecisionBackendConfig}. */
  config?: DecisionBackendConfig;
  db: LobeChatDatabase;
  /** System agent slot whose model the tool-choice backend uses. */
  systemAgentKey: UserSystemAgentConfigKey;
  userId: string;
  workspaceId?: string;
}

/**
 * Resolves a system agent slot the same way as other server-side system agents:
 * user setting, then the `SYSTEM_AGENT` env, then the built-in default.
 */
const createSystemAgentModelResolver =
  (db: LobeChatDatabase, userId: string, taskKey: UserSystemAgentConfigKey) => async () => {
    const settings = await new UserModel(db, userId).getUserSettings();
    const userSystemAgent = settings?.systemAgent as Partial<UserSystemAgentConfig> | undefined;
    return resolveSystemAgentModelConfig({
      override: userSystemAgent?.[taskKey],
      taskConfig: parseSystemAgent(appEnv.SYSTEM_AGENT)[taskKey],
      taskKey,
    });
  };

/**
 * Picks the decision backend for this deployment. The tool-choice backend is
 * the default; `openrouter` is used only when its API key and model are both
 * configured, and otherwise falls back to tool-choice.
 */
export const createDecisionBackend = ({
  config = readDecisionBackendConfig(),
  db,
  systemAgentKey,
  userId,
  workspaceId,
}: CreateDecisionBackendOptions): DecisionBackend => {
  if (config.backend === 'openrouter') {
    const { apiKey, baseURL, model } = config.openRouter ?? {};
    if (apiKey && model) return new OpenRouterDecisionBackend({ apiKey, baseURL, model });

    console.warn(
      '[decision] OpenRouter backend needs OPENROUTER_API_KEY and QUICK_NOTE_DECISION_OPENROUTER_MODEL; falling back to tool_choice',
    );
  }

  return new ToolChoiceDecisionBackend({
    generator: new AiGenerationService(db, userId, workspaceId),
    resolveModel: createSystemAgentModelResolver(db, userId, systemAgentKey),
  });
};
