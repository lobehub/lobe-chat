import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { chatService } from '@/services/chat';

import { GroupChatSupervisor, type SupervisorContext } from './supervisor';

vi.mock('@lobechat/prompts', () => ({
  groupChatPrompts: {
    buildSupervisorPrompt: vi.fn(() => 'structured-supervisor-prompt'),
  },
  groupSupervisorPrompts: vi.fn(() => 'conversation-history'),
}));

vi.mock('@/services/chat', () => ({
  chatService: {
    fetchPresetTaskResult: vi.fn(),
    getStructuredCompletion: vi.fn(),
  },
}));

describe('GroupChatSupervisor', () => {
  const supervisor = new GroupChatSupervisor();

  const baseContext = {
    abortController: undefined,
    allowDM: true,
    availableAgents: [
      { id: 'agent-1', title: 'Agent One' },
      { id: 'agent-2', title: 'Agent Two' },
    ],
    groupId: 'group-1',
    messages: [
      {
        content: 'Hello',
        role: 'user',
      },
    ],
    model: 'gpt-4o',
    provider: 'openai',
    systemPrompt: 'You are a helpful supervisor',
    userName: 'Tester',
  } as unknown as SupervisorContext;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('should request structured completion and return filtered decisions', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    vi.mocked(chatService.getStructuredCompletion).mockResolvedValue([
      { tool_name: 'create_todo', parameter: { content: 'Review action items' } },
      { tool_name: 'create_todo', parameter: { content: 'Prepare summary' } },
      {
        tool_name: 'trigger_agent',
        parameter: { id: 'agent-1', instruction: 'Say hello', target: 'user' },
      },
      {
        tool_name: 'trigger_agent',
        parameter: { id: 'unknown-agent', instruction: 'Ignore me' },
      },
    ]);

    const result = await supervisor.makeDecision({ ...baseContext });

    expect(chatService.getStructuredCompletion).toHaveBeenCalledTimes(1);
    const [payload] = vi.mocked(chatService.getStructuredCompletion).mock.calls[0];
    expect(payload).toMatchObject({
      messages: [{ content: 'structured-supervisor-prompt', role: 'user' }],
      response_format: {
        type: 'json_schema',
        json_schema: {
          schema: {
            type: 'array',
          },
        },
      },
      stream: false,
    });

    expect(result.decisions).toEqual([
      {
        id: 'agent-1',
        instruction: 'Say hello',
        target: 'user',
      },
    ]);

    expect(result.todos).toEqual([
      { content: 'Review action items', finished: false },
      { content: 'Prepare summary', finished: false },
    ]);

    expect(result.todoUpdated).toBe(true);

    expect(logSpy).toHaveBeenCalledWith('Supervisor TODO list:', [
      { content: 'Review action items', finished: false },
      { content: 'Prepare summary', finished: false },
    ]);
    logSpy.mockRestore();
  });

  it('should fall back to streaming decision when structured response parsing fails', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(chatService.getStructuredCompletion).mockRejectedValue(new SyntaxError('Unexpected token i'));
    vi.mocked(chatService.fetchPresetTaskResult).mockImplementation(async ({ onFinish }) => {
      const payload = [
        '```json',
        '[',
        '  {',
        '    "tool_name": "create_todo",',
        '    "parameter": { "content": "Follow up with the user" }',
        '  },',
        '  {',
        '    "tool_name": "trigger_agent",',
        '    "parameter": { "id": "agent-2", "instruction": "Fallback", "target": "user" }',
        '  }',
        ']',
        '```',
        '',
      ].join('\n');

      await onFinish?.(payload, {} as any);
    });

    const result = await supervisor.makeDecision({ ...baseContext });

    expect(chatService.fetchPresetTaskResult).toHaveBeenCalled();
    expect(result.decisions).toEqual([
      {
        id: 'agent-2',
        instruction: 'Fallback',
        target: 'user',
      },
    ]);

    expect(result.todos).toEqual([
      { content: 'Follow up with the user', finished: false },
    ]);

    expect(result.todoUpdated).toBe(true);

    expect(logSpy).toHaveBeenCalledWith('Supervisor TODO list:', [
      { content: 'Follow up with the user', finished: false },
    ]);
    logSpy.mockRestore();
  });

  it('should wrap non-recoverable errors from structured completion', async () => {
    vi.mocked(chatService.getStructuredCompletion).mockRejectedValue(new Error('LLM error'));

    await expect(supervisor.makeDecision({ ...baseContext })).rejects.toThrow(
      'Supervisor decision failed: LLM error',
    );
  });
});
