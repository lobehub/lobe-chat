import { ChatMessage, OpenAIRequestParams } from '@/types';

export const genChatMessages = ({
  systemRole,
  messages = [],
  message,
}: Partial<OpenAIRequestParams>): ChatMessage[] =>
  [
    systemRole ? { content: systemRole, role: 'system' } : null,
    ...messages.filter(Boolean).map((m) => ({ content: m.content, role: m.role })),
    message ? { content: message, role: 'user' } : null,
  ].filter(Boolean) as ChatMessage[];
