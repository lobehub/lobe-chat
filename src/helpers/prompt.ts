import { ChatMessage } from '@lobehub/ui';
import {
  AIMessagePromptTemplate,
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';

export const getChatPromptTemplate = (chatMessages: ChatMessage[]) =>
  ChatPromptTemplate.fromPromptMessages(
    chatMessages.map((m) => {
      switch (m.role) {
        default:
        case 'user':
          return HumanMessagePromptTemplate.fromTemplate(m.content);

        case 'system':
          return SystemMessagePromptTemplate.fromTemplate(m.content);

        case 'assistant':
          return AIMessagePromptTemplate.fromTemplate(m.content);
      }
    }),
  );
export const getInputVariablesFromMessages = (chatMessages: ChatMessage[]) => {
  let inputVariables: string[] = [];
  try {
    const chatPrompt = getChatPromptTemplate(chatMessages);
    inputVariables = chatPrompt.inputVariables;
  } catch {}

  return inputVariables;
};
