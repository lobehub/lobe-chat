import type { LobeAgentChatConfig, LobeAgentConfig } from '@lobechat/types';

/**
 * Builtin Agent Slugs - unique identifiers for builtin agents
 */
export const BUILTIN_AGENT_SLUGS = {
  agentBuilder: 'agent-builder',
  inbox: 'inbox',
  pageAgent: 'page-agent',
} as const;

export type BuiltinAgentSlug = (typeof BUILTIN_AGENT_SLUGS)[keyof typeof BUILTIN_AGENT_SLUGS];

/**
 * Persist Config - these fields will be stored in the database
 */
export interface BuiltinAgentPersistConfig {
  /** Default chat configuration */
  chatConfig?: Partial<LobeAgentChatConfig>;
  /** Default model */
  model?: string;
  /** Default provider */
  provider?: string;
  /** Unique identifier for the builtin agent */
  slug: BuiltinAgentSlug;
}

/**
 * Runtime Result - dynamically generated config, not persisted
 */
export interface BuiltinAgentRuntimeResult {
  /** Dynamically generated system role */
  systemRole: string;
  // Future extensible fields can be added here
}

/**
 * Runtime Context - context passed to runtime function
 */
export interface RuntimeContext {
  /** Current date string (e.g., "2024-12-03") */
  currentDate: string;
  // PageAgent specific
/** Document content for PageAgent */
  documentContent?: string;

  // AgentBuilder specific
/** Target agent config for AgentBuilder */
  targetAgentConfig?: LobeAgentConfig;

  /** User's locale */
  userLocale?: string;
}

/**
 * Builtin Agent Definition - complete definition with persist and runtime parts
 */
export interface BuiltinAgentDefinition {
  /**
   * Persist config - stored in database
   */
  persist: BuiltinAgentPersistConfig;

  /**
   * Runtime function - generates dynamic config based on context
   * @param ctx - Runtime context with dynamic information
   * @returns Runtime result with generated systemRole etc.
   */
  runtime: (ctx: RuntimeContext) => BuiltinAgentRuntimeResult;
}
