import { t } from 'i18next';
import { sha256 } from 'js-sha256';
import { StateCreator } from 'zustand/vanilla';

import { message } from '@/components/AntdStaticMethods';
import { LOBE_CHAT_CLOUD } from '@/const/branding';
import { isServerMode } from '@/const/version';
import { fileService } from '@/services/file';
import { uploadService } from '@/services/upload';
import { FileMetadata, UploadFileItem } from '@/types/files';

import { FileStore } from '../../store';

type OnStatusUpdate = (
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

interface UploadWithProgressParams {
  file: File;
  knowledgeBaseId?: string;
  onStatusUpdate?: OnStatusUpdate;
  /**
   * Optional flag to indicate whether to skip the file type check.
   * When set to `true`, any file type checks will be bypassed.
   * Default is `false`, which means file type checks will be performed.
   */
  skipCheckFileType?: boolean;
}

interface UploadWithProgressResult {
  filename?: string;
  id: string;
  url: string;
}

export interface FileUploadAction {
  uploadBase64FileWithProgress: (
    base64: string,
    params?: {
      onStatusUpdate?: OnStatusUpdate;
    },
  ) => Promise<UploadWithProgressResult | undefined>;

  uploadWithProgress: (
    params: UploadWithProgressParams,
  ) => Promise<UploadWithProgressResult | undefined>;
}

export const createFileUploadSlice: StateCreator<
  FileStore,
  [['zustand/devtools', never]],
  [],
  FileUploadAction
> = () => ({
  uploadBase64FileWithProgress: async (base64) => {
    const { metadata, fileType, size, hash } = await uploadService.uploadBase64ToS3(base64);

    const res = await fileService.createFile({
      fileType,
      hash,
      metadata,
      name: metadata.filename,
      size: size,
      url: metadata.path,
    });
    return { ...res, filename: metadata.filename };
  },
  uploadWithProgress: async ({ file, onStatusUpdate, knowledgeBaseId, skipCheckFileType }) => {
    const fileArrayBuffer = await file.arrayBuffer();

    // 1. check file hash
    const hash = sha256(fileArrayBuffer);

    const checkStatus = await fileService.checkFileHash(hash);
    let metadata: FileMetadata;

    // 2. if file exist, just skip upload
    if (checkStatus.isExist) {
      metadata = checkStatus.metadata as FileMetadata;
      onStatusUpdate?.({
        id: file.name,
        type: 'updateFile',
        value: { status: 'processing', uploadState: { progress: 100, restTime: 0, speed: 0 } },
      });
    }
    // 2. if file don't exist, need upload files
    else {
      // if is server mode, upload to server s3, or upload to client s3
      if (isServerMode) {
        metadata = await uploadService.uploadWithProgress(file, {
          onProgress: (status, upload) => {
            onStatusUpdate?.({
              id: file.name,
              type: 'updateFile',
              value: { status: status === 'success' ? 'processing' : status, uploadState: upload },
            });
          },
        });
      } else {
        if (!skipCheckFileType && !file.type.startsWith('image')) {
          onStatusUpdate?.({ id: file.name, type: 'removeFile' });
          message.info({
            content: t('upload.fileOnlySupportInServerMode', {
              cloud: LOBE_CHAT_CLOUD,
              ext: file.name.split('.').pop(),
              ns: 'error',
            }),
            duration: 5,
          });
          return;
        }

        // Upload to the indexeddb in the browser
        metadata = await uploadService.uploadToClientS3(hash, file);
      }
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
        fileType,
        hash,
        metadata,
        name: file.name,
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

    return { ...data, filename: file.name };
  },
});
