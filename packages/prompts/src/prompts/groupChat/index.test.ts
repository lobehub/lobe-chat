import { describe, expect, it } from 'vitest';

import type { ChatMessage } from '@/types/index';

import { filterMessagesForAgent } from '../chatMessages';
import { buildAgentResponsePrompt, buildGroupChatSystemPrompt } from './index';

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

describe('buildAgentResponsePrompt', () => {
  it('should generate prompt for group message when no targetId provided', () => {
    const result = buildAgentResponsePrompt({});

    expect(result).toContain('the group publicly');
    expect(result).toContain("Now it's your turn to respond");
    expect(result).toContain('Directly return the message content');
    expect(result).toContain('You do not need add author name');
  });

  it('should generate prompt for direct message when targetId provided', () => {
    const result = buildAgentResponsePrompt({ targetId: 'agent-1' });

    expect(result).toContain('agent-1');
    expect(result).toContain("Now it's your turn to respond");
    expect(result).toContain('Directly return the message content');
    expect(result).toContain('You do not need add author name');
  });

  it('should handle user targetId for DM to user', () => {
    const result = buildAgentResponsePrompt({ targetId: 'user' });

    expect(result).toContain('user');
    expect(result).not.toContain('the group publicly');
  });
});

describe('filterMessagesForAgent', () => {
  const createMessage = (
    id: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    options?: { agentId?: string; targetId?: string },
  ): ChatMessage => ({
    id,
    role,
    content,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    meta: {},
    ...options,
  });

  const agentId = 'agent-1';

  it('should include system messages as-is', () => {
    const messages = [createMessage('1', 'system', 'System message')];

    const result = filterMessagesForAgent(messages, agentId);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(messages[0]);
  });

  it('should include group messages (no targetId) as-is', () => {
    const messages = [
      createMessage('1', 'user', 'Hello everyone'),
      createMessage('2', 'assistant', 'Hi there', { agentId: 'agent-2' }),
    ];

    const result = filterMessagesForAgent(messages, agentId);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(messages[0]);
    expect(result[1]).toEqual(messages[1]);
  });

  it('should include user DMs targeted to this agent as-is', () => {
    const messages = [
      createMessage('1', 'user', 'Private message to agent-1', { targetId: agentId }),
      createMessage('2', 'user', 'Private message to agent-2', { targetId: 'agent-2' }),
    ];

    const result = filterMessagesForAgent(messages, agentId);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(messages[0]); // Should include message for this agent
    expect(result[1].content).toBe('***'); // Should replace content for other agent
    expect(result[1].id).toBe('2'); // Should preserve other message properties
  });

  it('should include assistant DMs where this agent is the target', () => {
    const messages = [
      createMessage('1', 'assistant', 'DM to agent-1', { agentId: 'agent-2', targetId: agentId }),
      createMessage('2', 'assistant', 'DM to agent-2', { agentId: 'agent-3', targetId: 'agent-2' }),
    ];

    const result = filterMessagesForAgent(messages, agentId);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(messages[0]); // Should include message targeted to this agent
    expect(result[1].content).toBe('***'); // Should replace content for DM not involving this agent
  });

  it('should include assistant messages sent by this agent', () => {
    const messages = [
      createMessage('1', 'assistant', 'My message to agent-2', { agentId, targetId: 'agent-2' }),
      createMessage('2', 'assistant', 'My group message', { agentId }),
      createMessage('3', 'assistant', 'Other agent message', {
        agentId: 'agent-2',
        targetId: 'agent-3',
      }),
    ];

    const result = filterMessagesForAgent(messages, agentId);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(messages[0]); // Should include this agent's DM
    expect(result[1]).toEqual(messages[1]); // Should include this agent's group message
    expect(result[2].content).toBe('***'); // Should replace content for other agent's DM
  });

  it('should replace content with "***" for DMs not involving this agent', () => {
    const messages = [
      createMessage('1', 'user', 'Secret message', { targetId: 'agent-2' }),
      createMessage('2', 'assistant', 'Private response', { agentId: 'agent-2', targetId: 'user' }),
      createMessage('3', 'assistant', 'Agent to agent DM', {
        agentId: 'agent-2',
        targetId: 'agent-3',
      }),
    ];

    const result = filterMessagesForAgent(messages, agentId);

    expect(result).toHaveLength(3);

    // All should have "***" content since none involve agent-1
    expect(result[0].content).toBe('***');
    expect(result[1].content).toBe('***');
    expect(result[2].content).toBe('***');

    // But should preserve other properties
    expect(result[0].id).toBe('1');
    expect(result[0].role).toBe('user');
    expect(result[1].id).toBe('2');
    expect(result[1].role).toBe('assistant');
    expect(result[1].agentId).toBe('agent-2');
    expect(result[2].targetId).toBe('agent-3');
  });

  it('should handle mixed message types correctly', () => {
    const messages = [
      createMessage('1', 'system', 'System prompt'),
      createMessage('2', 'user', 'Hello everyone'), // Group message
      createMessage('3', 'assistant', 'Hi!', { agentId }), // This agent's group response
      createMessage('4', 'user', 'DM to agent-1', { targetId: agentId }), // DM to this agent
      createMessage('5', 'assistant', 'DM response', { agentId, targetId: 'user' }), // This agent's DM response
      createMessage('6', 'user', 'Secret to agent-2', { targetId: 'agent-2' }), // DM to other agent
      createMessage('7', 'assistant', 'Secret response', { agentId: 'agent-2', targetId: 'user' }), // Other agent's DM
    ];

    const result = filterMessagesForAgent(messages, agentId);

    expect(result).toHaveLength(7);

    // Should preserve content for messages involving this agent
    expect(result[0].content).toBe('System prompt'); // System message
    expect(result[1].content).toBe('Hello everyone'); // Group message
    expect(result[2].content).toBe('Hi!'); // This agent's group message
    expect(result[3].content).toBe('DM to agent-1'); // DM to this agent
    expect(result[4].content).toBe('DM response'); // This agent's DM response

    // Should replace content for DMs not involving this agent
    expect(result[5].content).toBe('***'); // DM to other agent
    expect(result[6].content).toBe('***'); // Other agent's DM response
  });

  it('should preserve all message properties except content when replacing', () => {
    const originalMessage = createMessage('1', 'user', 'Secret message', { targetId: 'agent-2' });
    originalMessage.files = ['file1'];
    originalMessage.tools = [];
    originalMessage.parentId = 'parent1';
    originalMessage.observationId = 'obs1';

    const result = filterMessagesForAgent([originalMessage], agentId);

    expect(result).toHaveLength(1);
    const filteredMessage = result[0];

    // Content should be replaced
    expect(filteredMessage.content).toBe('***');

    // All other properties should be preserved
    expect(filteredMessage.id).toBe(originalMessage.id);
    expect(filteredMessage.role).toBe(originalMessage.role);
    expect(filteredMessage.targetId).toBe(originalMessage.targetId);
    expect(filteredMessage.files).toBe(originalMessage.files);
    expect(filteredMessage.tools).toBe(originalMessage.tools);
    expect(filteredMessage.parentId).toBe(originalMessage.parentId);
    expect(filteredMessage.observationId).toBe(originalMessage.observationId);
    expect(filteredMessage.createdAt).toBe(originalMessage.createdAt);
    expect(filteredMessage.updatedAt).toBe(originalMessage.updatedAt);
    expect(filteredMessage.meta).toBe(originalMessage.meta);
  });
});
