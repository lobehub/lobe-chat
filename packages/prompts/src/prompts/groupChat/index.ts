import { ChatMessage } from '@/types/index';

export interface GroupMemberInfo {
  id: string;
  title: string;
}

export interface SupervisorTodoItem {
  assignee?: string;
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

  const guidelines = [
    `Stay in character as ${agentId}`,
    'Be concise and natural, behave like a real person',
    'Engage naturally in the conversation flow',
    "The group supervisor will decide whether to send it privately or publicly, so you just need to say the actuall content, even it's a DM to a specific member. Do not pretend you've sent it.",
    "Be collaborative and build upon others' responses when appropriate",
    'Keep your responses concise and relevant to the ongoing discussion',
  ];

  const guidelinesSection = ['Guidelines:', '', ...guidelines.map((line) => `- ${line}`)].join(
    '\n',
  );

  const sections = [
    baseSystemRole,
    `You are participating in a group chat in real world as ${agentId} (${agentTitle}).`,
    guidelinesSection,
  ];

  if (membersTag) sections.push(membersTag);
  if (historyTag) sections.push(historyTag);

  return sections.filter(Boolean).join('\n\n').trim();
};

export interface SupervisorPromptParams {
  allowDM?: boolean;
  availableAgents: Array<{ id: string; title?: string | null }>;
  conversationHistory: string;
  scene?: 'casual' | 'productive';
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
  scene = 'productive',
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
      role: 'user',
    },
    // Then include all agents
    ...availableAgents.map((agent) => ({
      id: agent.id,
      name: agent.title || agent.id,
      role: 'assistant',
    })),
  ];

  const memberList = members
    .map((member) => `  <member id="${member.id}" name="${member.name}" />`)
    .join('\n');

  const todoListTag = scene === 'productive' ? buildTodoListTag(todoList) : '';

  // Build tool list text based on scene and allowDM
  const toolLines: string[] = [
    // trigger_agent (public)
    '  - "trigger_agent": ask an agent to speak publicly to the group. Parameter must be {"id": "agentId"} with optional "instruction"',
    // trigger_agent_dm (DM)
    ...(allowDM
      ? [
          '  - "trigger_agent_dm": ask an agent to send a private DM. Parameter must be {"id": "agentId", "target": "recipientId|user"} with optional "instruction"',
        ]
      : []),
    // TODO tools only in productive scene
    ...(scene === 'productive'
      ? [
          '  - "create_todo": add a new todo. Parameter can be a string or an object like {"content": "...", "assignee": "agentId"}. Only set "assignee" when a specific agent should own the task; otherwise omit it. Always create actionable, brief todos.',
          '  - "finish_todo": mark todos as completed. Use {"index": 0} for a specific position.',
        ]
      : []),
  ];

  const availableToolsText = toolLines.join('\n');

  // Build rules and examples for DM usage
  const dmRules = allowDM
    ? `- To send a private message, use "trigger_agent_dm" and set "target" to the recipient agent id or "user".
- Use public messages by default; choose DM only when the message MUST be private.`
    : '';

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
${availableToolsText}
- Execute tools in the order they should happen. Return [] when no further action is needed or it's waiting for user feedback.

WHEN ASKING AGENTS TO SPEAK:

- Only reference agents from the member list. Never invent new IDs.
- Provide concise English instructions when guiding agents via "instruction".
- Be concise and to the point. Each instruction should no longer than 10 words. Always use English.
${dmRules}

${
  scene === 'productive'
    ? `WHEN GENERATING TODOS:

- Break down the main objective into logical, sequential todos
- Be concise and to the point. Each todo should no longer than 10 words. Do not create more than 5 todos.
- Match user's message language.
- Keep todo items synchronized with the context. Finish or create todos as progress changes.`
    : ''
}

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
  const instructionText = instruction ? `SUPERVISOR INSTRUCTION: ${instruction}` : '';

  return `
  ${instructionText}

  Now it's your turn to respond. You are sending message to ${targetText}. Please respond as this agent would, considering the full conversation history provided above. Directly return the message content, no other text. You do not need add author name or anything else.`.trim();
};

export const groupChatPrompts = {
  buildAgentResponsePrompt,
  buildGroupChatSystemPrompt,
  buildSupervisorPrompt,
};
