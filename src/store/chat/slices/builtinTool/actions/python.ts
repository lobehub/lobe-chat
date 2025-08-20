import { produce } from 'immer';
import pMap from 'p-map';
import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { fileService } from '@/services/file';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { useFileStore } from '@/store/file';
import {
  PythonExecutionResult,
  PythonFileItem,
  PythonParams,
  PythonState,
} from '@/types/tool/python';
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

    // 开始执行状态
    await updatePluginState(id, { isExecuting: true } as PythonState);

    try {
      // 创建 WebWorker 来执行 Python 代码
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

        // 发送代码给 Worker 执行
        worker.postMessage({
          code: params.code,
          id: id,
          packages: params.packages,
        });
      });

      // 更新插件状态
      await updatePluginState(id, {
        executionResult,
        isExecuting: false,
      } as PythonState);
      // 更新消息内容为执行结果
      await get().internal_updateMessageContent(id, JSON.stringify(executionResult));

      // 最后处理文件上传
      if (executionResult.files?.length) {
        await get().processAndUploadPythonFiles(id, executionResult.files);
      }
    } catch (error) {
      const errorResult: PythonExecutionResult = {
        error: error instanceof Error ? error.message : String(error),
        output: [],
        success: false,
      };

      // 更新插件状态和错误
      await updatePluginState(id, {
        error: error,
        executionResult: errorResult,
        isExecuting: false,
      } as PythonState);

      await get().internal_updateMessageContent(id, JSON.stringify(errorResult));
    }

    return true;
  },

  processAndUploadPythonFiles: async (id: string, files: PythonFileItem[]) => {
    const { updatePythonFileItem } = get();

    // 并行上传所有文件
    await pMap(
      files,
      async (fileItem, index) => {
        if (!fileItem.data) return;

        try {
          // 创建 File 对象
          const blob = new Blob([fileItem.data]);
          const file = new File([blob], fileItem.filename);

          // 使用 fileStore 的 uploadWithProgress 方法
          const uploadResult = await useFileStore.getState().uploadWithProgress({
            file,
            skipCheckFileType: true,
          });

          if (uploadResult?.id) {
            // 更新文件项，设置永久 ID 并清除临时数据
            await updatePythonFileItem(id, (draft) => {
              if (draft[index]) {
                draft[index].fileId = uploadResult.id;
                draft[index].data = undefined;
              }
            });
          }
        } catch (error) {
          console.error('Failed to upload Python file:', error);
          // 上传失败，保留原始数据用于显示和下载
        }
      },
      { concurrency: 3 }, // 限制并发上传数量
    );
  },

  updatePythonFileItem: async (id: string, updater: (data: PythonFileItem[]) => void) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    try {
      const executionResult: PythonExecutionResult = JSON.parse(message.content);
      if (!executionResult.files) return;

      const nextExecutionResult = produce(executionResult, (draft) => {
        updater(draft.files!);
      });

      await get().internal_updateMessageContent(id, JSON.stringify(nextExecutionResult));
    } catch (error) {
      console.error('Failed to update Python file item:', error);
    }
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
