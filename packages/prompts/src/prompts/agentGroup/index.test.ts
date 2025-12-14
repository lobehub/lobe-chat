import { describe, expect, it } from 'vitest';

import { formatAgentProfile } from './agentProfile';
import { formatGroupMembers, groupContextTemplate } from './groupContext';

describe('formatAgentProfile', () => {
  it('should format agent with all fields', () => {
    const agent = {
      description: 'Expert in backend development',
      id: 'agent-backend',
      model: 'gpt-4',
      systemRole: 'You are a backend developer expert.',
      title: 'Backend Developer',
    };

    expect(formatAgentProfile(agent)).toMatchSnapshot();
  });

  it('should use default title when title is missing', () => {
    const agent = {
      id: 'agent-123',
      title: null,
    };

    expect(formatAgentProfile(agent)).toMatchSnapshot();
  });

  it('should show N/A for missing optional fields', () => {
    const agent = {
      id: 'agent-123',
    };

    expect(formatAgentProfile(agent)).toMatchSnapshot();
  });

  it('should truncate systemRole longer than 500 characters', () => {
    const longSystemRole = 'A'.repeat(600);
    const agent = {
      id: 'agent-123',
      systemRole: longSystemRole,
      title: 'Test Agent',
    };

    const result = formatAgentProfile(agent);
    expect(result).toContain('A'.repeat(500));
    expect(result).toContain('... (truncated)');
    expect(result).not.toContain('A'.repeat(501));
  });

  it('should not truncate systemRole with exactly 500 characters', () => {
    const exactSystemRole = 'B'.repeat(500);
    const agent = {
      id: 'agent-123',
      systemRole: exactSystemRole,
    };

    const result = formatAgentProfile(agent);
    expect(result).toContain('B'.repeat(500));
    expect(result).not.toContain('... (truncated)');
  });
});

describe('groupContextTemplate', () => {
  it('should match snapshot', () => {
    expect(groupContextTemplate).toMatchSnapshot();
  });

  it('should contain all required placeholders', () => {
    expect(groupContextTemplate).toContain('{{AGENT_NAME}}');
    expect(groupContextTemplate).toContain('{{AGENT_ROLE}}');
    expect(groupContextTemplate).toContain('{{AGENT_ID}}');
    expect(groupContextTemplate).toContain('{{GROUP_NAME}}');
    expect(groupContextTemplate).toContain('{{GROUP_MEMBERS}}');
  });

  it('should contain LOBE-1866 rules section', () => {
    expect(groupContextTemplate).toContain('[Important Rules]');
    expect(groupContextTemplate).toContain('<!-- SYSTEM CONTEXT -->');
    expect(groupContextTemplate).toContain('MUST NEVER appear in your responses');
  });
});

describe('formatGroupMembers', () => {
  it('should format members list', () => {
    const members = [
      { id: 'agt_supervisor', name: 'Supervisor', role: 'supervisor' as const },
      { id: 'agt_writer', name: 'Writer', role: 'participant' as const },
      { id: 'agt_editor', name: 'Editor', role: 'participant' as const },
    ];

    expect(formatGroupMembers(members)).toMatchSnapshot();
  });

  it('should mark current agent with <- You', () => {
    const members = [
      { id: 'agt_supervisor', name: 'Supervisor', role: 'supervisor' as const },
      { id: 'agt_editor', name: 'Editor', role: 'participant' as const },
    ];

    expect(formatGroupMembers(members, 'agt_editor')).toMatchSnapshot();
  });

  it('should handle empty members array', () => {
    expect(formatGroupMembers([])).toBe('');
  });
});
