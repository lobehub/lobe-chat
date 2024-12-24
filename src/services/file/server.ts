import { lambdaClient } from '@/libs/trpc/client';
import {
  FileItem,
  QueryFileListParams,
  QueryFileListSchemaType,
  UploadFileParams,
} from '@/types/files';

import { IFileService } from './type';

interface CreateFileParams extends Omit<UploadFileParams, 'url'> {
  knowledgeBaseId?: string;
  url: string;
}

export class ServerService implements IFileService {
  createFile = async (params: UploadFileParams, knowledgeBaseId?: string) => {
    return lambdaClient.file.createFile.mutate({
      ...params,
      knowledgeBaseId,
    } as CreateFileParams);
  };

  getFile = async (id: string): Promise<FileItem> => {
    const item = await lambdaClient.file.findById.query({ id });

    if (!item) {
      throw new Error('file not found');
    }

    return { ...item, type: item.fileType };
  };

  removeFile = async (id: string) => {
    await lambdaClient.file.removeFile.mutate({ id });
  };

  removeFiles = async (ids: string[]) => {
    await lambdaClient.file.removeFiles.mutate({ ids });
  };

  removeAllFiles = async () => {
    await lambdaClient.file.removeAllFiles.mutate();
  };

  getFiles = async (params: QueryFileListParams) => {
    return lambdaClient.file.getFiles.query(params as QueryFileListSchemaType);
  };

  getFileItem = async (id: string) => {
    return lambdaClient.file.getFileItemById.query({ id });
  };

  checkFileHash = async (hash: string) => {
    return lambdaClient.file.checkFileHash.mutate({ hash });
  };

  removeFileAsyncTask = async (id: string, type: 'embedding' | 'chunk') => {
    return lambdaClient.file.removeFileAsyncTask.mutate({
      id,
      type,
    });
  };
}
