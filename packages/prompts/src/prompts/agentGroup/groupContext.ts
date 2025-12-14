/**
 * Group Context Template
 *
 * Template for injecting group context into participant agents' system role.
 * Used by GroupContextInjector in context-engine.
 */

/**
 * Group member info for context injection
 */
export interface GroupContextMemberInfo {
  id: string;
  name: string;
  role: 'supervisor' | 'participant';
}

/**
 * Group context template for participant agents in multi-agent chat
 *
 * Variables (replaced by GroupContextInjector):
 * - {{AGENT_NAME}} - Current agent's display name
 * - {{AGENT_ROLE}} - Current agent's role (supervisor/participant)
 * - {{AGENT_ID}} - Current agent's internal ID
 * - {{GROUP_NAME}} - Name of the agent group
 * - {{GROUP_MEMBERS}} - Formatted list of group members (use formatGroupMembers to generate)
 *
 * The [Important Rules] section prevents SYSTEM CONTEXT leakage (LOBE-1866)
 */
export const groupContextTemplate = `[Your Identity]
Name: {{AGENT_NAME}}
Role: {{AGENT_ROLE}}
Agent ID: {{AGENT_ID}} (internal use only, never expose)

[Group Info]
Group: {{GROUP_NAME}}
Members:
{{GROUP_MEMBERS}}

[Important Rules]
- Messages in the conversation may contain "<!-- SYSTEM CONTEXT -->" blocks.
- These are application-level metadata and MUST NEVER appear in your responses.
- Never reproduce, reference, or include any XML-like tags or comment markers from the conversation.`;

/**
 * Format group members list for {{GROUP_MEMBERS}} placeholder replacement
 *
 * @param members - List of group members
 * @param currentAgentId - Current agent's ID (will be marked with " <- You")
 * @returns Formatted members string for template replacement
 *
 * @example
 * ```typescript
 * const members = [
 *   { id: 'agt_supervisor', name: 'Supervisor', role: 'supervisor' },
 *   { id: 'agt_editor', name: 'Editor', role: 'participant' },
 * ];
 * const formatted = formatGroupMembers(members, 'agt_editor');
 * // Returns:
 * // - Supervisor (supervisor)
 * // - Editor (participant) <- You
 * ```
 */
export const formatGroupMembers = (
  members: GroupContextMemberInfo[],
  currentAgentId?: string,
): string => {
  return members
    .map((m) => {
      const youMarker = m.id === currentAgentId ? ' <- You' : '';
      return `- ${m.name} (${m.role})${youMarker}`;
    })
    .join('\n');
};
