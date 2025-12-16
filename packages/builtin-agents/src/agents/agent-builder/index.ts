import type { BuiltinAgentDefinition } from '../../types';
import { BUILTIN_AGENT_SLUGS } from '../../types';
import { systemRoleTemplate } from './systemRole';

/**
 * Agent Builder - used for configuring AI agents through natural conversation
 */
export const AGENT_BUILDER: BuiltinAgentDefinition = {
  avatar: '/icons/icon-agent-builder.png',

  // Persist config - stored in database
  persist: {
    model: 'claude-sonnet-4-5-20250929',
    provider: 'anthropic',
  },

  // Runtime config - static systemRole
  runtime: (ctx) => ({
    plugins: ['lobe-agent-builder', ...(ctx.plugins || [])],
    systemRole: systemRoleTemplate,
  }),

  slug: BUILTIN_AGENT_SLUGS.agentBuilder,
};
