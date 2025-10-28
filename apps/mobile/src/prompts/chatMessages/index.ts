import { UIChatMessage } from '@lobechat/types';

const chatMessage = (message: UIChatMessage) => {
  return `<${message.role}>${message.content}</${message.role}>`;
};

export const chatHistoryPrompts = (messages: UIChatMessage[]) => {
  return `<chat_history>
${messages.map((m) => chatMessage(m)).join('\n')}
</chat_history>`;
};
