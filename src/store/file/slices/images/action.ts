import { produce } from 'immer';
import useSWR, { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { fileService } from '@/services/file';
import { FilePreview } from '@/types/files';
import { setNamespace } from '@/utils/storeDebug';

import { FileStore } from '../../store';

const n = setNamespace('image');

export interface FileAction {
  clearImageList: () => void;
  removeAllFiles: () => Promise<void>;
  removeFile: (id: string) => Promise<void>;

  setImageMapItem: (id: string, item: FilePreview) => void;
  uploadFile: (file: File) => Promise<void>;

  useFetchFile: (id: string) => SWRResponse<FilePreview>;
}

export const createFileSlice: StateCreator<
  FileStore,
  [['zustand/devtools', never]],
  [],
  FileAction
> = (set, get) => ({
  clearImageList: () => {
    set({ inputFilesList: [] }, false, n('clearImageList'));
  },
  removeAllFiles: async () => {
    await fileService.removeAllFiles();
  },
  removeFile: async (id) => {
    await fileService.removeFile(id);

    set(
      ({ inputFilesList }) => ({ inputFilesList: inputFilesList.filter((i) => i !== id) }),
      false,
      n('removeFile'),
    );
  },
  setImageMapItem: (id, item) => {
    set(
      produce((draft) => {
        if (draft.imagesMap[id]) return;

        draft.imagesMap[id] = item;
      }),
      false,
      n('setImageMapItem'),
    );
  },
  uploadFile: async (file) => {
    try {
      const data = await fileService.uploadFile({
        createdAt: file.lastModified,
        data: await file.arrayBuffer(),
        fileType: file.type,
        name: file.name,
        saveMode: 'local',
        size: file.size,
      });

      set(
        ({ inputFilesList }) => ({ inputFilesList: [...inputFilesList, data.id] }),
        false,
        n('uploadFile'),
      );
    } catch (error) {
      // 提示用户上传失败
      console.error('upload error:', error);
    }
  },
  useFetchFile: (id) =>
    useSWR(id, async (id) => {
      const item = await fileService.getFile(id);

      get().setImageMapItem(id, item);

      return item;
    }),
});
