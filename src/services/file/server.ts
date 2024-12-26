import { lambdaClient } from '@/libs/trpc/client';
import { QueryFileListParams, QueryFileListSchemaType, UploadFileParams } from '@/types/files';

import { IFileService } from './type';

interface CreateFileParams extends Omit<UploadFileParams, 'url'> {
  knowledgeBaseId?: string;
  url: string;
}

export class ServerService implements IFileService {
  createFile: IFileService['createFile'] = async (params, knowledgeBaseId) => {
    return lambdaClient.file.createFile.mutate({ ...params, knowledgeBaseId } as CreateFileParams);
  };

  getFile: IFileService['getFile'] = async (id) => {
    const item = await lambdaClient.file.findById.query({ id });

    if (!item) {
      throw new Error('file not found');
    }

    return { ...item, type: item.fileType };
  };

  removeFile: IFileService['removeFile'] = async (id) => {
    await lambdaClient.file.removeFile.mutate({ id });
  };

  removeFiles: IFileService['removeFiles'] = async (ids) => {
    await lambdaClient.file.removeFiles.mutate({ ids });
  };

  removeAllFiles: IFileService['removeAllFiles'] = async () => {
    await lambdaClient.file.removeAllFiles.mutate();
  };

  getFiles = async (params: QueryFileListParams) => {
    return lambdaClient.file.getFiles.query(params as QueryFileListSchemaType);
  };

  getFileItem = async (id: string) => {
    return lambdaClient.file.getFileItemById.query({ id });
  };

  checkFileHash: IFileService['checkFileHash'] = async (hash) => {
    return lambdaClient.file.checkFileHash.mutate({ hash });
  };

  removeFileAsyncTask = async (id: string, type: 'embedding' | 'chunk') => {
    return lambdaClient.file.removeFileAsyncTask.mutate({ id, type });
  };
}
