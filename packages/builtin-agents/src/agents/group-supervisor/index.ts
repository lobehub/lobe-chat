import type { BuiltinAgentDefinition } from '../../types';
import { BUILTIN_AGENT_SLUGS } from '../../types';
import { supervisorSystemRole } from './systemRole';
import type { GroupSupervisorContext } from './type';

/**
 * Build group members XML from context
 */
const buildGroupMembersXml = (agents: GroupSupervisorContext['availableAgents']): string => {
  return agents
    .map((agent) => `  <member name="${agent.title || agent.id}" id="${agent.id}" />`)
    .join('\n');
};

/**
 * Replace template variables in system role
 */
const resolveSystemRole = (ctx: GroupSupervisorContext): string => {
  const membersXml = buildGroupMembersXml(ctx.availableAgents);

  return supervisorSystemRole
    .replace('{{GROUP_TITLE}}', ctx.groupTitle)
    .replace('{{SYSTEM_PROMPT}}', ctx.systemPrompt || '')
    .replace('{{GROUP_MEMBERS}}', membersXml);
};

/**
 * Group Supervisor - orchestrates multi-agent group conversations
 *
 * The supervisor agent is responsible for:
 * - Strategically coordinating agent participation
 * - Ensuring natural conversation flow
 * - Matching user queries to appropriate agent expertise
 */
export const GROUP_SUPERVISOR: BuiltinAgentDefinition = {
  runtime: (ctx) => {
    const { groupSupervisorContext } = ctx;

    if (!groupSupervisorContext) {
      return { systemRole: '' };
    }

    return {
      chatConfig: {
        enableHistoryCount: false,
      },
      plugins: ['lobe-group-management', ...(ctx.plugins || [])],
      systemRole: resolveSystemRole(groupSupervisorContext),
    };
  },

  slug: BUILTIN_AGENT_SLUGS.groupSupervisor,
};
