import { FUNCTION_MESSAGE_FLAG } from '@/const/message';

export const isFunctionMessage = (content: string) => {
  return content.startsWith(FUNCTION_MESSAGE_FLAG);
};
