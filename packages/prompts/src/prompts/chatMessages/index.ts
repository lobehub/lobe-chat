import { ChatMessage } from '@lobechat/types';

const chatMessage = (message: ChatMessage) => {
  return `<${message.role}>${message.content}</${message.role}>`;
};

export const chatHistoryPrompts = (messages: ChatMessage[]) => {
  return `<chat_history>
${messages.map((m) => chatMessage(m)).join('\n')}
</chat_history>`;
};

export const groupSupervisorPrompts = (messages: ChatMessage[]) => {
  const formatMessage = (message: ChatMessage) => {
    const author = message.role === 'user' ? 'user' : (message.agentId || 'assistant');
    const targetAttr = message.targetId ? ` target="${message.targetId}"` : '';
    return `<message author="${author}"${targetAttr}>${message.content}</message>`;
  };

  return messages.map((m) => formatMessage(m)).join('\n');
};

export const groupMemeberSpeakingPrompts = (messages: ChatMessage[]) => {
  return `<chat_group>
${messages.map((m) => chatMessage(m)).join('\n')}
</chat_group>`;
};

/**
 * Filters messages that an agent should see based on DM targeting rules
 * - Agent sees all group messages (no targetId)
 * - Agent sees DMs where they are the target
 * - Agent sees DMs they sent
 * - Agent sees user messages that are group messages or targeted to them
 */
export const filterMessagesForAgent = (messages: ChatMessage[], agentId: string): ChatMessage[] => {
  return messages.filter(message => {
    // Always include system messages
    if (message.role === 'system') {
      return true;
    }

    // For user messages, check DM targeting rules
    if (message.role === 'user') {
      // If no target specified, it's a group message - include it
      if (!message.targetId) {
        return true;
      }

      // If the message is targeted to this agent, include it
      if (message.targetId === agentId) {
        return true;
      }

      // Otherwise, it's a DM to another agent - exclude it
      return false;
    }

    // For assistant messages, check DM targeting rules
    if (message.role === 'assistant') {
      // If no target specified, it's a group message - include it
      if (!message.targetId) {
        return true;
      }

      // If the agent is the target of the DM, include it
      if (message.targetId === agentId) {
        return true;
      }

      // If the agent sent the message, include it
      if (message.agentId === agentId) {
        return true;
      }

      // Otherwise, it's a DM not involving this agent - exclude it
      return false;
    }

    // Default: include the message
    return true;
  });
};

/**
 * Consolidates group chat message history into a single formatted string
 * for use in system messages. Each message is formatted as "(AuthorName): content"
 */
export const consolidateGroupChatHistory = (messages: ChatMessage[], agents: { id: string; title: string }[] = []) => {
  if (messages.length === 0) return '';

  // Create a map for quick agent lookup
  const agentMap = new Map(agents.map(agent => [agent.id, agent.title]));

  const formatMessage = (message: ChatMessage) => {
    let authorName: string;

    if (message.role === 'user') {
      authorName = 'User';
    } else if (message.role === 'assistant' && message.agentId) {
      // Try to get agent title from the provided agents map
      authorName = agentMap.get(message.agentId) || `Agent ${message.agentId}`;
    } else {
      authorName = 'Assistant';
    }

    return `(${authorName}): ${message.content}`;
  };

  return messages
    .filter(m => m.content && m.content.trim()) // Filter out empty messages
    .map(formatMessage)
    .join('\n');
};
