import type { BuiltinAgentDefinition } from '../../types';
import { BUILTIN_AGENT_SLUGS } from '../../types';
import { systemRoleTemplate } from './systemRole';

/**
 * Inbox Agent - the default assistant agent for general conversations
 *
 * Note: model and provider are intentionally undefined to use user's default settings
 */
export const INBOX: BuiltinAgentDefinition = {
  // Persist config - stored in database
  // Note: model/provider undefined to inherit from user's default settings
  persist: {
    slug: BUILTIN_AGENT_SLUGS.inbox,
  },

  // Runtime function - generates dynamic config
  runtime: (ctx) => ({
    systemRole: `${systemRoleTemplate}

Today's date: ${ctx.currentDate}`,
  }),
};
