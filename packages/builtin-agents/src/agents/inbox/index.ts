import type { BuiltinAgentDefinition } from '../../types';
import { BUILTIN_AGENT_SLUGS } from '../../types';
import { systemRole } from './systemRole';

/**
 * Inbox Agent - the default assistant agent for general conversations
 *
 * Note: model and provider are intentionally undefined to use user's default settings
 */
export const INBOX: BuiltinAgentDefinition = {
  runtime: { systemRole: systemRole },

  slug: BUILTIN_AGENT_SLUGS.inbox,
};
