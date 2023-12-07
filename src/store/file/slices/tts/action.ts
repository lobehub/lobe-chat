import useSWR, { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { fileService } from '@/services/file';
import { FilePreview } from '@/types/files';

import { FileStore } from '../../store';

export interface TTSFileAction {
  removeTTSFile: (id: string) => Promise<void>;

  uploadTTSByArrayBuffers: (
    messageId: string,
    arrayBuffers: ArrayBuffer[],
  ) => Promise<string | undefined>;

  uploadTTSFile: (file: File) => Promise<string | undefined>;

  useFetchTTSFile: (id: string | null) => SWRResponse<FilePreview>;
}

export const createTTSFileSlice: StateCreator<
  FileStore,
  [['zustand/devtools', never]],
  [],
  TTSFileAction
> = (_, get) => ({
  removeTTSFile: async (id) => {
    await fileService.removeFile(id);
  },
  uploadTTSByArrayBuffers: async (messageId, arrayBuffers) => {
    const fileType = 'audio/mp3';
    const blob = new Blob(arrayBuffers, { type: fileType });
    const fileName = `${messageId}.mp3`;
    const fileOptions = {
      lastModified: Date.now(),
      type: fileType,
    };
    const file = new File([blob], fileName, fileOptions);
    return get().uploadTTSFile(file);
  },
  uploadTTSFile: async (file) => {
    try {
      const data = await fileService.uploadFile({
        createdAt: file.lastModified,
        data: await file.arrayBuffer(),
        fileType: file.type,
        name: file.name,
        saveMode: 'local',
        size: file.size,
      });

      return data.id;
    } catch (error) {
      // 提示用户上传失败
      console.error('upload error:', error);
    }
  },
  useFetchTTSFile: (id) => useSWR(id, fileService.getFile),
});
