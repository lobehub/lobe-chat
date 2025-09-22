import {
  CodeInterpreterFileItem,
  CodeInterpreterParams,
  CodeInterpreterResponse,
} from '@lobechat/types';
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
import { CodeInterpreterIdentifier } from '@/tools/code-interpreter';
import { setNamespace } from '@/utils/storeDebug';

const n = setNamespace('codeInterpreter');

const SWR_FETCH_INTERPRETER_FILE_KEY = 'FetchCodeInterpreterFileItem';

export interface ChatCodeInterpreterAction {
  python: (id: string, params: CodeInterpreterParams) => Promise<boolean | undefined>;
  toggleInterpreterExecuting: (id: string, loading: boolean) => void;
  updateInterpreterFileItem: (
    id: string,
    updater: (data: CodeInterpreterResponse) => void,
  ) => Promise<void>;
  uploadInterpreterFiles: (id: string, files: CodeInterpreterFileItem[]) => Promise<void>;
  useFetchInterpreterFileItem: (id?: string) => SWRResponse;
}

export const codeInterpreterSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatCodeInterpreterAction
> = (set, get) => ({
  python: async (id: string, params: CodeInterpreterParams) => {
    const {
      toggleInterpreterExecuting,
      updatePluginState,
      internal_updateMessageContent,
      uploadInterpreterFiles,
    } = get();

    toggleInterpreterExecuting(id, true);

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
        if (tool.identifier === CodeInterpreterIdentifier) {
          const message = chatSelectors.getMessageByToolCallId(tool.id)(get());
          if (message?.content) {
            const content = JSON.parse(message.content) as CodeInterpreterResponse;
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
      if (result?.files) {
        await internal_updateMessageContent(id, JSON.stringify(result));
        await uploadInterpreterFiles(id, result.files);
      } else {
        await internal_updateMessageContent(id, JSON.stringify(result));
      }
    } catch (error) {
      updatePluginState(id, { error });
      // 如果调用过程中出现了错误，不要触发 AI 消息
      return;
    } finally {
      toggleInterpreterExecuting(id, false);
    }

    return true;
  },

  toggleInterpreterExecuting: (id: string, executing: boolean) => {
    set(
      { codeInterpreterExecuting: { ...get().codeInterpreterExecuting, [id]: executing } },
      false,
      n('toggleInterpreterExecuting'),
    );
  },

  updateInterpreterFileItem: async (
    id: string,
    updater: (data: CodeInterpreterResponse) => void,
  ) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    const result: CodeInterpreterResponse = JSON.parse(message.content);
    if (!result.files) return;

    const nextResult = produce(result, updater);

    await get().internal_updateMessageContent(id, JSON.stringify(nextResult));
  },

  uploadInterpreterFiles: async (id: string, files: CodeInterpreterFileItem[]) => {
    const { updateInterpreterFileItem } = get();

    if (!files) return;

    await pMap(files, async (file, index) => {
      if (!file.data) return;

      try {
        const uploadResult = await useFileStore.getState().uploadWithProgress({
          file: file.data,
          skipCheckFileType: true,
        });

        if (uploadResult?.id) {
          await updateInterpreterFileItem(id, (draft) => {
            if (draft.files?.[index]) {
              draft.files[index].fileId = uploadResult.id;
              draft.files[index].previewUrl = undefined;
              draft.files[index].data = undefined;
            }
          });
        }
      } catch (error) {
        console.error('Failed to upload CodeInterpreter file:', error);
      }
    });
  },

  useFetchInterpreterFileItem: (id) =>
    useClientDataSWR(id ? [SWR_FETCH_INTERPRETER_FILE_KEY, id] : null, async () => {
      if (!id) return null;

      const item = await fileService.getFile(id);

      set(
        produce((draft) => {
          if (!draft.codeInterpreterFileMap) {
            draft.codeInterpreterFileMap = {};
          }
          if (draft.codeInterpreterFileMap[id]) return;

          draft.codeInterpreterFileMap[id] = item;
        }),
        false,
        n('useFetchInterpreterFileItem'),
      );

      return item;
    }),
});
