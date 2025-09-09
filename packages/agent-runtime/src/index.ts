export type AgentInstruction =
  | { payload: string; type: 'PROMPT' }
  | { args?: unknown[]; tool: string; type: 'CALL_TOOL' };

export type AgentGenerator = Generator<AgentInstruction, unknown, unknown>;

export type RunResult =
  | { instruction: AgentInstruction; status: 'paused' }
  | { status: 'finished'; value: unknown }
  | { status: 'stopped' };

export type RunEvent = { data: unknown, status: 'running'; } | RunResult;

export type ToolHandler = (args: unknown[]) => Promise<unknown> | AsyncIterable<unknown> | unknown;
export type ToolRegistry = Record<string, ToolHandler>;

export interface AgentRuntimeOptions {
  createAgent: () => AgentGenerator;
  tools?: ToolRegistry;
}

export class AgentRuntime {
  private readonly agentIterator: AgentGenerator;
  private stopped = false;
  private readonly tools: ToolRegistry;

  constructor(options: AgentRuntimeOptions) {
    this.agentIterator = options.createAgent();
    this.tools = options.tools ?? {};
  }

  async *run(): AsyncGenerator<RunEvent, RunResult, unknown> {
    if (this.stopped) return { status: 'stopped' };

    let result = this.agentIterator.next();

    // Step until next PROMPT or finish
    while (!result.done) {
      const instruction = result.value;

      switch (instruction.type) {
        case 'PROMPT': {
          // yield paused; await resume value from caller via next(resume)
          const resume: unknown = (yield { instruction, status: 'paused' } as const) as unknown;
          result = this.agentIterator.next(resume);
          break;
        }
        case 'CALL_TOOL': {
          const toolResult = await this.executeTool(instruction.tool, instruction.args ?? []);

          // If the tool returns an async iterable, stream chunks as running events
          if (toolResult && typeof (toolResult as any)[Symbol.asyncIterator] === 'function') {
            let aggregated: unknown = '';
            for await (const chunk of toolResult as AsyncIterable<unknown>) {
              yield { data: chunk, status: 'running' } as const;
              if (typeof aggregated === 'string' && typeof chunk === 'string') aggregated += chunk;
              else aggregated = chunk;
            }
            result = this.agentIterator.next(aggregated);
          } else {
            result = this.agentIterator.next(toolResult);
          }
          break;
        }
        default: {
          this.interrupt(`Unknown instruction: ${(instruction as { type: string }).type}`);
          return { status: 'stopped' };
        }
      }
    }

    this.stopped = true;
    return { status: 'finished', value: result.value };
  }

  interrupt(reason = 'Interrupted') {
    if (this.stopped) return;
    try {
      this.agentIterator.return?.(reason);
    } finally {
      this.stopped = true;
    }
  }

  protected async executeTool(tool: string, args: unknown[]): Promise<unknown> {
    const handler = this.tools[tool];
    if (!handler) return null;
    return handler(args);
  }
}
