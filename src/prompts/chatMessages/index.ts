import { ChatMessage } from '@/types/message';

const chatMessage = (message: ChatMessage) => {
  return `<${message.role}>${message.content}</${message.role}>`;
};

export const chatHistoryPrompts = (messages: ChatMessage[]) => {
  return `<chat_history>
${messages.map((m) => chatMessage(m)).join('\n')}
</chat_history>`;
};
