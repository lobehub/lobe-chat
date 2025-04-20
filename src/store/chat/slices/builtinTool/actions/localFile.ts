import {
  ListLocalFileParams,
  LocalReadFileParams,
  LocalReadFilesParams,
  LocalSearchFilesParams,
} from '@lobechat/electron-client-ipc';
import { StateCreator } from 'zustand/vanilla';

import { localFileService } from '@/services/electron/localFileService';
import { ChatStore } from '@/store/chat/store';
import {
  LocalFileListState,
  LocalFileSearchState,
  LocalReadFileState,
  LocalReadFilesState,
} from '@/tools/local-files/type';

export interface LocalFileAction {
  listLocalFiles: (id: string, params: ListLocalFileParams) => Promise<boolean>;
  reSearchLocalFiles: (id: string, params: LocalSearchFilesParams) => Promise<boolean>;
  readLocalFile: (id: string, params: LocalReadFileParams) => Promise<boolean>;
  readLocalFiles: (id: string, params: LocalReadFilesParams) => Promise<boolean>;
  searchLocalFiles: (id: string, params: LocalSearchFilesParams) => Promise<boolean>;
  toggleLocalFileLoading: (id: string, loading: boolean) => void;
}

export const localFileSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  LocalFileAction
> = (set, get) => ({
  listLocalFiles: async (id, params) => {
    get().toggleLocalFileLoading(id, true);
    try {
      const data = await localFileService.listLocalFiles(params);
      console.log(data);
      await get().updatePluginState(id, { listResults: data } as LocalFileListState);
      await get().internal_updateMessageContent(id, JSON.stringify(data));
    } catch (error) {
      console.error('Error listing local files:', error);
      await get().internal_updateMessagePluginError(id, {
        body: error,
        message: (error as Error).message,
        type: 'PluginServerError',
      });
    }
    get().toggleLocalFileLoading(id, false);

    return true;
  },

  reSearchLocalFiles: async (id, params) => {
    get().toggleLocalFileLoading(id, true);

    await get().updatePluginArguments(id, params);

    return get().searchLocalFiles(id, params);
  },

  readLocalFile: async (id, params) => {
    get().toggleLocalFileLoading(id, true);

    try {
      const result = await localFileService.readLocalFile(params);

      await get().updatePluginState(id, { fileContent: result } as LocalReadFileState);
      await get().internal_updateMessageContent(id, JSON.stringify(result));
    } catch (error) {
      console.error('Error reading local file:', error);
      await get().internal_updateMessagePluginError(id, {
        body: error,
        message: (error as Error).message,
        type: 'PluginServerError',
      });
    }
    get().toggleLocalFileLoading(id, false);
    return true;
  },

  readLocalFiles: async (id, params) => {
    get().toggleLocalFileLoading(id, true);

    try {
      const results = await localFileService.readLocalFiles(params);
      await get().updatePluginState(id, { filesContent: results } as LocalReadFilesState);
      await get().internal_updateMessageContent(id, JSON.stringify(results));
    } catch (error) {
      console.error('Error reading local files:', error);
      await get().internal_updateMessagePluginError(id, {
        body: error,
        message: (error as Error).message,
        type: 'PluginServerError',
      });
    }
    get().toggleLocalFileLoading(id, false);

    return true;
  },

  searchLocalFiles: async (id, params) => {
    get().toggleLocalFileLoading(id, true);
    try {
      const data = await localFileService.searchLocalFiles(params);
      await get().updatePluginState(id, { searchResults: data } as LocalFileSearchState);
      await get().internal_updateMessageContent(id, JSON.stringify(data));
    } catch (error) {
      console.error('Error searching local files:', error);
      await get().internal_updateMessagePluginError(id, {
        body: error,
        message: (error as Error).message,
        type: 'PluginServerError',
      });
    }
    get().toggleLocalFileLoading(id, false);

    return true;
  },
  toggleLocalFileLoading: (id, loading) => {
    // Assuming a loading state structure similar to searchLoading
    set(
      (state) => ({
        localFileLoading: { ...state.localFileLoading, [id]: loading },
      }),
      false,
      `toggleLocalFileLoading/${loading ? 'start' : 'end'}`,
    );
  },
});
