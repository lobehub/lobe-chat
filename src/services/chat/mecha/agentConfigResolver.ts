import { getAgentRuntimeConfig } from '@lobechat/builtin-agents';
import { LobeAgentChatConfig, LobeAgentConfig } from '@lobechat/types';

import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';

/**
 * Runtime context for resolving agent config
 */
export interface AgentConfigResolverContext {
  /** Agent ID to resolve config for */
  agentId: string;
  // Builtin agent specific context
  /** Document content for page-agent */
  documentContent?: string;
  /** Current model being used (for template variables) */
  model?: string;

  /** Plugins enabled for the agent */
  plugins?: string[];

  /** Current provider */
  provider?: string;
  /** Target agent config for agent-builder */
  targetAgentConfig?: LobeAgentConfig;
}

/**
 * Resolved agent config with runtime values merged
 */
export interface ResolvedAgentConfig {
  /** The resolved agent config */
  agentConfig: LobeAgentConfig;
  /** The chat config */
  chatConfig: LobeAgentChatConfig;
  /** Whether this is a builtin agent */
  isBuiltinAgent: boolean;
  /**
   * Final merged plugins for the agent
   * For builtin agents: runtime plugins (if any) or fallback to agent config plugins
   * For regular agents: agent config plugins
   */
  plugins: string[];
  /** The agent's slug (if builtin) */
  slug?: string;
}

/**
 * Resolves the agent config, merging runtime config for builtin agents
 *
 * For builtin agents (identified by slug), this will:
 * 1. Get the base config from the agent store
 * 2. Get the runtime config from @lobechat/builtin-agents
 * 3. Merge the runtime systemRole into the agent config
 *
 * For regular agents, this simply returns the config from the store.
 */
export const resolveAgentConfig = (ctx: AgentConfigResolverContext): ResolvedAgentConfig => {
  const { agentId, model, documentContent, plugins, targetAgentConfig } = ctx;

  const agentStoreState = getAgentStoreState();

  // Get base config from store
  const agentConfig = agentSelectors.getAgentConfigById(agentId)(agentStoreState);
  const chatConfig = agentChatConfigSelectors.getAgentChatConfigById(agentId)(agentStoreState);

  // Base plugins from agent config
  const basePlugins = agentConfig.plugins ?? [];

  // Check if this is a builtin agent
  const slug = agentSelectors.getAgentSlugById(agentId)(agentStoreState);

  if (!slug) {
    // Regular agent - return config with agent's plugins
    return { agentConfig, chatConfig, isBuiltinAgent: false, plugins: basePlugins };
  }

  // Builtin agent - merge runtime config
  const runtimeConfig = getAgentRuntimeConfig(slug, {
    documentContent,
    model,
    plugins,
    targetAgentConfig,
  });

  // Merge runtime systemRole into agent config
  const resolvedAgentConfig: LobeAgentConfig = {
    ...agentConfig,
    // Use runtime systemRole if available, otherwise fallback to stored systemRole
    systemRole: runtimeConfig?.systemRole ?? agentConfig.systemRole,
  };

  // Merge plugins: runtime plugins take priority, fallback to base plugins
  const finalPlugins =
    runtimeConfig?.plugins && runtimeConfig.plugins.length > 0
      ? runtimeConfig.plugins
      : basePlugins;

  return {
    agentConfig: resolvedAgentConfig,
    chatConfig,
    isBuiltinAgent: true,
    plugins: finalPlugins,
    slug,
  };
};

/**
 * Get the target agent ID, falling back to active agent if not provided
 */
export const getTargetAgentId = (agentId?: string): string => {
  const agentStoreState = getAgentStoreState();
  return agentId || agentStoreState.activeAgentId || '';
};
