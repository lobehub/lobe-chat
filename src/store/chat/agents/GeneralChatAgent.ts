import {
  Agent,
  AgentInstruction,
  AgentRuntimeContext,
  AgentState,
  GeneralAgentCallLLMInstructionPayload,
  GeneralAgentCallLLMResultPayload,
  GeneralAgentCallToolResultPayload,
  GeneralAgentCallToolsBatchInstructionPayload,
  GeneralAgentCallingToolInstructionPayload,
  GeneralAgentConfig,
} from '@lobechat/agent-runtime';

/**
 * ChatAgent - The "Brain" of the chat agent
 *
 * This agent implements a simple but powerful decision loop:
 * 1. user_input → call_llm (with optional RAG/Search preprocessing)
 * 2. llm_result → check for tool_calls
 *    - If has tool_calls → call_tools_batch (parallel execution)
 *    - If no tool_calls → finish
 * 3. tools_batch_result → call_llm (process tool results)
 *
 * Note: RAG and Search workflow preprocessing are handled externally
 * before creating the agent runtime, keeping the agent logic simple.
 */
export class GeneralChatAgent implements Agent {
  private config: GeneralAgentConfig;

  constructor(config: GeneralAgentConfig) {
    this.config = config;
  }

  async runner(
    context: AgentRuntimeContext,
    state: AgentState,
  ): Promise<AgentInstruction | AgentInstruction[]> {
    switch (context.phase) {
      case 'init':
      case 'user_input': {
        // User input received, call LLM to generate response
        // At this point, messages may have been preprocessed with RAG/Search
        return {
          payload: {
            ...(context.payload as any),
            messages: state.messages,
          } as GeneralAgentCallLLMInstructionPayload,
          type: 'call_llm',
        };
      }

      case 'llm_result': {
        // LLM response received, check if it contains tool calls
        const { hasToolsCalling, toolsCalling, parentMessageId } =
          context.payload as GeneralAgentCallLLMResultPayload;

        if (hasToolsCalling && toolsCalling && toolsCalling.length > 0) {
          // No intervention needed, proceed with tool execution
          // Use batch execution for multiple tool calls to improve performance
          if (toolsCalling.length > 1) {
            return {
              payload: {
                parentMessageId,
                toolsCalling,
              } as GeneralAgentCallToolsBatchInstructionPayload,
              type: 'call_tools_batch',
            };
          } else if (toolsCalling.length === 1) {
            // Single tool executes directly
            return {
              payload: {
                parentMessageId,
                toolCalling: toolsCalling[0],
              } as GeneralAgentCallingToolInstructionPayload,
              type: 'call_tool',
            };
          }
        }

        // No tool calls, conversation is complete
        return {
          reason: 'completed',
          reasonDetail: 'LLM response completed without tool calls',
          type: 'finish',
        };
      }

      case 'tool_result': {
        const { parentMessageId } = context.payload as GeneralAgentCallToolResultPayload;

        return {
          payload: {
            messages: state.messages,
            model: this.config.modelRuntimeConfig?.model,
            parentMessageId,
            provider: this.config.modelRuntimeConfig?.provider,
            tools: state.tools,
          } as GeneralAgentCallLLMInstructionPayload,
          type: 'call_llm',
        };
      }

      case 'tools_batch_result': {
        const { parentMessageId } = context.payload as GeneralAgentCallToolResultPayload;
        return {
          payload: {
            messages: state.messages,
            model: this.config.modelRuntimeConfig?.model,
            parentMessageId,
            provider: this.config.modelRuntimeConfig?.provider,
            tools: state.tools,
          } as GeneralAgentCallLLMInstructionPayload,
          type: 'call_llm',
        };
      }

      case 'error': {
        // Error occurred, finish execution
        const { error } = context.payload as { error: any };
        return {
          reason: 'error_recovery',
          reasonDetail: error?.message || 'Unknown error occurred',
          type: 'finish',
        };
      }

      default: {
        // Unknown phase, finish execution
        return {
          reason: 'agent_decision',
          reasonDetail: `Unknown phase: ${context.phase}`,
          type: 'finish',
        };
      }
    }
  }
}
