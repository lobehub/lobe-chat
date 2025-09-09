import { describe, expect, it, vi } from 'vitest';

import { type AgentGenerator, type AgentInstruction, AgentRuntime } from './index';

const collectTrace = async (
  iter: AsyncGenerator<unknown, unknown, unknown>,
  responses: Record<string, unknown> = {},
) => {
  const trace: unknown[] = [];
  let step = await iter.next();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (step.done) {
      trace.push(step.value);
      break;
    }
    const ev = step.value as any;
    trace.push(ev);
    if (ev?.status === 'paused') {
      const key = ev.instruction?.payload as string | undefined;
      const resume = key ? responses[key] : undefined;
      step = await iter.next(resume);
    } else {
      step = await iter.next();
    }
  }
  return trace;
};

const createTestAgent = function* (): AgentGenerator {
  // greet
  const name = (yield {
    type: 'PROMPT',
    payload: 'your name?',
  } satisfies AgentInstruction) as string;

  // call tool and continue
  const sum = (yield {
    type: 'CALL_TOOL',
    tool: 'calculator',
    args: [2, 3],
  } satisfies AgentInstruction) as number;

  // echo
  yield { type: 'PROMPT', payload: `hi ${name}, sum is ${sum}` } as const;

  return 'completed';
};

describe('AgentRuntime (generator/yield)', () => {
  it('should collect full trace in one while loop with responses', async () => {
    const runtime = new AgentRuntime({
      createAgent: createTestAgent,
      tools: {
        calculator: async (args) => {
          const [a, b] = args as [number, number];
          return a + b;
        },
      },
    });

    const trace = await collectTrace(runtime.run(), { 'your name?': 'Alice' });

    expect(trace).toEqual([
      { status: 'paused', instruction: { type: 'PROMPT', payload: 'your name?' } },
      { status: 'paused', instruction: { type: 'PROMPT', payload: 'hi Alice, sum is 5' } },
      { status: 'finished', value: 'completed' },
    ]);

    // nothing should throw; interrupt to finish gracefully
    runtime.interrupt('test end');
    expect(true).toBe(true);
  });

  it('should allow interrupt before completion', async () => {
    const runtime = new AgentRuntime({
      createAgent: createTestAgent,
      tools: {
        calculator: async (args) => {
          const [a, b] = args as [number, number];
          return a + b;
        },
      },
    });
    const it = runtime.run();
    await it.next(); // pause at first PROMPT
    expect(() => runtime.interrupt('stop')).not.toThrow();
  });

  it('should collect full running trace in one loop with responses', async () => {
    const agent = function* (): AgentGenerator {
      const text = (yield {
        type: 'PROMPT',
        payload: 'stream?',
      } satisfies AgentInstruction) as string;
      const streamed = (yield {
        type: 'CALL_TOOL',
        tool: 'stream',
        args: [text],
      } satisfies AgentInstruction) as string;
      yield { type: 'PROMPT', payload: streamed } as const;
      return 'done';
    };

    const runtime = new AgentRuntime({
      createAgent: () => agent(),
      tools: {
        stream: (args) => {
          const text = String((args as unknown[] | undefined)?.[0] ?? '');
          async function* gen() {
            for (const ch of text) {
              await new Promise((r) => setTimeout(r, 1));
              yield ch;
            }
          }
          return gen();
        },
      },
    });

    const trace = await collectTrace(runtime.run(), { 'stream?': 'ABC' });

    expect(trace).toEqual([
      { status: 'paused', instruction: { type: 'PROMPT', payload: 'stream?' } },
      { status: 'running', data: 'A' },
      { status: 'running', data: 'B' },
      { status: 'running', data: 'C' },
      { status: 'paused', instruction: { type: 'PROMPT', payload: 'ABC' } },
      { status: 'finished', value: 'done' },
    ]);

    runtime.interrupt('end');
  });
});
