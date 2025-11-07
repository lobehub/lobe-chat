import { lambdaClient } from '@/libs/trpc/client';
import {
  BatchDownloadEventType,
  CheckFileHashResult,
  FileItem,
  QueryFileListParams,
  QueryFileListSchemaType,
  UploadFileParams,
} from '@/types/files';
import { TRPCClientError } from '@trpc/client';
import { LambdaRouter } from '@/server/routers/lambda';
import { Unsubscribable } from '@trpc/server/observable';

interface CreateFileParams extends Omit<UploadFileParams, 'url'> {
  knowledgeBaseId?: string;
  url: string;
}

export type TrpcSubscriptionCallback = {
  onComplete?: () => void;
  onData?: (data: BatchDownloadEventType) => void;
  onError?: (err: TRPCClientError<LambdaRouter>) => void;
};

export class FileService {
  batchDownload = (fileIds: string[], callbacks: TrpcSubscriptionCallback): Unsubscribable => {
    return lambdaClient.file.batchDownload.subscribe({ fileIds }, callbacks);
  };

  createFile = async (
    params: UploadFileParams,
    knowledgeBaseId?: string,
  ): Promise<{ id: string; url: string }> => {
    return lambdaClient.file.createFile.mutate({ ...params, knowledgeBaseId } as CreateFileParams);
  };

  getFile = async (id: string): Promise<FileItem> => {
    const item = await lambdaClient.file.findById.query({ id });

    if (!item) {
      throw new Error('file not found');
    }

    return { ...item, type: item.fileType };
  };

  removeFile = async (id: string): Promise<void> => {
    await lambdaClient.file.removeFile.mutate({ id });
  };

  removeFiles = async (ids: string[]): Promise<void> => {
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

  checkFileHash = async (hash: string): Promise<CheckFileHashResult> => {
    return lambdaClient.file.checkFileHash.mutate({ hash });
  };

  removeFileAsyncTask = async (id: string, type: 'embedding' | 'chunk') => {
    return lambdaClient.file.removeFileAsyncTask.mutate({ id, type });
  };
}

export const fileService = new FileService();
