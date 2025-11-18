import {
  EditLocalFileParams,
  GetCommandOutputParams,
  GlobFilesParams,
  GrepContentParams,
  KillCommandParams,
  ListLocalFileParams,
  LocalReadFileParams,
  LocalReadFilesParams,
  LocalSearchFilesParams,
  MoveLocalFilesParams,
  RenameLocalFileParams,
  RunCommandParams,
  WriteLocalFileParams,
} from '@lobechat/electron-client-ipc';
import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';
import { LocalSystemExecutionRuntime } from '@/tools/local-system/ExecutionRuntime';

/* eslint-disable typescript-sort-keys/interface */
export interface LocalFileAction {
  internal_triggerLocalFileToolCalling: (
    id: string,
    callingService: () => Promise<{ content: string; error?: any; state?: any; success: boolean }>,
  ) => Promise<boolean>;

  // File Operations
  listLocalFiles: (id: string, params: ListLocalFileParams) => Promise<boolean>;
  moveLocalFiles: (id: string, params: MoveLocalFilesParams) => Promise<boolean>;
  readLocalFile: (id: string, params: LocalReadFileParams) => Promise<boolean>;
  readLocalFiles: (id: string, params: LocalReadFilesParams) => Promise<boolean>;
  renameLocalFile: (id: string, params: RenameLocalFileParams) => Promise<boolean>;
  reSearchLocalFiles: (id: string, params: LocalSearchFilesParams) => Promise<boolean>;
  searchLocalFiles: (id: string, params: LocalSearchFilesParams) => Promise<boolean>;
  toggleLocalFileLoading: (id: string, loading: boolean) => void;
  writeLocalFile: (id: string, params: WriteLocalFileParams) => Promise<boolean>;

  // Shell Commands
  editLocalFile: (id: string, params: EditLocalFileParams) => Promise<boolean>;
  getCommandOutput: (id: string, params: GetCommandOutputParams) => Promise<boolean>;
  killCommand: (id: string, params: KillCommandParams) => Promise<boolean>;
  runCommand: (id: string, params: RunCommandParams) => Promise<boolean>;

  // Search & Find
  globLocalFiles: (id: string, params: GlobFilesParams) => Promise<boolean>;
  grepContent: (id: string, params: GrepContentParams) => Promise<boolean>;
}
/* eslint-enable typescript-sort-keys/interface */

const runtime = new LocalSystemExecutionRuntime();

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const localSystemSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  LocalFileAction
> = (set, get) => ({
  // ==================== File Editing ====================
  editLocalFile: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.editLocalFile(params);
    });
  },

  writeLocalFile: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.writeLocalFile(params);
    });
  },
  moveLocalFiles: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.moveLocalFiles(params);
    });
  },
  renameLocalFile: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.renameLocalFile(params);
    });
  },

  // ==================== Search & Find ====================
  grepContent: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.grepContent(params);
    });
  },

  globLocalFiles: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.globLocalFiles(params);
    });
  },

  searchLocalFiles: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.searchLocalFiles(params);
    });
  },

  listLocalFiles: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.listLocalFiles(params);
    });
  },

  reSearchLocalFiles: async (id, params) => {
    get().toggleLocalFileLoading(id, true);

    await get().optimisticUpdatePluginArguments(id, params);

    return get().searchLocalFiles(id, params);
  },

  readLocalFile: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.readLocalFile(params);
    });
  },

  readLocalFiles: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.readLocalFiles(params);
    });
  },

  // ==================== Shell Commands ====================
  runCommand: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.runCommand(params);
    });
  },
  killCommand: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.killCommand(params);
    });
  },
  getCommandOutput: async (id, params) => {
    return get().internal_triggerLocalFileToolCalling(id, async () => {
      return await runtime.getCommandOutput(params);
    });
  },

  // ==================== utils ====================

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
  internal_triggerLocalFileToolCalling: async (id, callingService) => {
    get().toggleLocalFileLoading(id, true);
    try {
      const { state, content, success, error } = await callingService();

      if (success) {
        if (state) {
          await get().optimisticUpdatePluginState(id, state);
        }
        await get().optimisticUpdateMessageContent(id, content);
      } else {
        await get().optimisticUpdateMessagePluginError(id, {
          body: error,
          message: error?.message || 'Operation failed',
          type: 'PluginServerError',
        });
        // Still update content even if failed, to show error message
        await get().optimisticUpdateMessageContent(id, content);
      }
    } catch (error) {
      await get().optimisticUpdateMessagePluginError(id, {
        body: error,
        message: (error as Error).message,
        type: 'PluginServerError',
      });
    }
    get().toggleLocalFileLoading(id, false);

    return true;
  },
});
