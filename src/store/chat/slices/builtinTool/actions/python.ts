import { produce } from 'immer';
import pMap from 'p-map';
import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { fileService } from '@/services/file';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { useFileStore } from '@/store/file';
import { PythonExecutionResult, PythonFileItem, PythonParams } from '@/types/tool/python';
import { setNamespace } from '@/utils/storeDebug';

const n = setNamespace('python');

const SWR_FETCH_PYTHON_FILE_KEY = 'FetchPythonFileItem';

export interface ChatPythonAction {
  interpreter: (id: string, params: PythonParams) => Promise<boolean>;
  processAndUploadPythonFiles: (id: string, executionResult: PythonFileItem[]) => Promise<void>;
  updatePythonFileItem: (id: string, updater: (data: PythonFileItem[]) => void) => Promise<void>;
  useFetchPythonFileItem: (id?: string) => SWRResponse;
}

export const pythonSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatPythonAction
> = (set, get) => ({
  interpreter: async (id: string, params: PythonParams) => {
    const { updatePluginState } = get();

    await updatePluginState(id, { isExecuting: true });

    try {
      // 创建 WebWorker 执行 Python 代码，避免阻塞 UI
      const worker = new Worker(
        new URL('@/tools/python/Render/pyodideWorker.ts', import.meta.url),
        { type: 'module' },
      );

      const executionResult = await new Promise<PythonExecutionResult>((resolve, reject) => {
        const timeout = setTimeout(() => {
          worker.terminate();
          reject(new Error('Python execution timeout (60s)'));
        }, 60_000);

        worker.addEventListener('message', (event) => {
          clearTimeout(timeout);
          worker.terminate();
          resolve(event.data.result);
        });

        worker.addEventListener('error', (error) => {
          clearTimeout(timeout);
          worker.terminate();
          reject(error);
        });

        const packages = params.packages?.filter((pkg) => pkg.trim() !== '') || [];

        worker.postMessage({
          code: params.code,
          id: id,
          packages,
        });
      });

      await updatePluginState(id, {
        executionResult,
        isExecuting: false,
      });

      // 先显示结果，后上传文件，避免用户等待时间过长
      await get().internal_updateMessageContent(id, JSON.stringify(executionResult));

      if (executionResult.files?.length) {
        await get().processAndUploadPythonFiles(id, executionResult.files);
      }
    } catch (error) {
      const errorResult: PythonExecutionResult = {
        error: error instanceof Error ? error.message : String(error),
        output: [],
        success: false,
      };

      await updatePluginState(id, {
        error: error,
        executionResult: errorResult,
        isExecuting: false,
      });

      await get().internal_updateMessageContent(id, JSON.stringify(errorResult));
    }

    return true;
  },

  processAndUploadPythonFiles: async (id: string, files: PythonFileItem[]) => {
    const { updatePythonFileItem } = get();

    await pMap(files, async (fileItem, index) => {
      if (!fileItem.data) return;

      try {
        const blob = new Blob([new Uint8Array(fileItem.data)]);
        const file = new File([blob], fileItem.filename);

        const uploadResult = await useFileStore.getState().uploadWithProgress({
          file,
          skipCheckFileType: true,
        });

        if (uploadResult?.id) {
          await updatePythonFileItem(id, (draft) => {
            if (draft[index]) {
              draft[index].fileId = uploadResult.id;
              draft[index].data = undefined;
            }
          });
        }
      } catch (error) {
        console.error('Failed to upload Python file:', error);
      }
    });
  },

  updatePythonFileItem: async (id: string, updater: (data: PythonFileItem[]) => void) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    const executionResult: PythonExecutionResult = JSON.parse(message.content);
    if (!executionResult.files) return;

    const nextExecutionResult = produce(executionResult, (draft) => {
      updater(draft.files!);
    });

    await get().internal_updateMessageContent(id, JSON.stringify(nextExecutionResult));
  },

  useFetchPythonFileItem: (id) =>
    useClientDataSWR(id ? [SWR_FETCH_PYTHON_FILE_KEY, id] : null, async () => {
      if (!id) return null;

      const item = await fileService.getFile(id);

      set(
        produce((draft) => {
          if (!draft.pythonFileMap) {
            draft.pythonFileMap = {};
          }
          if (draft.pythonFileMap[id]) return;

          draft.pythonFileMap[id] = item;
        }),
        false,
        n('useFetchPythonFileItem'),
      );

      return item;
    }),
});
