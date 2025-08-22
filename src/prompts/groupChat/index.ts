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
- Your message is automatically sent privately or publicly to the group, so you don't need to mention it, just respond as you would in a real conversation
- Be collaborative and build upon others' responses when appropriate
- Keep your responses concise and relevant to the ongoing discussion
- Each message should no more than 100 words
- Do not include the <author_name_do_not_include_in_your_response> tag content in your response

${membersTag}

${historyTag}
`;

    return prompt.trim();
};

export const groupChatPrompts = {
    buildGroupChatSystemPrompt,
};

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