import urlJoin from 'url-join';

import { fileEnv } from '@/config/file';
import { lambdaClient } from '@/libs/trpc/client';
import { FilePreview, UploadFileParams } from '@/types/files';

import { IFileService } from './type';

interface CreateFileParams extends Omit<UploadFileParams, 'url'> {
  url: string;
}

export class ServerService implements IFileService {
  async createFile(params: UploadFileParams) {
    return lambdaClient.file.createFile.mutate(params as CreateFileParams);
  }

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

  async removeAllFiles() {
    await lambdaClient.file.removeAllFiles.mutate();
  }
}
