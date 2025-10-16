import { AgentInstruction, AgentRuntimeContext, AgentState } from '@lobechat/agent-runtime';
import { ChatToolPayload, MessageToolCall } from '@lobechat/types';
import debug from 'debug';

const log = debug('lobe-server:agent-runtime:general-agent');

export interface ChatAgentConfig {
  agentConfig?: {
    [key: string]: any;
    maxSteps?: number;
  };
  modelRuntimeConfig?: {
    model: string;
    provider: string;
  };
  sessionId: string;
  userId?: string;
}

export interface GeneralAgentLLMResultPayload {
  hasToolsCalling: boolean;
  result: { content: string; tool_calls: MessageToolCall[] };
  toolsCalling: ChatToolPayload[];
}

export interface GeneralAgentToolResultPayload {
  data: any;
  executionTime: number;
  isSuccess: boolean;
  toolCall: ChatToolPayload;
  toolCallId: string;
}

export class GeneralAgent {
  private config: ChatAgentConfig;

  constructor(config: ChatAgentConfig) {
    this.config = config;
  }

  async runner(
    context: AgentRuntimeContext,
    state: AgentState,
  ): Promise<AgentInstruction | AgentInstruction[]> {
    log(`[${this.config.sessionId}] Processing phase: %s`, context.phase);

    switch (context.phase) {
      case 'user_input': {
        // call LLM
        return {
          payload: {
            messages: state.messages,
            model: this.config.modelRuntimeConfig?.model,
            provider: this.config.modelRuntimeConfig?.provider,
            tools: state.tools,
          },
          type: 'call_llm',
        };
      }

      case 'llm_result': {
        // LLM completed, determine next action based on tool calls
        const payload = context.payload as GeneralAgentLLMResultPayload;

        // Execute tools if present
        if (payload.hasToolsCalling) {
          // Use original tool_calls (MessageToolCall[]) instead of transformed toolsCalling
          const toolsCalling = payload.toolsCalling;

          // Return tool calling instructions
          // Use batch execution for multiple tool calls to improve performance
          if (toolsCalling.length > 1) {
            return {
              payload: toolsCalling as any,
              type: 'call_tools_batch',
            };
          } else if (toolsCalling.length === 1) {
            // Single tool executes directly
            return {
              payload: toolsCalling[0] as any,
              type: 'call_tool',
            };
          }
        }

        // Finish if no tools
        return {
          reason: 'completed',
          reasonDetail: 'General agent completed successfully',
          type: 'finish',
        };
      }

      case 'tool_result':
      case 'tools_batch_result': {
        // Continue calling LLM after tool execution completes
        return {
          payload: {
            messages: state.messages,
            model: this.config.modelRuntimeConfig?.model,
            provider: this.config.modelRuntimeConfig?.provider,
            tools: state.tools,
          },
          type: 'call_llm',
        };
      }

      default: {
        return {
          reason: 'error_recovery',
          reasonDetail: `Unknown phase: ${context.phase}`,
          type: 'finish',
        };
      }
    }
  }

  /**
   * Empty tools registry
   */
  tools = {};

  /**
   * Get configuration
   */
  getConfig() {
    return this.config;
  }
}
