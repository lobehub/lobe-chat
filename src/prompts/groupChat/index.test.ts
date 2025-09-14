import { describe, expect, it } from 'vitest';

import type { ChatMessage } from '@/types/message';

import { buildGroupChatSystemPrompt } from './index';

describe('buildGroupChatSystemPrompt', () => {
  const baseSystemRole = 'You are an expert collaborator.';

  const messages: ChatMessage[] = [
    {
      id: 'm1',
      role: 'user',
      content: 'Hello everyone',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      meta: {},
    },
    {
      id: 'm2',
      role: 'assistant',
      agentId: 'agent-1',
      content: 'Hi! I can help with that.',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      meta: {},
    },
  ];

  it('should include base system role, guidelines, members and history', () => {
    const result = buildGroupChatSystemPrompt({
      agentId: 'agent-1',
      baseSystemRole,
      groupMembers: [
        { id: 'user', title: 'User Name' },
        { id: 'agent-1', title: 'Agent One' },
      ],
      messages,
    });

    expect(result.startsWith(baseSystemRole)).toBe(true);
    expect(result).toContain('Guidelines:');
    expect(result).toContain('Stay in character as agent-1');
    expect(result).toContain('<group_members>');
    expect(result).toContain('"id": "user"');
    expect(result).toContain('"title": "Agent One"');
    expect(result).toContain('</group_members>');

    expect(result).toContain('<chat_history_author>');
    expect(result).toContain('1: User Name');
    expect(result).toContain('2: Agent One');
    expect(result).toContain('</chat_history_author>');

    // should be trimmed
    expect(result).toBe(result.trim());
  });

  it('should omit members and history tags when inputs are empty', () => {
    const result = buildGroupChatSystemPrompt({
      agentId: 'agent-2',
      baseSystemRole,
      groupMembers: [],
      messages: [],
    });

    expect(result.startsWith(baseSystemRole)).toBe(true);
    expect(result).toContain('Stay in character as agent-2');
    expect(result).not.toContain('<group_members>');
    expect(result).not.toContain('<chat_history_author>');
  });
});


