import { describe, expect, it } from 'vitest';

import { formatAgentProfile } from './index';

describe('formatAgentProfile', () => {
  it('should format agent with all fields', () => {
    const agent = {
      id: 'agent-backend',
      title: 'Backend Developer',
      description: 'Expert in backend development',
      model: 'gpt-4',
      systemRole: 'You are a backend developer expert.',
    };

    const result = formatAgentProfile(agent);

    expect(result).toContain('# Agent: Backend Developer');
    expect(result).toContain('- **ID**: agent-backend');
    expect(result).toContain('- **Description**: Expert in backend development');
    expect(result).toContain('- **Model**: gpt-4');
    expect(result).toContain('## System Role');
    expect(result).toContain('You are a backend developer expert.');
  });

  it('should use id as title when title is missing', () => {
    const agent = {
      id: 'agent-123',
      title: null,
    };

    const result = formatAgentProfile(agent);

    expect(result).toContain('# Agent: Untitled Agent');
  });

  it('should show N/A for missing optional fields', () => {
    const agent = {
      id: 'agent-123',
    };

    const result = formatAgentProfile(agent);

    expect(result).toContain('- **Description**: N/A');
    expect(result).toContain('- **Model**: Unknown Model');
  });

  it('should truncate systemRole longer than 500 characters', () => {
    const longSystemRole = 'A'.repeat(600);
    const agent = {
      id: 'agent-123',
      title: 'Test Agent',
      systemRole: longSystemRole,
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
