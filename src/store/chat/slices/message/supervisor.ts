import { groupSupervisorPrompts } from '@lobechat/prompts';

import { ChatGroupAgentItem } from '@/database/schemas/chatGroup';
import { groupChatPrompts } from '@/prompts/groupChat';
import { chatService } from '@/services/chat';
import { ChatMessage } from '@/types/message';

export interface SupervisorDecision {
  id: string; // agent ID who should respond
  target?: string; // target agent ID or "user" for DM, omit for group message
}

export type SupervisorDecisionList = SupervisorDecision[]; // Empty array = stop conversation

export interface SupervisorContext {
  availableAgents: ChatGroupAgentItem[];
  groupId: string;
  messages: ChatMessage[];
  model: string;
  provider: string;
  // Real user name for group member list
  systemPrompt?: string; 
  userName?: string; // Custom system prompt from group config
}

/**
 * Core supervisor class that decides who should speak next in group chat
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
      throw new Error(`Supervisor decision failed: ${error instanceof Error ? error.message : String(error)}`);
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

    await chatService.fetchPresetTaskResult({
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

    return res;
  }

  /**
   * Parse LLM response into decision
   */
  private parseDecision(
    response: string,
    availableAgents: ChatGroupAgentItem[],
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
          target: item.target || undefined,
        }));

      return decisions;
    } catch (error) {
      // Re-throw the error with more context so it can be caught and displayed to the user via toast
      throw new Error(`Failed to parse supervisor decision: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Fallback decision when supervisor fails
   */
  private getFallbackDecision(
    availableAgents: ChatGroupAgentItem[],
    messages: ChatMessage[],
  ): SupervisorDecisionList {
    // For group chat agents, we assume they are enabled by default
    // since they wouldn't be in the list if they weren't meant to participate
    const enabledAgents = availableAgents; // All agents are considered enabled

    if (enabledAgents.length === 0) {
      return [];
    }

    // Determine last speaker from messages to avoid consecutive responses
    const lastMessage = messages.at(-1);
    const lastSpeakerId = lastMessage?.role === 'user' ? 'user' : lastMessage?.agentId;

    // Avoid consecutive responses from same agent
    const eligibleAgents = enabledAgents.filter((agent) => agent.id !== lastSpeakerId);

    const candidateAgents = eligibleAgents.length > 0 ? eligibleAgents : enabledAgents;

    // Select first agent as fallback (could be randomized)
    return [{ id: candidateAgents[0].id || 'unknown' }];
  }

  /**
   * Quick validation of decision against group rules
   */
  validateDecision(decisions: SupervisorDecisionList, context: SupervisorContext): boolean {
    const { availableAgents } = context;

    // Empty array is always valid (means stop)
    if (decisions.length === 0) return true;

    // Check each decision
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
