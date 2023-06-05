import { ChatMessage, OpenAIRequestParams } from '@/types';

export const genChatMessages = ({
  systemRole,
  messages = [],
  message,
}: Partial<OpenAIRequestParams>): ChatMessage[] =>
  [
    systemRole ? { role: 'system', content: systemRole } : null,
    ...messages.filter((i) => i).map((m) => ({ role: m.role, content: m.content })),
    message ? { role: 'user', content: message } : null,
  ].filter(Boolean) as ChatMessage[];
