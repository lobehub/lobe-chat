import { MessageResponse } from '../types';

export function transformMessageToResponse(message: any): MessageResponse {
  return {
    ...message,
    files: message.messagesFiles?.map((messageFile: { file: any }) => messageFile.file) || [],
    messagesFiles: undefined,
  };
}
