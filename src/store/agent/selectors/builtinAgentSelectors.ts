import { AGENT_BUILDER, PAGE_AGENT } from '@lobechat/const';

import { AgentStoreState } from '@/store/agent/initialState';

/**
 * Get builtin agent ID by slug
 */
const getBuiltinAgentId = (slug: string) => (s: AgentStoreState) => s.builtinAgentIdMap[slug];

/**
 * Get page agent ID (convenience selector)
 */
const pageAgentId = (s: AgentStoreState) => s.builtinAgentIdMap[PAGE_AGENT.slug];

/**
 * Get agent builder ID (convenience selector)
 */
const agentBuilderId = (s: AgentStoreState) => s.builtinAgentIdMap[AGENT_BUILDER.slug];

export const builtinAgentSelectors = {
  agentBuilderId,
  getBuiltinAgentId,
  pageAgentId,
};
