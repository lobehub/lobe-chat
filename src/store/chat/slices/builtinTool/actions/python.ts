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
  PythonImageItem,
  PythonParams,
  PythonState,
} from '@/types/tool/python';
import { setNamespace } from '@/utils/storeDebug';

const n = setNamespace('python');

const SWR_FETCH_PYTHON_IMAGE_KEY = 'FetchPythonImageItem';

export interface ChatPythonAction {
  executePythonCode: (id: string, params: PythonParams) => Promise<void>;
  processAndUploadPythonImages: (
    id: string,
    executionResult: PythonExecutionResult,
  ) => Promise<void>;
  togglePythonExecuting: (id: string, executing: boolean) => void;
  updatePythonImageItem: (id: string, updater: (data: PythonImageItem[]) => void) => Promise<void>;
  useFetchPythonImageItem: (id: string) => SWRResponse;
}

export const pythonSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatPythonAction
> = (set, get) => ({
  executePythonCode: async (id: string, params: PythonParams) => {
    const { togglePythonExecuting, updatePluginState } = get();

    // 开始执行状态
    togglePythonExecuting(id, true);

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
        });
      });

      // 处理图片上传（如果有图片）
      if (executionResult.images && executionResult.images.length > 0) {
        await get().processAndUploadPythonImages(id, executionResult);
      } else {
        // 更新插件状态
        await updatePluginState(id, {
          executionResult,
          isExecuting: false,
        } as PythonState);

        // 更新消息内容为执行结果
        await get().internal_updateMessageContent(id, JSON.stringify(executionResult));
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
    } finally {
      togglePythonExecuting(id, false);
    }
  },

  processAndUploadPythonImages: async (id: string, executionResult: PythonExecutionResult) => {
    const { updatePythonImageItem, updatePluginState } = get();

    if (!executionResult.images || executionResult.images.length === 0) {
      // 如果没有图片，直接更新状态
      await updatePluginState(id, {
        executionResult,
        isExecuting: false,
      } as PythonState);
      await get().internal_updateMessageContent(id, JSON.stringify(executionResult));
      return;
    }

    // 先更新状态显示预览图片
    await updatePluginState(id, {
      executionResult,
      isExecuting: false,
    } as PythonState);
    await get().internal_updateMessageContent(id, JSON.stringify(executionResult));

    // 并行上传所有图片
    await pMap(
      executionResult.images,
      async (imageItem, index) => {
        if (!imageItem.previewUrl) return;

        try {
          // 将 base64 转换为 File 对象
          const base64Data = imageItem.previewUrl.split(',')[1]; // 去掉 data:image/png;base64, 前缀
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'image/png' });
          const file = new File([blob], imageItem.filename, { type: 'image/png' });

          // 使用 fileStore 的 uploadWithProgress 方法（和 DALL-E 一样）
          const uploadResult = await useFileStore.getState().uploadWithProgress({
            file,
            skipCheckFileType: true,
          });

          if (uploadResult?.id) {
            // 更新图片项，设置永久 ID 并清除临时 URL
            await updatePythonImageItem(id, (draft) => {
              if (draft[index]) {
                draft[index].imageId = uploadResult.id;
                draft[index].previewUrl = undefined;
              }
            });
          }
        } catch (error) {
          console.error('Failed to upload Python image:', error);
          // 上传失败，保留 previewUrl 用于显示
        }
      },
      { concurrency: 3 }, // 限制并发上传数量
    );

    // 最终清理：确保所有 previewUrl 都被清除
    await updatePythonImageItem(id, (draft) => {
      draft.forEach((item) => {
        if (item.previewUrl && item.imageId) {
          // 如果已经有 imageId，确保清除 previewUrl
          item.previewUrl = undefined;
        }
      });
    });
  },

  togglePythonExecuting: (id: string, executing: boolean) => {
    set(
      { pythonExecuting: { ...get().pythonExecuting, [id]: executing } },
      false,
      n('togglePythonExecuting'),
    );
  },

  updatePythonImageItem: async (id: string, updater: (data: PythonImageItem[]) => void) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    try {
      const executionResult: PythonExecutionResult = JSON.parse(message.content);
      if (!executionResult.images) return;

      const nextExecutionResult = produce(executionResult, (draft) => {
        updater(draft.images!);
      });

      await get().internal_updateMessageContent(id, JSON.stringify(nextExecutionResult));
    } catch (error) {
      console.error('Failed to update Python image item:', error);
    }
  },

  useFetchPythonImageItem: (id) =>
    useClientDataSWR(id ? [SWR_FETCH_PYTHON_IMAGE_KEY, id] : null, async () => {
      if (!id) return null;

      const item = await fileService.getFile(id);

      set(
        produce((draft) => {
          if (!draft.pythonImageMap) {
            draft.pythonImageMap = {};
          }
          if (draft.pythonImageMap[id]) return;

          draft.pythonImageMap[id] = item;
        }),
        false,
        n('useFetchPythonImageItem'),
      );

      return item;
    }),
});
