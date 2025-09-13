import type {
  Agent,
  AgentEvent,
  AgentInstruction,
  AgentState,
  Cost,
  InstructionExecutor,
  RuntimeConfig,
  RuntimeContext,
  ToolRegistry,
  ToolsCalling,
  Usage,
} from '../types';

/**
 * Simplified Agent Runtime - The "Engine" that executes instructions from an "Agent" (Brain).
 * Now includes built-in call_llm support and allows full executor customization.
 */
export class AgentRuntime {
  private executors: Record<AgentInstruction['type'], InstructionExecutor>;

  constructor(
    private agent: Agent,
    private config: RuntimeConfig = {},
  ) {
    // Build executors with priority: agent.executors > config.executors > built-in
    this.executors = {
      call_llm: this.createCallLLMExecutor(),
      call_tool: this.createCallToolExecutor(),
      finish: this.createFinishExecutor(),
      request_human_approve: this.createHumanApproveExecutor(),
      request_human_prompt: this.createHumanPromptExecutor(),
      request_human_select: this.createHumanSelectExecutor(),
      // Config executors override built-in
      ...config.executors,
      // Agent provided executors have highest priority
      ...(agent.executors as any),
    };
  }

  /**
   * Executes a single step of the Plan -> Execute loop.
   * @param state - Current agent state
   * @param context - Runtime context for this step (required for proper phase detection)
   */
  async step(
    state: AgentState,
    context?: RuntimeContext,
  ): Promise<{ events: AgentEvent[]; newState: AgentState; nextContext?: RuntimeContext }> {
    try {
      // Increment step count and check limits
      const newState = structuredClone(state);
      newState.stepCount += 1;
      newState.lastModified = new Date().toISOString();

      // Check maximum steps limit
      if (newState.maxSteps && newState.stepCount > newState.maxSteps) {
        // Finish execution when maxSteps is exceeded
        newState.status = 'done';
        const finishEvent = {
          finalState: newState,
          reason: 'max_steps_exceeded' as const,
          reasonDetail: `Maximum steps exceeded: ${newState.maxSteps}`,
          type: 'done' as const,
        };
        newState.events = [...newState.events, finishEvent];

        return {
          events: [finishEvent],
          newState,
          nextContext: undefined, // No next context when done
        };
      }

      // Use provided context or create initial context
      const runtimeContext = context || this.createInitialContext(newState);

      let result: { events: AgentEvent[]; newState: AgentState; nextContext?: RuntimeContext };

      // Handle human approved tool calls
      if (runtimeContext.phase === 'human_approved_tool') {
        const approvedPayload = runtimeContext.payload as { approvedToolCall: ToolsCalling };
        result = await this.executors.call_tool(
          { toolCall: approvedPayload.approvedToolCall, type: 'call_tool' },
          newState,
        );
      } else {
        // Standard flow: Plan -> Execute
        const instruction = await this.agent.runner(runtimeContext, newState);
        result = await this.executors[instruction.type](instruction, newState);
      }

      // Ensure stepCount is preserved in the result
      result.newState.stepCount = newState.stepCount;
      result.newState.lastModified = newState.lastModified;

      // Accumulate events to state history
      result.newState.events = [...result.newState.events, ...result.events];

      return result;
    } catch (error) {
      const errorState = structuredClone(state);
      errorState.stepCount += 1;
      errorState.lastModified = new Date().toISOString();
      return this.createErrorResult(errorState, error);
    }
  }

  /**
   * Convenience method for approving and executing a tool call
   */
  async approveToolCall(
    state: AgentState,
    approvedToolCall: ToolsCalling,
  ): Promise<{ events: AgentEvent[]; newState: AgentState; nextContext?: RuntimeContext }> {
    const context: RuntimeContext = {
      payload: { approvedToolCall },
      phase: 'human_approved_tool',
      session: this.createSessionContext(state),
    };

    return this.step(state, context);
  }

  /**
   * Interrupt the current execution
   * @param state - Current agent state
   * @param reason - Reason for interruption
   * @param canResume - Whether the interruption can be resumed later
   * @param metadata - Additional metadata about the interruption
   */
  interrupt(
    state: AgentState,
    reason: string,
    canResume: boolean = true,
    metadata?: Record<string, unknown>,
  ): { events: AgentEvent[]; newState: AgentState } {
    const newState = structuredClone(state);
    const interruptedAt = new Date().toISOString();

    newState.status = 'interrupted';
    newState.lastModified = interruptedAt;
    newState.interruption = {
      canResume,
      interruptedAt,
      // Store the current step for potential resumption
      interruptedInstruction: undefined,

      reason, // Could be enhanced to store current instruction
    };

    const interruptEvent: AgentEvent = {
      canResume,
      interruptedAt,
      metadata,
      reason,
      type: 'interrupted',
    };

    newState.events = [...newState.events, interruptEvent];

    return {
      events: [interruptEvent],
      newState,
    };
  }

  /**
   * Resume execution from an interrupted state
   * @param state - Interrupted agent state
   * @param reason - Reason for resumption
   * @param context - Optional context to resume with
   */
  async resume(
    state: AgentState,
    reason: string = 'User resumed execution',
    context?: RuntimeContext,
  ): Promise<{ events: AgentEvent[]; newState: AgentState; nextContext?: RuntimeContext }> {
    if (state.status !== 'interrupted') {
      throw new Error('Cannot resume: state is not interrupted');
    }

    if (state.interruption && !state.interruption.canResume) {
      throw new Error('Cannot resume: interruption is not resumable');
    }

    const newState = structuredClone(state);
    const resumedAt = new Date().toISOString();
    const resumedFromStep = state.stepCount;

    // Clear interruption context and set status back to running
    newState.status = 'running';
    newState.lastModified = resumedAt;
    newState.interruption = undefined;

    const resumeEvent: AgentEvent = {
      reason,
      resumedAt,
      resumedFromStep,
      type: 'resumed',
    };

    newState.events = [...newState.events, resumeEvent];

    // If context is provided, continue with that context
    if (context) {
      const result = await this.step(newState, context);
      return {
        events: [resumeEvent, ...result.events],
        newState: result.newState,
        nextContext: result.nextContext,
      };
    }

    // Otherwise, just return the resumed state
    return {
      events: [resumeEvent],
      newState,
      nextContext: this.createInitialContext(newState),
    };
  }

  /**
   * Create a new agent state with flexible initialization
   * @param partialState - Partial state to override defaults
   * @returns Complete AgentState with defaults filled in
   */
  static createInitialState(partialState: Partial<AgentState> & { sessionId: string }): AgentState {
    const now = new Date().toISOString();

    // Default usage statistics
    const defaultUsage: Usage = {
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
        byTool: {},
        totalCalls: 0,
        totalTimeMs: 0,
      },
    };

    // Default cost structure
    const defaultCost: Cost = {
      calculatedAt: now,
      currency: 'USD',
      llm: {
        byModel: {},
        currency: 'USD',
        total: 0,
      },
      tools: {
        byTool: {},
        currency: 'USD',
        total: 0,
      },
      total: 0,
    };

    return {
      cost: defaultCost,
      // Default values
      createdAt: now,
      events: [],
      lastModified: now,
      messages: [],
      status: 'idle',
      stepCount: 0,
      usage: defaultUsage,
      // User provided values override defaults
      ...partialState,
    };
  }

  // ============ Executor Factory Methods ============

  /** Create call_llm executor with streaming support */
  private createCallLLMExecutor(): InstructionExecutor {
    return async (instruction, state) => {
      const { payload } = instruction as Extract<AgentInstruction, { type: 'call_llm' }>;
      const newState = structuredClone(state);
      const events: AgentEvent[] = [];

      newState.status = 'running';
      newState.lastModified = new Date().toISOString();

      events.push({ payload, type: 'llm_start' });

      // Use Agent's modelRuntime first, fallback to config
      const modelRuntime = this.agent.modelRuntime;
      if (!modelRuntime) {
        throw new Error(
          'Model Runtime is required for call_llm instruction. Provide it via Agent.modelRuntime or RuntimeConfig.modelRuntime',
        );
      }

      let assistantContent = '';
      let toolCalls: ToolsCalling[] = [];

      try {
        // Stream LLM response
        for await (const chunk of modelRuntime(payload)) {
          events.push({ chunk, type: 'llm_stream' });

          // Accumulate content and tool calls from chunks
          if (chunk.content) {
            assistantContent += chunk.content;
          }

          if (chunk.tool_calls) {
            toolCalls = chunk.tool_calls;
          }
        }

        events.push({
          result: { content: assistantContent, tool_calls: toolCalls },
          type: 'llm_result',
        });

        // Update usage and cost if agent provides calculation methods
        if (this.agent.calculateUsage) {
          newState.usage = this.agent.calculateUsage(
            'llm',
            { content: assistantContent, tool_calls: toolCalls },
            newState.usage,
          );
        }

        if (this.agent.calculateCost) {
          newState.cost = this.agent.calculateCost({
            costLimit: newState.costLimit,
            previousCost: newState.cost,
            usage: newState.usage,
          });
        }

        // Check cost limits
        if (newState.costLimit && newState.cost.total > newState.costLimit.maxTotalCost) {
          return this.handleCostLimitExceeded(newState);
        }

        // Provide next context based on LLM result
        const nextContext: RuntimeContext = {
          payload: {
            hasToolCalls: toolCalls.length > 0,
            result: { content: assistantContent, tool_calls: toolCalls },
            toolCalls,
          },
          phase: 'llm_result',
          session: this.createSessionContext(newState),
        };

        return { events, newState, nextContext };
      } catch (error) {
        return this.createErrorResult(state, error);
      }
    };
  }

  /** Create call_tool executor */
  private createCallToolExecutor(): InstructionExecutor {
    return async (instruction, state) => {
      const { toolCall } = instruction as Extract<AgentInstruction, { type: 'call_tool' }>;
      const newState = structuredClone(state);
      const events: AgentEvent[] = [];

      newState.lastModified = new Date().toISOString();
      newState.status = 'running';

      const tools = this.agent.tools || ({} as ToolRegistry);
      const handler = tools[toolCall.function.name];
      if (!handler) throw new Error(`Tool not found: ${toolCall.function.name}`);

      const args = JSON.parse(toolCall.function.arguments);
      const result = await handler(args);

      newState.messages.push({
        content: JSON.stringify(result),
        role: 'tool',
        tool_call_id: toolCall.id,
      });

      events.push({ id: toolCall.id, result, type: 'tool_result' });

      // Update usage and cost if agent provides calculation methods
      if (this.agent.calculateUsage) {
        newState.usage = this.agent.calculateUsage(
          'tool',
          { executionTime: 0, result, toolCall }, // Could track actual execution time
          newState.usage,
        );
      }

      if (this.agent.calculateCost) {
        newState.cost = this.agent.calculateCost({
          costLimit: newState.costLimit,
          previousCost: newState.cost,
          usage: newState.usage,
        });
      }

      // Check cost limits
      if (newState.costLimit && newState.cost.total > newState.costLimit.maxTotalCost) {
        return this.handleCostLimitExceeded(newState);
      }

      // Provide next context for tool result
      const nextContext: RuntimeContext = {
        payload: {
          result,
          toolCall,
          toolCallId: toolCall.id,
        },
        phase: 'tool_result',
        session: this.createSessionContext(newState),
      };

      return { events, newState, nextContext };
    };
  }

  /** Create human approve executor */
  private createHumanApproveExecutor(): InstructionExecutor {
    return async (instruction, state) => {
      const { pendingToolsCalling } = instruction as Extract<
        AgentInstruction,
        { type: 'request_human_approve' }
      >;
      const newState = structuredClone(state);

      newState.lastModified = new Date().toISOString();
      newState.status = 'waiting_for_human_input';
      newState.pendingToolsCalling = pendingToolsCalling;

      const events: AgentEvent[] = [
        {
          pendingToolsCalling,
          sessionId: newState.sessionId,
          type: 'human_approve_required',
        },
        { toolCalls: pendingToolsCalling, type: 'tool_pending' },
      ];

      return { events, newState };
    };
  }

  /** Create human prompt executor */
  private createHumanPromptExecutor(): InstructionExecutor {
    return async (instruction, state) => {
      const { metadata, prompt } = instruction as Extract<
        AgentInstruction,
        { type: 'request_human_prompt' }
      >;
      const newState = structuredClone(state);

      newState.lastModified = new Date().toISOString();
      newState.status = 'waiting_for_human_input';
      newState.pendingHumanPrompt = { metadata, prompt };

      const events: AgentEvent[] = [
        {
          metadata,
          prompt,
          sessionId: newState.sessionId,
          type: 'human_prompt_required',
        },
      ];

      return { events, newState };
    };
  }

  /** Create human select executor */
  private createHumanSelectExecutor(): InstructionExecutor {
    return async (instruction, state) => {
      const { metadata, multi, options, prompt } = instruction as Extract<
        AgentInstruction,
        { type: 'request_human_select' }
      >;
      const newState = structuredClone(state);

      newState.lastModified = new Date().toISOString();
      newState.status = 'waiting_for_human_input';
      newState.pendingHumanSelect = { metadata, multi, options, prompt };

      const events: AgentEvent[] = [
        {
          metadata,
          multi,
          options,
          prompt,
          sessionId: newState.sessionId,
          type: 'human_select_required',
        },
      ];

      return { events, newState };
    };
  }

  /** Create finish executor */
  private createFinishExecutor(): InstructionExecutor {
    return async (instruction, state) => {
      const { reason, reasonDetail } = instruction as Extract<AgentInstruction, { type: 'finish' }>;
      const newState = structuredClone(state);

      newState.lastModified = new Date().toISOString();
      newState.status = 'done';

      const events: AgentEvent[] = [
        {
          finalState: newState,
          reason,
          reasonDetail,
          type: 'done',
        },
      ];
      return { events, newState };
    };
  }

  // ============ Helper Methods ============

  /**
   * Handle cost limit exceeded scenario
   */
  private handleCostLimitExceeded(state: AgentState): {
    events: AgentEvent[];
    newState: AgentState;
    nextContext?: RuntimeContext;
  } {
    const newState = structuredClone(state);
    const costLimit = newState.costLimit!;

    switch (costLimit.onExceeded) {
      case 'stop': {
        newState.status = 'done';
        const finishEvent = {
          finalState: newState,
          reason: 'cost_limit_exceeded' as const,
          reasonDetail: `Cost limit exceeded: ${newState.cost.total} ${newState.cost.currency} > ${costLimit.maxTotalCost} ${costLimit.currency}`,
          type: 'done' as const,
        };
        newState.events = [...newState.events, finishEvent];
        return {
          events: [finishEvent],
          newState,
          nextContext: undefined,
        };
      }

      case 'interrupt': {
        return {
          ...this.interrupt(
            newState,
            `Cost limit exceeded: ${newState.cost.total} ${newState.cost.currency}`,
            true,
            {
              costExceeded: true,
              currentCost: newState.cost.total,
              limitCost: costLimit.maxTotalCost,
            },
          ),
          nextContext: undefined,
        };
      }

      default: {
        // Continue execution but emit warning event
        const warningEvent = {
          error: new Error(
            `Warning: Cost limit exceeded: ${newState.cost.total} ${newState.cost.currency}`,
          ),
          type: 'error' as const,
        };
        newState.events = [...newState.events, warningEvent];
        return {
          events: [warningEvent],
          newState,
          nextContext: {
            payload: { error: warningEvent.error, isCostWarning: true },
            phase: 'error' as const,
            session: this.createSessionContext(newState),
          },
        };
      }
    }
  }

  /**
   * Create session context metadata - reusable helper
   */
  private createSessionContext(state: AgentState) {
    return {
      eventCount: state.events.length,
      messageCount: state.messages.length,
      sessionId: state.sessionId,
      status: state.status,
      stepCount: state.stepCount,
    };
  }

  /**
   * Create initial context for the first step (fallback for backward compatibility)
   */
  private createInitialContext(state: AgentState): RuntimeContext {
    const lastMessage = state.messages.at(-1);

    if (lastMessage?.role === 'user') {
      return {
        payload: {
          isFirstMessage: state.messages.length === 1,
          message: lastMessage,
        },
        phase: 'user_input',
        session: this.createSessionContext(state),
      };
    }

    return {
      payload: undefined,
      phase: 'init',
      session: this.createSessionContext(state),
    };
  }

  /** Create error state and events */
  private createErrorResult(
    state: AgentState,
    error: any,
  ): { events: AgentEvent[]; newState: AgentState } {
    const errorState = structuredClone(state);
    errorState.status = 'error';
    errorState.error = error;
    errorState.lastModified = new Date().toISOString();

    const errorEvent = { error, type: 'error' } as const;

    // Accumulate error event to state history
    errorState.events = [...errorState.events, errorEvent];

    return {
      events: [errorEvent],
      newState: errorState,
    };
  }
}
