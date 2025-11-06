/**
 * Mobile File Service
 * Copied from web's src/services/file/index.ts and adapted for mobile
 */
import { trpcClient } from '@/services/_auth/trpc';

interface CreateFileParams {
  fileType: string;
  hash: string;
  knowledgeBaseId?: string;
  metadata: any;
  name: string;
  size: number;
  url: string;
}

export class FileService {
  createFile = async (
    params: CreateFileParams,
    knowledgeBaseId?: string,
  ): Promise<{ id: string; url: string }> => {
    return trpcClient.file.createFile.mutate({ ...params, knowledgeBaseId });
  };

  checkFileHash = async (hash: string) => {
    return trpcClient.file.checkFileHash.mutate({ hash });
  };

  removeFile = async (id: string): Promise<void> => {
    await trpcClient.file.removeFile.mutate({ id });
  };

  removeFiles = async (ids: string[]): Promise<void> => {
    await trpcClient.file.removeFiles.mutate({ ids });
  };
}

export const fileService = new FileService();
