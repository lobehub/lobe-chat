/**
 * Builtin agents configuration
 *
 * These agents are created automatically when needed and are not bound to sessions.
 * They use slug as unique identifier for lookup.
 *
 * Note: Avatar, title, and description are not needed here as they will use
 * the default Lobe branding when displayed to users.
 * System roles are defined in @lobechat/prompts package.
 */

export interface BuiltinAgentConfig {
  model?: string;
  provider?: string;
  slug: string;
}

/**
 * Page Agent - used for document editing assistance
 */
export const PAGE_AGENT: BuiltinAgentConfig = {
  model: 'claude-sonnet-4-5-20250929',
  provider: 'anthropic',
  slug: 'page-agent',
};

/**
 * Agent Builder - used for builtin agent settings
 */
export const AGENT_BUILDER: BuiltinAgentConfig = {
  model: 'claude-sonnet-4-5-20250929',
  provider: 'anthropic',
  slug: 'agent-builder',
};

/**
 * All builtin agents indexed by slug
 */
export const BUILTIN_AGENTS: Record<string, BuiltinAgentConfig> = {
  [AGENT_BUILDER.slug]: AGENT_BUILDER,
  [PAGE_AGENT.slug]: PAGE_AGENT,
};
