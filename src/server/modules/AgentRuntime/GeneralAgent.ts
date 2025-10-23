import {
  AgentInstruction,
  AgentRuntimeContext,
  AgentState,
  InterventionChecker,
} from '@lobechat/agent-runtime';
import {
  BuiltinToolManifest,
  ChatToolPayload,
  HumanInterventionPolicy,
  MessageToolCall,
} from '@lobechat/types';
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
          const toolsCalling = payload.toolsCalling;

          // Check intervention for all tool calls
          const toolsNeedingApproval: ChatToolPayload[] = [];

          for (const toolCall of toolsCalling) {
            const manifest = state.toolManifestMap[toolCall.identifier];
            const policy = this.checkToolIntervention(toolCall, manifest);

            // For now, only handle 'always' policy (skip 'first' and 'never')
            if (policy === 'always') {
              toolsNeedingApproval.push(toolCall);
            }
          }

          // If any tools need approval, request human intervention
          if (toolsNeedingApproval.length > 0) {
            log(
              `[${this.config.sessionId}] Tools requiring approval: %o`,
              toolsNeedingApproval.map((t) => `${t.identifier}/${t.apiName}`),
            );

            return {
              pendingToolsCalling: toolsNeedingApproval as any,
              reason: 'Tools require human approval',
              type: 'request_human_approve',
            };
          }

          // No intervention needed, proceed with tool execution
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
   * Check if a tool call requires human intervention
   * @param toolCall - Tool call to check
   * @param manifest - Tool manifest containing intervention config
   * @returns Intervention policy to apply
   */
  private checkToolIntervention(
    toolCall: ChatToolPayload,
    manifest: BuiltinToolManifest | undefined,
  ): HumanInterventionPolicy {
    // No manifest means no intervention config
    if (!manifest) {
      log(`[${this.config.sessionId}] No manifest found for tool: ${toolCall.identifier}`);
      return 'never';
    }

    // First, try to get API-level intervention config
    const api = manifest.api.find((a) => a.name === toolCall.apiName);
    const apiLevelConfig = api?.humanIntervention;

    // If API has its own intervention config, use it
    if (apiLevelConfig) {
      // Parse tool arguments
      let toolArgs: Record<string, any> = {};
      try {
        toolArgs = JSON.parse(toolCall.arguments);
      } catch (error) {
        log(
          `[${this.config.sessionId}] Failed to parse tool arguments for ${toolCall.identifier}/${toolCall.apiName}: %o`,
          error,
        );
      }

      // Check intervention using InterventionChecker
      const policy = InterventionChecker.shouldIntervene({
        config: apiLevelConfig,
        toolArgs,
        // TODO: Add confirmedHistory support when implementing 'first' policy
        // confirmedHistory: state.metadata?.confirmedToolCalls || [],
        // toolKey: InterventionChecker.generateToolKey(toolCall.identifier, toolCall.apiName),
      });

      log(
        `[${this.config.sessionId}] API-level intervention check for ${toolCall.identifier}/${toolCall.apiName}: %s`,
        policy,
      );

      return policy;
    }

    // Otherwise, use tool-level default intervention policy
    const toolLevelPolicy = manifest.humanIntervention || 'never';

    log(
      `[${this.config.sessionId}] Tool-level intervention check for ${toolCall.identifier}/${toolCall.apiName}: %s`,
      toolLevelPolicy,
    );

    return toolLevelPolicy;
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
