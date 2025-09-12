import { ChatMessage } from '@/types/message';

export interface GroupMemberInfo {
  id: string;
  title: string;
}

const buildGroupMembersTag = (members: GroupMemberInfo[]): string => {
  if (!members || members.length === 0) return '';
  return `<group_members>\n${JSON.stringify(members, null, 2)}\n</group_members>`;
};

const buildChatHistoryAuthorTag = (messages: ChatMessage[], members: GroupMemberInfo[]): string => {
  if (!messages || messages.length === 0) return '';

  const idToTitle = new Map(members.map((m) => [m.id, m.title]));

  const authorLines = messages
    .map((message, index) => {
      let author: string;
      if (message.role === 'user') {
        author = idToTitle.get('user') || 'User';
      } else if (message.agentId) {
        author = idToTitle.get(message.agentId) || 'Assistant';
      } else {
        author = 'Assistant';
      }
      return `${index + 1}: ${author}`;
    })
    .join('\n');

  return `<chat_history_author>\n${authorLines}\n</chat_history_author>`;
};

export const buildGroupChatSystemPrompt = ({
  baseSystemRole = '',
  agentId,
  groupMembers,
  messages,
}: {
  agentId: string;
  baseSystemRole?: string;
  groupMembers: GroupMemberInfo[];
  messages: ChatMessage[];
}): string => {
  const membersTag = buildGroupMembersTag(groupMembers);
  const historyTag = buildChatHistoryAuthorTag(messages, groupMembers);

  const agentTitle = groupMembers.find((m) => m.id === agentId)?.title || 'Agent';

  const prompt = `${baseSystemRole}
You are participating in a group chat in real world.

Guidelines:
- Stay in character as ${agentId} (${agentTitle})
- Be concise and natural, behave like a real person
- Engage naturally in the conversation flow
- The group supervisor will decide whether to send it privately or publicly, so you just need to say the actuall content, even it's a DM to a specific member. Do not pretend you've sent it.
- Be collaborative and build upon others' responses when appropriate
- Keep your responses concise and relevant to the ongoing discussion
- Each message should no more than 100 words

${membersTag}

${historyTag}
`;

  return prompt.trim();
};

export interface SupervisorPromptParams {
  availableAgents: Array<{ id: string; title?: string | null }>;
  conversationHistory: string;
  systemPrompt?: string;
  userName?: string;
}

export const buildSupervisorPrompt = ({
  availableAgents,
  conversationHistory,
  systemPrompt,
  userName,
}: SupervisorPromptParams): string => {
  const members = [
    {
      id: 'user',
      name: userName || 'User',
      role: 'Human participant',
    },
    // Then include all agents
    ...availableAgents.map((agent) => ({
      id: agent.id,
      name: agent.title || agent.id,
      role: 'AI Agent',
    })),
  ];

  const memberList = members
    .map((member) => `  <member id="${member.id}" name="${member.name}" />`)
    .join('\n');

  const prompt = `
You are a conversation supervisor for a group chat with multiple AI agents. Your role is to decide which agents should respond next based on the conversation context. Here's the group detail:

<group_role>
${systemPrompt || ''}
</group_role>

<group_members>
${memberList}
</group_members>

<conversation_history>
${conversationHistory}
</conversation_history>

Rules:
- Return an array of objects where each object has an "id" field for the agent who should respond
- If a response should be a direct message to a specific member, include a "target" field with the target member ID or "user"
- If no "target" field is provided, the response will be a group message visible to everyone
- You can optionally include an "instruction" field to give specific guidance to the agent about what they should focus on or how they should respond
- If the conversation seems complete, or no one needs reply, return empty array []
- Your goal is to make the conversation as natural as possible. For example, if user DM to an agent, the agent is likely to respond to the user privately too
- Return ONLY a JSON array of objects, nothing else

Examples: 
- Group responses: [{"id": "agt_01"}]
- With instructions: [{"id": "agt_01", "instruction": "Outline the main points from the article"}]
- DM responses: [{"id": "agt_01", "target": "agt_02"}, {"id": "agt_04", "target": "user"}]
- Mixed responses: [{"id": "agt_01"}, {"id": "agt_02", "target": "user", "instruction": "Provide a summary"}]
- Stop conversation: []

Now return an array of objects where each object has an "id" field for the agent who should respond.
`;

  return prompt.trim();
};

/**
 * Build the prompt for agents to respond in group chat context
 * This is the most impressive prompt since it's the last message
 */
export const buildAgentResponsePrompt = ({
  targetId,
  instruction,
}: {
  instruction?: string;
  targetId?: string;
}): string => {
  const targetText = targetId ? targetId : 'the group publicly';
  const instructionText = instruction ? `\n\nSupervisor instruction: ${instruction}` : '';

  return `Now it's your turn to respond. You are sending message to ${targetText}. Please respond as this agent would, considering the full conversation history provided above.${instructionText} Directly return the message content, no other text. You do not need add author name or anything else.`;
};

export const groupChatPrompts = {
  buildAgentResponsePrompt,
  buildGroupChatSystemPrompt,
  buildSupervisorPrompt,
};

export const filterMessagesForAgent = (messages: ChatMessage[], agentId: string): ChatMessage[] => {
  return messages
    .filter((message) => {
      // Exclude supervisor messages (messages with agentId="supervisor")
      if (message.agentId === 'supervisor') {
        return false;
      }
      return true;
    })
    .map((message) => {
      // Always include system messages as-is
      if (message.role === 'system') {
        return message;
      }

      // For user messages, check DM targeting rules
      if (message.role === 'user') {
        // If no target specified, it's a group message - include it as-is
        if (!message.targetId) {
          return message;
        }

        // If the message is targeted to this agent, include it as-is
        if (message.targetId === agentId) {
          return message;
        }

        // Otherwise, it's a DM to another agent - replace content with "***"
        return {
          ...message,
          content: '***',
        };
      }

      // For assistant messages, check DM targeting rules
      if (message.role === 'assistant') {
        // If no target specified, it's a group message - include it as-is
        if (!message.targetId) {
          return message;
        }

        // If the agent is the target of the DM, include it as-is
        if (message.targetId === agentId) {
          return message;
        }

        // If the agent sent the message, include it as-is
        if (message.agentId === agentId) {
          return message;
        }

        // Otherwise, it's a DM not involving this agent - replace content with "***"
        return {
          ...message,
          content: '***',
        };
      }

      // Default: include the message as-is
      return message;
    });
};
