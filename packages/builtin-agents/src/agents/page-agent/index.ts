import type { BuiltinAgentDefinition } from '../../types';
import { BUILTIN_AGENT_SLUGS } from '../../types';
import { systemRoleTemplate } from './systemRole';

/**
 * Page Agent - used for document editing assistance
 */
export const PAGE_AGENT: BuiltinAgentDefinition = {
  // Persist config - stored in database
  persist: {
    model: 'claude-sonnet-4-5-20250929',
    provider: 'anthropic',
    slug: BUILTIN_AGENT_SLUGS.pageAgent,
  },

  // Runtime function - generates dynamic config
  runtime: (ctx) => ({
    systemRole: `${systemRoleTemplate}

Current document:
${ctx.documentContent || 'No document loaded'}

Today's date: ${ctx.currentDate}`,
  }),
};
