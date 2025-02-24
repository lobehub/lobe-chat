import { produce } from 'immer';
import pMap from 'p-map';
import { SWRResponse } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { useClientDataSWR } from '@/libs/swr';
import { fileService } from '@/services/file';
import { searchService } from '@/services/search';
import { imageGenerationService } from '@/services/textToImage';
import { uploadService } from '@/services/upload';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { useFileStore } from '@/store/file';
import { CreateMessageParams } from '@/types/message';
import { DallEImageItem } from '@/types/tool/dalle';
import {
  SEARCH_SEARXNG_NOT_CONFIG,
  SearchContent,
  SearchQuery,
  SearchResponse,
} from '@/types/tool/search';
import { setNamespace } from '@/utils/storeDebug';
import { nanoid } from '@/utils/uuid';

const n = setNamespace('tool');

const SWR_FETCH_KEY = 'FetchImageItem';
/**
 * builtin tool action
 */
export interface ChatBuiltinToolAction {
  generateImageFromPrompts: (items: DallEImageItem[], id: string) => Promise<void>;
  /**
   * 重新发起搜索
   * @description 会更新插件的 arguments 参数，然后再次搜索
   */
  reSearchWithSearXNG: (
    id: string,
    data: SearchQuery,
    options?: { aiSummary: boolean },
  ) => Promise<void>;
  saveSearXNGSearchResult: (id: string) => Promise<void>;
  searchWithSearXNG: (
    id: string,
    data: SearchQuery,
    aiSummary?: boolean,
  ) => Promise<void | boolean>;
  text2image: (id: string, data: DallEImageItem[]) => Promise<void>;

  toggleDallEImageLoading: (key: string, value: boolean) => void;
  toggleSearchLoading: (id: string, loading: boolean) => void;
  updateImageItem: (id: string, updater: (data: DallEImageItem[]) => void) => Promise<void>;
  useFetchDalleImageItem: (id: string) => SWRResponse;
}

export const chatToolSlice: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatBuiltinToolAction
> = (set, get) => ({
  generateImageFromPrompts: async (items, messageId) => {
    const { toggleDallEImageLoading, updateImageItem } = get();
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getMessageById = (id: string) => chatSelectors.getMessageById(id)(get());

    const message = getMessageById(messageId);
    if (!message) return;

    const parent = getMessageById(message!.parentId!);
    const originPrompt = parent?.content;
    let errorArray: any[] = [];

    await pMap(items, async (params, index) => {
      toggleDallEImageLoading(messageId + params.prompt, true);

      let url = '';
      try {
        url = await imageGenerationService.generateImage(params);
      } catch (e) {
        toggleDallEImageLoading(messageId + params.prompt, false);
        errorArray[index] = e;

        await get().updatePluginState(messageId, { error: errorArray });
      }

      if (!url) return;

      await updateImageItem(messageId, (draft) => {
        draft[index].previewUrl = url;
      });

      toggleDallEImageLoading(messageId + params.prompt, false);
      const imageFile = await uploadService.getImageFileByUrlWithCORS(
        url,
        `${originPrompt || params.prompt}_${index}.png`,
      );

      const data = await useFileStore.getState().uploadWithProgress({
        file: imageFile,
      });

      if (!data) return;

      await updateImageItem(messageId, (draft) => {
        draft[index].imageId = data.id;
        draft[index].previewUrl = undefined;
      });
    });
  },
  reSearchWithSearXNG: async (id, data, options) => {
    get().toggleSearchLoading(id, true);
    await get().updatePluginArguments(id, data);

    await get().searchWithSearXNG(id, data, options?.aiSummary);
  },
  saveSearXNGSearchResult: async (id) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message || !message.plugin) return;

    const { internal_addToolToAssistantMessage, internal_createMessage, openToolUI } = get();
    // 1. 创建一个新的 tool call message
    const newToolCallId = `tool_call_${nanoid()}`;

    const toolMessage: CreateMessageParams = {
      content: message.content,
      id: undefined,
      parentId: message.parentId,
      plugin: message.plugin,
      pluginState: message.pluginState,
      role: 'tool',
      sessionId: get().activeId,
      tool_call_id: newToolCallId,
      topicId: get().activeTopicId,
    };

    const addToolItem = async () => {
      if (!message.parentId || !message.plugin) return;

      await internal_addToolToAssistantMessage(message.parentId, {
        id: newToolCallId,
        ...message.plugin,
      });
    };

    const [newMessageId] = await Promise.all([
      // 1. 添加 tool message
      internal_createMessage(toolMessage),
      // 2. 将这条 tool call message 插入到 ai 消息的 tools 中
      addToolItem(),
    ]);

    // 将新创建的 tool message 激活
    openToolUI(newMessageId, message.plugin.identifier);
  },
  searchWithSearXNG: async (id, params, aiSummary = true) => {
    get().toggleSearchLoading(id, true);
    let data: SearchResponse | undefined;
    try {
      data = await searchService.search(params.query, params.searchEngines);
      await get().updatePluginState(id, data);
    } catch (e) {
      if ((e as Error).message === SEARCH_SEARXNG_NOT_CONFIG) {
        await get().internal_updateMessagePluginError(id, {
          body: {
            provider: 'searxng',
          },
          message: 'SearXNG is not configured',
          type: 'PluginSettingsInvalid',
        });
      } else {
        await get().internal_updateMessagePluginError(id, {
          body: e,
          message: (e as Error).message,
          type: 'PluginServerError',
        });
      }
    }

    get().toggleSearchLoading(id, false);

    if (!data) return;

    // 只取前 5 个结果作为上下文
    const searchContent: SearchContent[] = data.results.slice(0, 5).map((item) => ({
      content: item.content,
      title: item.title,
      url: item.url,
    }));

    await get().internal_updateMessageContent(id, JSON.stringify(searchContent));

    // 如果没搜索到结果，那么不触发 ai 总结
    if (searchContent.length === 0) return;

    // 如果 aiSummary 为 true，则会自动触发总结
    return aiSummary;
  },
  text2image: async (id, data) => {
    // const isAutoGen = settingsSelectors.isDalleAutoGenerating(useGlobalStore.getState());
    // if (!isAutoGen) return;

    await get().generateImageFromPrompts(data, id);
  },

  toggleDallEImageLoading: (key, value) => {
    set(
      { dalleImageLoading: { ...get().dalleImageLoading, [key]: value } },
      false,
      n('toggleDallEImageLoading'),
    );
  },

  toggleSearchLoading: (id, loading) => {
    set({ searchLoading: { ...get().searchLoading, [id]: loading } }, false, 'toggleSearchLoading');
  },

  updateImageItem: async (id, updater) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    const data: DallEImageItem[] = JSON.parse(message.content);

    const nextContent = produce(data, updater);
    await get().internal_updateMessageContent(id, JSON.stringify(nextContent));
  },

  useFetchDalleImageItem: (id) =>
    useClientDataSWR([SWR_FETCH_KEY, id], async () => {
      const item = await fileService.getFile(id);

      set(
        produce((draft) => {
          if (draft.dalleImageMap[id]) return;

          draft.dalleImageMap[id] = item;
        }),
        false,
        n('useFetchFile'),
      );

      return item;
    }),
});
