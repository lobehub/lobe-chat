import type {
  Agent,
  AgentInstruction,
  AgentRuntimeContext,
  AgentState,
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
export class ChatAgent implements Agent {
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
            messages: state.messages,
            // Additional payload will be added by the executor
          },
          type: 'call_llm',
        };
      }

      case 'llm_result': {
        // LLM response received, check if it contains tool calls
        const { hasToolCalls, toolCalls } = context.payload as {
          hasToolCalls: boolean;
          toolCalls: any[];
        };

        if (hasToolCalls && toolCalls && toolCalls.length > 0) {
          // Execute all tool calls in parallel using call_tools_batch
          return {
            payload: toolCalls,
            type: 'call_tools_batch',
          };
        }

        // No tool calls, conversation is complete
        return {
          reason: 'completed',
          reasonDetail: 'LLM response completed without tool calls',
          type: 'finish',
        };
      }

      case 'tools_batch_result': {
        // All tools have been executed, call LLM again to process the results
        return {
          payload: {
            messages: state.messages,
          },
          type: 'call_llm',
        };
      }

      case 'tool_result': {
        // Single tool result (shouldn't happen with call_tools_batch, but handle it)
        // Call LLM to process the tool result
        return {
          payload: {
            messages: state.messages,
          },
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
