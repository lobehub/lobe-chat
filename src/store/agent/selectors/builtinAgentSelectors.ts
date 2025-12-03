import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';

import { AgentStoreState } from '@/store/agent/initialState';

/**
 * Get builtin agent ID by slug
 */
const getBuiltinAgentId = (slug: string) => (s: AgentStoreState) => s.builtinAgentIdMap[slug];

/**
 * Get page agent ID (convenience selector)
 */
const pageAgentId = (s: AgentStoreState) => s.builtinAgentIdMap[BUILTIN_AGENT_SLUGS.pageAgent];

/**
 * Get agent builder ID (convenience selector)
 */
const agentBuilderId = (s: AgentStoreState) =>
  s.builtinAgentIdMap[BUILTIN_AGENT_SLUGS.agentBuilder];

export const builtinAgentSelectors = {
  agentBuilderId,
  getBuiltinAgentId,
  pageAgentId,
};
