import type { BuiltinAgentDefinition } from '../../types';
import { BUILTIN_AGENT_SLUGS } from '../../types';
import { systemRoleTemplate } from './systemRole';

/**
 * Agent Builder - used for configuring AI agents through natural conversation
 */
export const AGENT_BUILDER: BuiltinAgentDefinition = {
  // Persist config - stored in database
  persist: {
    model: 'claude-sonnet-4-5-20250929',
    provider: 'anthropic',
    slug: BUILTIN_AGENT_SLUGS.agentBuilder,
  },

  // Runtime function - generates dynamic config
  runtime: (ctx) => ({
    systemRole: `${systemRoleTemplate}

<context>
Today's date: ${ctx.currentDate}
${ctx.targetAgentConfig ? `Target Agent Config:\n${JSON.stringify(ctx.targetAgentConfig, null, 2)}` : ''}
</context>`,
  }),
};
