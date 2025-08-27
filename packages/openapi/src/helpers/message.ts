import { MessageResponse } from '../types';
import { addFilesUrlPrefix } from './file';

export function transformMessageToResponse(message: any): MessageResponse {
  return {
    ...message,
    files: addFilesUrlPrefix(
      message.filesToMessages?.map((messageFile: { file: any }) => messageFile.file) || [],
    ),
    filesToMessages: undefined,
  };
}
