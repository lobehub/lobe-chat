import { DEFAULT_MINI_PROVIDER } from '@lobechat/business-const';
import { DEFAULT_MINI_MODEL } from '@lobechat/const';

import type { BuiltinAgentDefinition } from '../../types';
import { BUILTIN_AGENT_SLUGS } from '../../types';
import { discoverySystemRole } from './discoverySystemRole';
import { diveSystemRole } from './diveSystemRole';

/**
 * Produces bounded tags, Annotation text, and related Document selections.
 */
export const QUICK_NOTE_DISCOVERY: BuiltinAgentDefinition = {
  avatar: '/avatars/lobe-ai.png',
  persist: {
    chatConfig: { enableAgentMode: false, searchMode: 'off', toolMode: 'custom' },
    model: DEFAULT_MINI_MODEL,
    provider: DEFAULT_MINI_PROVIDER,
  },
  runtime: {
    agencyConfig: { executionTarget: 'none' },
    chatConfig: {
      enableAgentMode: false,
      memory: { enabled: false },
      searchMode: 'off',
      toolMode: 'custom',
    },
    plugins: [],
    systemRole: discoverySystemRole,
  },
  slug: BUILTIN_AGENT_SLUGS.quickNoteDiscovery,
};

/**
 * Orchestrates an explicit Dive and delegates specialist work to Domain Agents.
 */
export const QUICK_NOTE_DIVE: BuiltinAgentDefinition = {
  avatar: '/avatars/lobe-ai.png',
  runtime: (context) => ({
    plugins: ['lobe-agent', ...(context.plugins ?? [])],
    systemRole: diveSystemRole,
  }),
  slug: BUILTIN_AGENT_SLUGS.quickNoteDive,
};
