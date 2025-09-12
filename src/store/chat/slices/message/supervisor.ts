import { groupSupervisorPrompts } from '@lobechat/prompts';

import { groupChatPrompts } from '@/prompts/groupChat';
import { chatService } from '@/services/chat';
import { ChatMessage } from '@/types/message';
import { GroupMemberWithAgent } from '@/types/session';

export interface SupervisorDecision {
  id: string;
  // target agent ID or "user" for DM, omit for group message
  instruction?: string;
  // agent ID who should respond
  target?: string; // optional instruction from supervisor to the agent
}

export type SupervisorDecisionList = SupervisorDecision[]; // Empty array = stop conversation

export interface SupervisorContext {
  abortController?: AbortController;
  availableAgents: GroupMemberWithAgent[];
  groupId: string;
  messages: ChatMessage[];
  model: string;
  provider: string;
  systemPrompt?: string;
  userName?: string;
}

/**
 * Core supervisor runtime that orchestrates the conversation between agents in group chat
 */
export class GroupChatSupervisor {
  /**
   * Make decision on who should speak next
   */
  async makeDecision(context: SupervisorContext): Promise<SupervisorDecisionList> {
    const { messages, availableAgents, userName, systemPrompt } = context;

    // If no agents available, stop conversation
    if (availableAgents.length === 0) {
      return [];
    }

    try {
      // Create supervisor prompt with conversation context
      const conversationHistory = groupSupervisorPrompts(messages);

      const supervisorPrompt = groupChatPrompts.buildSupervisorPrompt({
        availableAgents: availableAgents
          .filter((agent) => agent.id)
          .map((agent) => ({ id: agent.id!, title: agent.title })),
        conversationHistory,
        systemPrompt,
        userName,
      });

      const response = await this.callLLMForDecision(supervisorPrompt, context);

      const decision = this.parseDecision(response, availableAgents);

      return decision;
    } catch (error) {
      // Re-throw the error so it can be caught and displayed to the user via toast
      throw new Error(
        `Supervisor decision failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Call LLM service to get supervisor decision
   */
  private async callLLMForDecision(prompt: string, context: SupervisorContext): Promise<string> {
    const supervisorConfig = {
      model: context.model,
      provider: context.provider,
      temperature: 0.3,
    };

    let res = '';
    let error: Error | null = null;

    await chatService.fetchPresetTaskResult({
      abortController: context.abortController,
      onError: (err) => {
        console.error('Supervisor LLM error:', err);
        error = err;
      },
      onFinish: async (content) => {
        console.log('Supervisor LLM response:', content);
        res = content.trim();
      },
      onLoadingChange: (loading) => {
        // Optional: Could emit loading state if needed for UI feedback
        console.log('Supervisor LLM loading state:', loading);
      },
      params: {
        messages: [{ content: prompt, role: 'user' }],
        stream: false,
        ...supervisorConfig,
      },
    });

    // If there was an error, throw it to be caught by the caller
    if (error) {
      throw error;
    }

    return res;
  }

  /**
   * Parse LLM response into decision
   */
  private parseDecision(
    response: string,
    availableAgents: GroupMemberWithAgent[],
  ): SupervisorDecisionList {
    try {
      // Extract JSON array from response by locating the first '[' and the last ']'
      const startIndex = response.indexOf('[');
      const endIndex = response.lastIndexOf(']');
      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        throw new Error('No JSON array found in response');
      }
      const jsonText = response.slice(startIndex, endIndex + 1);

      const parsedResponse = JSON.parse(jsonText);

      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response must be an array');
      }

      // Empty array = stop conversation
      if (parsedResponse.length === 0) {
        return [];
      }

      // Filter and validate the response objects
      const decisions = parsedResponse
        .filter(
          (item: any) =>
            typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'string' &&
            availableAgents.some((agent) => agent.id === item.id),
        )
        .map((item: any) => ({
          id: item.id,
          instruction: item.instruction || undefined,
          target: item.target || undefined,
        }));

      return decisions;
    } catch (error) {
      // Re-throw the error with more context so it can be caught and displayed to the user via toast
      throw new Error(
        `Failed to parse supervisor decision: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Quick validation of decision against group rules
   */
  validateDecision(decisions: SupervisorDecisionList, context: SupervisorContext): boolean {
    const { availableAgents } = context;

    // Empty array is always valid (means stop)
    if (decisions.length === 0) return true;

    return decisions.every((decision) => {
      // Validate speaker exists
      const speakerExists = availableAgents.some((agent) => agent.id === decision.id);
      if (!speakerExists) return false;

      // Validate target exists if specified
      if (decision.target) {
        return (
          decision.target === 'user' ||
          availableAgents.some((agent) => agent.id === decision.target)
        );
      }

      return true;
    });
  }
}
