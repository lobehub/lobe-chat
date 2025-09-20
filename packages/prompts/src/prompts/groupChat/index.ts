import { ChatMessage } from '@/types/index';

export interface GroupMemberInfo {
  id: string;
  title: string;
}

export interface SupervisorTodoItem {
  content: string;
  finished: boolean;
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
You are participating in a group chat in real world as ${agentId} (${agentTitle}).

RULES:

- Be concise and natural, behave like a real person
- Engage naturally in the conversation flow
- The group supervisor will decide whether to send it privately or publicly, so you just need to say the actuall content, even it's a DM to a specific member. Do not pretend you've sent it.
- Be collaborative and build upon others' responses when appropriate
- Keep your responses concise and relevant to the ongoing discussion

${membersTag}

${historyTag}
`;

  return prompt.trim();
};

export interface SupervisorPromptParams {
  allowDM?: boolean;
  availableAgents: Array<{ id: string; title?: string | null }>;
  conversationHistory: string;
  systemPrompt?: string;
  todoList?: SupervisorTodoItem[];
  userName?: string;
}

const buildTodoListTag = (todoList?: SupervisorTodoItem[]): string => {
  const serialized = JSON.stringify(todoList && todoList.length > 0 ? todoList : [], null, 2);
  return `<todo_list>\n${serialized}\n</todo_list>`;
};

export const buildSupervisorPrompt = ({
  allowDM = true,
  availableAgents,
  conversationHistory,
  todoList,
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

  const todoListTag = buildTodoListTag(todoList);

  // Build rules and examples based on allowDM setting
  const dmRules = allowDM
    ? `- Direct messages are allowed. When an agent should DM someone, set "target" to the recipient agent id or "user".
- If no "target" is provided, the message will be sent to the whole group.`
    : `- DMs are disabled. Do not provide a "target" field; all messages are public.`;

  const naturalFlowRule = allowDM
    ? `- Keep the conversation natural. If a member DM'd someone, consider replying privately to the same participant when appropriate.`
    : `- Keep the conversation natural in the group setting.`;

  const triggerAgentExample = allowDM
    ? '{"tool_name": "trigger_agent", "parameter": {"id": "agt_01", "target": "user", "instruction": "Thank them privately for the update"}}'
    : '{"tool_name": "trigger_agent", "parameter": {"id": "agt_01", "instruction": "Summarize the main points for everyone"}}';

  const exampleArray = allowDM
    ? `[
  {"tool_name": "create_todo", "parameter": {"content": "Summarize outcomes before the meeting ends"}},
  {"tool_name": "finish_todo", "parameter": {"content": "Review agenda"}},
  ${triggerAgentExample}
]`
    : `[
  {"tool_name": "create_todo", "parameter": "Share the highlights with the team"},
  ${triggerAgentExample}
]`;

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

${todoListTag}

RULES:

- You MUST respond with a JSON array. Each item represents invoking one of the available tools below.
- Available tools:
  - "create_todo": add a new todo. Parameter can be a string or an object like {"content": "..."}. Always create actionable, brief todos.
  - "finish_todo": mark todos as completed. Use true to finish the next unfinished item, {"index": 0} for a specific position, or {"content": "..."} to match by text. Use {"all": true} to close everything.
  - "trigger_agent": ask an agent to speak. Parameter must be {"id": "agentId"} with optional "instruction" and optional "target".
- Execute tools in the order they should happen. Return [] when no further action is needed.
- Stop the conversation by returning [] (an empty array).
- ${dmRules}
- ${naturalFlowRule}

WHEN ASKING AGENTS TO SPEAK:

- Only reference agents from the member list. Never invent new IDs.
- Provide concise English instructions when guiding agents via "instruction".
- Be concise and to the point. Each instruction should no longer than 10 words.
- Always use English.

WHEN GENERATING TODOS:

- Break down the main objective into logical, sequential todos
- Be concise and to the point. Each todo should no longer than 10 words.
- Match user's language.
- Keep todo items synchronized with the context. Finish or create todos as progress changes.

Now share your decision.
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
