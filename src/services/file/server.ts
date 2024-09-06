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
  async createFile(params: UploadFileParams, knowledgeBaseId?: string) {
    return lambdaClient.file.createFile.mutate({ ...params, knowledgeBaseId } as CreateFileParams);
  }

  async getFile(id: string): Promise<FileItem> {
    const item = await lambdaClient.file.findById.query({ id });

    if (!item) {
      throw new Error('file not found');
    }

    return { ...item, type: item.fileType };
  }

  async removeFile(id: string) {
    await lambdaClient.file.removeFile.mutate({ id });
  }

  async removeFiles(ids: string[]) {
    await lambdaClient.file.removeFiles.mutate({ ids });
  }

  async removeAllFiles() {
    await lambdaClient.file.removeAllFiles.mutate();
  }

  async getFiles(params: QueryFileListParams) {
    return lambdaClient.file.getFiles.query(params as QueryFileListSchemaType);
  }

  async getFileItem(id: string) {
    return lambdaClient.file.getFileItemById.query({ id });
  }

  async checkFileHash(hash: string) {
    return lambdaClient.file.checkFileHash.mutate({ hash });
  }

  async removeFileAsyncTask(id: string, type: 'embedding' | 'chunk') {
    return await lambdaClient.file.removeFileAsyncTask.mutate({ id, type });
  }
}
