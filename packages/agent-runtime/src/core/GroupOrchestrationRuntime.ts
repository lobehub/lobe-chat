import type {
  AgentState,
  GroupOrchestrationContext,
  GroupOrchestrationExecutor,
  GroupOrchestrationExecutorResult,
  GroupOrchestrationInstruction,
  GroupOrchestrationRuntimeConfig,
  IGroupOrchestrationSupervisor,
} from '../types';

/**
 * GroupOrchestrationRuntime - Specialized Runtime for Multi-Agent collaboration
 *
 * Differences from AgentRuntime:
 * - Uses IGroupOrchestrationSupervisor instead of Agent
 * - Uses GroupOrchestrationContext instead of AgentRuntimeContext
 * - Uses GroupOrchestrationInstruction instead of AgentInstruction
 */
export class GroupOrchestrationRuntime {
  private executors: Partial<
    Record<GroupOrchestrationInstruction['type'], GroupOrchestrationExecutor>
  >;
  private operationId?: string;
  private getOperation?: GroupOrchestrationRuntimeConfig['getOperation'];

  constructor(
    private supervisor: IGroupOrchestrationSupervisor,
    private config: GroupOrchestrationRuntimeConfig,
  ) {
    this.operationId = config.operationId;
    this.getOperation = config.getOperation;
    this.executors = config.executors;
  }

  /**
   * Execute a single step of the orchestration loop
   */
  async step(
    state: AgentState,
    context: GroupOrchestrationContext,
  ): Promise<GroupOrchestrationExecutorResult> {
    // 1. Increment step count
    const newState = structuredClone(state);
    newState.stepCount = (newState.stepCount || 0) + 1;
    newState.lastModified = new Date().toISOString();

    // 2. Check max steps limit
    if (newState.maxSteps && newState.stepCount > newState.maxSteps) {
      newState.status = 'done';
      return {
        events: [
          {
            reason: `Maximum steps exceeded: ${newState.maxSteps}`,
            type: 'done',
          },
        ],
        newState,
        nextContext: undefined,
      };
    }

    // 3. Get instruction from supervisor
    const instruction = await this.supervisor.runner(context, newState);

    // 4. Get executor for instruction type
    const executor = this.executors[instruction.type];
    if (!executor) {
      throw new Error(`No executor found for instruction type: ${instruction.type}`);
    }

    // 5. Execute instruction
    const result = await executor(instruction, newState);

    // 6. Preserve step count and lastModified
    result.newState.stepCount = newState.stepCount;
    result.newState.lastModified = newState.lastModified;

    return result;
  }

  /**
   * Get operation context
   */
  getContext(): Record<string, unknown> | undefined {
    if (!this.operationId || !this.getOperation) {
      return undefined;
    }
    return this.getOperation(this.operationId).context;
  }

  /**
   * Get operation abort controller
   */
  getAbortController(): AbortController | undefined {
    if (!this.operationId || !this.getOperation) {
      return undefined;
    }
    return this.getOperation(this.operationId).abortController;
  }

  /**
   * Create initial state for group orchestration
   */
  static createInitialState(
    partialState?: Partial<AgentState> & { operationId: string },
  ): AgentState {
    const now = new Date().toISOString();
    return {
      cost: {
        calculatedAt: now,
        currency: 'USD',
        llm: { byModel: [], currency: 'USD', total: 0 },
        tools: { byTool: [], currency: 'USD', total: 0 },
        total: 0,
      },
      createdAt: now,
      lastModified: now,
      messages: [],
      status: 'idle',
      stepCount: 0,
      toolManifestMap: {},
      usage: {
        humanInteraction: {
          approvalRequests: 0,
          promptRequests: 0,
          selectRequests: 0,
          totalWaitingTimeMs: 0,
        },
        llm: {
          apiCalls: 0,
          processingTimeMs: 0,
          tokens: { input: 0, output: 0, total: 0 },
        },
        tools: {
          byTool: [],
          totalCalls: 0,
          totalTimeMs: 0,
        },
      },
      ...(partialState || { operationId: '' }),
    };
  }
}
