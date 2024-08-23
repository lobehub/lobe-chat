import urlJoin from 'url-join';

import { fileEnv } from '@/config/file';
import { lambdaClient } from '@/libs/trpc/client';
import {
  FilePreview,
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

  /**
   * @deprecated
   * @param id
   */
  async getFile(id: string): Promise<FilePreview> {
    if (!fileEnv.NEXT_PUBLIC_S3_DOMAIN) {
      throw new Error('fileEnv.NEXT_PUBLIC_S3_DOMAIN is not set while enable server upload');
    }

    const item = await lambdaClient.file.findById.query({ id });

    if (!item) {
      throw new Error('file not found');
    }

    return {
      fileType: item.fileType,
      id: item.id,
      name: item.name,
      saveMode: 'url',
      url: urlJoin(fileEnv.NEXT_PUBLIC_S3_DOMAIN!, item.url!),
    };
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
}
