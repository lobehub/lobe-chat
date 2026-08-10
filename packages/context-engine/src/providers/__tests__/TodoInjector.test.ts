import { describe, expect, it } from 'vitest';

import type { Message, PipelineContext } from '../../types';
import type { TodoList } from '../TodoInjector';
import { TodoInjector } from '../TodoInjector';

const createContext = (messages: Message[]): PipelineContext => ({
  initialState: { messages: [] },
  isAborted: false,
  messages,
  metadata: {},
});

const todos = (...items: Array<[string, 'todo' | 'processing' | 'completed']>): TodoList => ({
  items: items.map(([text, status]) => ({ status, text })),
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const toolLoopMessages = (): Message[] => [
  { content: 'system role', role: 'system' },
  { content: 'help me refactor the parser', id: 'msg-user', role: 'user' },
  {
    content: '',
    id: 'msg-assistant',
    role: 'assistant',
    tool_calls: [
      { function: { arguments: '{}', name: 'createTodos' }, id: 'call-1', type: 'function' },
    ],
  },
  {
    content: '{"success":true}',
    id: 'msg-tool',
    pluginState: { todos: todos(['write tests', 'todo']) },
    role: 'tool',
    tool_call_id: 'call-1',
  },
];

const payloadSignatures = (messages: Message[]) =>
  messages.map(({ content, role }) => JSON.stringify({ content, role }));

describe('TodoInjector', () => {
  it('keeps tool-loop history unchanged and appends a standalone virtual tail', async () => {
    const messages = toolLoopMessages();
    const historySignatures = payloadSignatures(messages);

    const result = await new TodoInjector({
      enabled: true,
      todos: todos(['write tests', 'todo']),
    }).process(createContext(messages));

    expect(payloadSignatures(result.messages.slice(0, -1))).toEqual(historySignatures);
    expect(result.messages.at(-1)).toMatchObject({
      meta: { injectType: 'TodoInjector', virtualLastUser: true },
      role: 'user',
    });
    expect(result.messages.at(-1)?.content).toContain('<todo_context>');
    expect(result.messages.at(-1)?.content).toContain(
      '<todo index="0" status="todo">write tests</todo>',
    );
  });

  it('creates its own tail even when the current tail is a real or virtual user message', async () => {
    const realUserResult = await new TodoInjector({
      enabled: true,
      todos: todos(['plan migration', 'processing']),
    }).process(createContext([{ content: 'plan migration', role: 'user' }]));

    const virtualTail = {
      content: '<next_actions>keep going</next_actions>',
      meta: { injectType: 'OnboardingActionHintInjector', virtualLastUser: true },
      role: 'user',
    };
    const virtualUserResult = await new TodoInjector({
      enabled: true,
      todos: todos(['keep going', 'processing']),
    }).process(createContext([{ content: 'Hello', role: 'user' }, virtualTail]));

    expect(realUserResult.messages).toHaveLength(2);
    expect(realUserResult.messages[0].content).toBe('plan migration');
    expect(virtualUserResult.messages).toHaveLength(3);
    expect(virtualUserResult.messages[1]).toEqual(virtualTail);
    expect(virtualUserResult.messages[2].meta?.injectType).toBe('TodoInjector');
  });

  it('changes only the virtual tail across todo updates', async () => {
    const first = await new TodoInjector({
      enabled: true,
      todos: todos(['read code', 'processing'], ['write tests', 'todo']),
    }).process(createContext(toolLoopMessages()));
    const second = await new TodoInjector({
      enabled: true,
      todos: todos(['read code', 'completed'], ['write tests', 'processing']),
    }).process(createContext(toolLoopMessages()));

    expect(payloadSignatures(second.messages.slice(0, -1))).toEqual(
      payloadSignatures(first.messages.slice(0, -1)),
    );
    expect(second.messages.at(-1)?.content).not.toBe(first.messages.at(-1)?.content);
  });

  it('records todo metadata', async () => {
    const result = await new TodoInjector({
      enabled: true,
      todos: todos(['read code', 'completed'], ['write tests', 'processing'], ['ship', 'todo']),
    }).process(createContext(toolLoopMessages()));

    expect(result.metadata).toMatchObject({
      todoCompletedCount: 1,
      todoCount: 3,
      todoInjected: true,
      todoProcessingCount: 1,
    });
  });

  it('skips disabled, empty, and userless contexts', async () => {
    const disabled = await new TodoInjector({
      enabled: false,
      todos: todos(['write tests', 'todo']),
    }).process(createContext(toolLoopMessages()));
    const empty = await new TodoInjector({
      enabled: true,
      todos: todos(),
    }).process(createContext(toolLoopMessages()));
    const userless = await new TodoInjector({
      enabled: true,
      todos: todos(['write tests', 'todo']),
    }).process(
      createContext([
        { content: 'system role', role: 'system' },
        {
          content: '<next_actions>keep going</next_actions>',
          meta: { injectType: 'OnboardingActionHintInjector', virtualLastUser: true },
          role: 'user',
        },
      ]),
    );

    expect(disabled.messages).toHaveLength(4);
    expect(empty.messages).toHaveLength(4);
    expect(userless.messages).toHaveLength(2);
  });
});
