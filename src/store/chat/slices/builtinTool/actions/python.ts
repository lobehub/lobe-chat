import { produce } from 'immer';
import pMap from 'p-map';
import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { fileService } from '@/services/file';
import { pythonService } from '@/services/python';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { useFileStore } from '@/store/file';
import { PythonToolIdentifier } from '@/tools/python';
import { PythonFileItem, PythonInterpreterParams, PythonResponse } from '@/types/tool/python';
import { setNamespace } from '@/utils/storeDebug';

const n = setNamespace('python');

const SWR_FETCH_PYTHON_FILE_KEY = 'FetchPythonFileItem';

export interface ChatPythonAction {
  interpreter: (id: string, params: PythonInterpreterParams) => Promise<boolean | undefined>;
  togglePythonExecuting: (id: string, loading: boolean) => void;
  updatePythonFileItem: (id: string, updater: (data: PythonResponse) => void) => Promise<void>;
  uploadPythonFiles: (id: string, files: PythonFileItem[]) => Promise<void>;
  useFetchPythonFileItem: (id?: string) => SWRResponse;
}

export const pythonSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatPythonAction
> = (set, get) => ({
  interpreter: async (id: string, params: PythonInterpreterParams) => {
    const {
      togglePythonExecuting,
      updatePluginState,
      internal_updateMessageContent,
      uploadPythonFiles,
    } = get();

    togglePythonExecuting(id, true);

    // TODO: 应该只下载 AI 用到的文件
    const files: File[] = [];
    for (const message of chatSelectors.mainDisplayChats(get())) {
      for (const file of message.fileList ?? []) {
        const blob = await fetch(file.url).then((res) => res.blob());
        files.push(new File([blob], file.name));
      }
      for (const image of message.imageList ?? []) {
        const blob = await fetch(image.url).then((res) => res.blob());
        files.push(new File([blob], image.alt));
      }
      for (const tool of message.tools ?? []) {
        if (tool.identifier === PythonToolIdentifier) {
          const message = chatSelectors.getMessageByToolCallId(tool.id)(get());
          if (message?.content) {
            const content = JSON.parse(message.content) as PythonResponse;
            for (const file of content.files ?? []) {
              const item = await fileService.getFile(file.fileId!);
              const blob = await fetch(item.url).then((res) => res.blob());
              files.push(new File([blob], file.filename));
            }
          }
        }
      }
    }

    try {
      const result = await pythonService.runPython(params.code, params.packages, files);
      if (result.files) {
        await internal_updateMessageContent(id, JSON.stringify(result));
        await uploadPythonFiles(id, result.files);
      } else {
        await internal_updateMessageContent(id, JSON.stringify(result));
      }
    } catch (error) {
      updatePluginState(id, { error });
      // 如果调用过程中出现了错误，不要触发 AI 消息
      return;
    } finally {
      togglePythonExecuting(id, false);
    }

    return true;
  },

  togglePythonExecuting: (id: string, executing: boolean) => {
    set(
      { pythonExecuting: { ...get().pythonExecuting, [id]: executing } },
      false,
      n('togglePythonExecuting'),
    );
  },

  updatePythonFileItem: async (id: string, updater: (data: PythonResponse) => void) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    const result: PythonResponse = JSON.parse(message.content);
    if (!result.files) return;

    const nextResult = produce(result, updater);

    await get().internal_updateMessageContent(id, JSON.stringify(nextResult));
  },

  uploadPythonFiles: async (id: string, files: PythonFileItem[]) => {
    const { updatePythonFileItem } = get();

    if (!files) return;

    await pMap(files, async (file, index) => {
      if (!file.data) return;

      try {
        const uploadResult = await useFileStore.getState().uploadWithProgress({
          file: file.data,
          skipCheckFileType: true,
        });

        if (uploadResult?.id) {
          await updatePythonFileItem(id, (draft) => {
            if (draft.files?.[index]) {
              draft.files[index].fileId = uploadResult.id;
              draft.files[index].previewUrl = undefined;
              draft.files[index].data = undefined;
            }
          });
        }
      } catch (error) {
        console.error('Failed to upload Python file:', error);
      }
    });
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
