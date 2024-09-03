import { t } from 'i18next';
import { sha256 } from 'js-sha256';
import { StateCreator } from 'zustand/vanilla';

import { message } from '@/components/AntdStaticMethods';
import { isServerMode } from '@/const/version';
import { fileService } from '@/services/file';
import { ServerService } from '@/services/file/server';
import { uploadService } from '@/services/upload';
import { FileMetadata, UploadFileItem } from '@/types/files';

import { FileStore } from '../../store';

const serverFileService = new ServerService();

interface UploadWithProgressParams {
  file: File;
  knowledgeBaseId?: string;
  onStatusUpdate?: (
    data:
      | {
          id: string;
          type: 'updateFile';
          value: Partial<UploadFileItem>;
        }
      | {
          id: string;
          type: 'removeFile';
        },
  ) => void;
}

interface UploadWithProgressResult {
  id: string;
  url: string;
}

export interface FileUploadAction {
  internal_uploadToClientDB: (
    params: Omit<UploadWithProgressParams, 'knowledgeBaseId'>,
  ) => Promise<UploadWithProgressResult | undefined>;
  internal_uploadToServer: (params: UploadWithProgressParams) => Promise<UploadWithProgressResult>;
  uploadWithProgress: (
    params: UploadWithProgressParams,
  ) => Promise<UploadWithProgressResult | undefined>;
}

export const createFileUploadSlice: StateCreator<
  FileStore,
  [['zustand/devtools', never]],
  [],
  FileUploadAction
> = (set, get) => ({
  internal_uploadToClientDB: async ({ file, onStatusUpdate }) => {
    if (!file.type.startsWith('image')) {
      onStatusUpdate?.({ id: file.name, type: 'removeFile' });
      message.info({
        content: t('upload.fileOnlySupportInServerMode', {
          ext: file.name.split('.').pop(),
          ns: 'error',
        }),
        duration: 5,
      });
      return;
    }

    const fileArrayBuffer = await file.arrayBuffer();

    const hash = sha256(fileArrayBuffer);

    const data = await uploadService.uploadToClientDB(
      { fileType: file.type, hash, name: file.name, saveMode: 'local', size: file.size },
      file,
    );

    onStatusUpdate?.({
      id: file.name,
      type: 'updateFile',
      value: {
        fileUrl: data.url,
        id: data.id,
        status: 'success',
        uploadState: { progress: 100, restTime: 0, speed: 0 },
      },
    });

    return data;
  },

  internal_uploadToServer: async ({ file, onStatusUpdate, knowledgeBaseId }) => {
    const fileArrayBuffer = await file.arrayBuffer();

    // 1. check file hash
    const hash = sha256(fileArrayBuffer);

    const checkStatus = await serverFileService.checkFileHash(hash);
    let metadata: FileMetadata;

    // 2. if file exist, just skip upload
    if (checkStatus.isExist) {
      metadata = checkStatus.metadata as FileMetadata;
      onStatusUpdate?.({
        id: file.name,
        type: 'updateFile',
        value: { status: 'processing', uploadState: { progress: 100, restTime: 0, speed: 0 } },
      });
    } else {
      // 2. if file don't exist, need upload files
      metadata = await uploadService.uploadWithProgress(file, (status, upload) => {
        onStatusUpdate?.({
          id: file.name,
          type: 'updateFile',
          value: { status: status === 'success' ? 'processing' : status, uploadState: upload },
        });
      });
    }

    // 3. use more powerful file type detector to get file type
    let fileType = file.type;

    if (!file.type) {
      const { fileTypeFromBuffer } = await import('file-type');

      const type = await fileTypeFromBuffer(fileArrayBuffer);
      fileType = type?.mime || 'text/plain';
    }

    // 4. create file to db
    const data = await fileService.createFile(
      {
        createdAt: Date.now(),
        fileType,
        hash,
        metadata,
        name: file.name,
        saveMode: 'url',
        size: file.size,
        url: metadata.path,
      },
      knowledgeBaseId,
    );

    onStatusUpdate?.({
      id: file.name,
      type: 'updateFile',
      value: {
        fileUrl: data.url,
        id: data.id,
        status: 'success',
        uploadState: { progress: 100, restTime: 0, speed: 0 },
      },
    });

    return data;
  },

  uploadWithProgress: async ({ file, onStatusUpdate, knowledgeBaseId }) => {
    const { internal_uploadToServer, internal_uploadToClientDB } = get();

    if (isServerMode) return internal_uploadToServer({ file, knowledgeBaseId, onStatusUpdate });

    return internal_uploadToClientDB({ file, onStatusUpdate });
  },
});
