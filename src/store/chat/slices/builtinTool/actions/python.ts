import { StateCreator } from 'zustand/vanilla';

import { ChatStore } from '@/store/chat/store';
import { PythonExecutionResult, PythonParams, PythonState } from '@/types/tool/python';
import { setNamespace } from '@/utils/storeDebug';

const n = setNamespace('python');

export interface ChatPythonAction {
  executePythonCode: (id: string, params: PythonParams) => Promise<void>;
  togglePythonExecuting: (id: string, executing: boolean) => void;
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

      // 更新插件状态
      await updatePluginState(id, {
        executionResult,
        isExecuting: false,
      } as PythonState);

      // 更新消息内容为执行结果
      await get().internal_updateMessageContent(id, JSON.stringify(executionResult));
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

  togglePythonExecuting: (id: string, executing: boolean) => {
    set(
      { pythonExecuting: { ...get().pythonExecuting, [id]: executing } },
      false,
      n('togglePythonExecuting'),
    );
  },
});
