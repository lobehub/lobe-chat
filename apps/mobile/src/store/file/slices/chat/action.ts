import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { MobileUploadFileItem } from '@/types/file';
import { setNamespace } from '@/utils/storeDebug';

import { UploadFileListDispatch, uploadFileListReducer } from '../../reducers/uploadFileList';
import { FileStore } from '../../store';

const n = setNamespace('file/chat');

export interface FileAction {
  clearChatUploadFileList: () => void;
  dispatchChatUploadFileList: (payload: UploadFileListDispatch) => void;
  removeChatUploadFile: (id: string) => Promise<void>;
  uploadChatFiles: (files: MobileUploadFileItem[]) => Promise<void>;
}

export const createFileSlice: StateCreator<
  FileStore,
  [['zustand/devtools', never]],
  [],
  FileAction
> = (set, get) => ({
  clearChatUploadFileList: () => {
    set({ chatUploadFileList: [] }, false, n('clearChatUploadFileList'));
  },

  dispatchChatUploadFileList: (payload) => {
    const nextValue = uploadFileListReducer(get().chatUploadFileList, payload);
    if (nextValue === get().chatUploadFileList) return;

    set({ chatUploadFileList: nextValue }, false, n(`dispatchChatFileList/${payload.type}`));
  },

  removeChatUploadFile: async (id) => {
    const { dispatchChatUploadFileList } = get();
    dispatchChatUploadFileList({ id, type: 'removeFile' });

    // Remove file from database
    const { fileService } = await import('@/services/file');
    await fileService.removeFile(id);
  },

  uploadChatFiles: async (uploadFiles) => {
    const { dispatchChatUploadFileList } = get();

    // 1. Add files to the upload list with pending status
    dispatchChatUploadFileList({ files: uploadFiles as any, type: 'addFiles' });

    // 2. Update uploadingIds
    set(
      produce((draft) => {
        draft.uploadingIds.push(...uploadFiles.map((f) => f.id));
      }),
      false,
      n('startUpload'),
    );

    // 3. Upload files and create database records (aligned with web)
    const pools = uploadFiles.map(async (uploadFile) => {
      let fileResult: { id: string; url: string } | undefined;

      try {
        // Update to uploading status
        dispatchChatUploadFileList({
          id: uploadFile.id,
          type: 'updateFile',
          value: {
            status: 'uploading',
          },
        });

        // Import services
        const { fileService } = await import('@/services/file');
        const { trpcClient } = await import('@/services/_auth/trpc');

        // Step 1: Generate S3 key
        const { nanoid } = await import('@/utils/uuid');
        const extension =
          uploadFile.name?.split('.').pop() || uploadFile.fileType?.split('/')[1] || 'bin';
        const s3Key = `chat-files/${nanoid()}.${extension}`;

        // Step 2: Get pre-signed URL
        const preSignedUrl = await trpcClient.upload.createS3PreSignedUrl.mutate({
          pathname: s3Key,
        });

        // Step 3: Upload file using pre-signed URL (aligned with web)
        const base64Data = uploadFile.base64Url || '';
        const matches = base64Data.match(/^data:(.+?);base64,(.+)$/);
        if (!matches) {
          throw new Error('Invalid base64 data');
        }
        const mimeType = matches[1];
        const base64 = matches[2];
        const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        await fetch(preSignedUrl, {
          body: buffer,
          headers: {
            'Content-Type': mimeType,
          },
          method: 'PUT',
        });

        // Step 4: Create database record with S3 key (aligned with web)
        fileResult = await fileService.createFile({
          fileType: uploadFile.fileType || 'image/jpeg',
          hash: uploadFile.fileHash || uploadFile.id,
          metadata: {
            filename: uploadFile.name || 'unknown',
            path: s3Key,
          },
          name: uploadFile.name || 'unknown',
          size: uploadFile.size || 0,
          url: s3Key, // S3 key (will be converted to full URL by server)
        });

        // Update file with server-assigned id (CRITICAL!)
        dispatchChatUploadFileList({
          id: uploadFile.id,
          type: 'updateFile',
          value: {
            fileUrl: fileResult.url, 
            id: fileResult.id,
            // Replace local id with server-assigned id!
status: 'success',
          },
        });
      } catch (error) {
        console.error('[uploadChatFiles] Failed:', error);

        // Update to error status
        dispatchChatUploadFileList({
          id: uploadFile.id,
          type: 'updateFile',
          value: {
            status: 'error',
          },
        });

        // TODO: Show error notification
        // Alert.alert('Upload Error', `Failed to upload ${uploadFile.name}`);
      }
    });

    await Promise.all(pools);

    // 4. Clear uploadingIds
    set(
      produce((draft) => {
        draft.uploadingIds = draft.uploadingIds.filter(
          (id: string) => !uploadFiles.map((f) => f.id).includes(id),
        );
      }),
      false,
      n('endUpload'),
    );
  },
});
