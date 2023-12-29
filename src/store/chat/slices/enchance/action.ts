import { produce } from 'immer';
import pMap from 'p-map';
import { StateCreator } from 'zustand/vanilla';

import { chainLangDetect } from '@/chains/langDetect';
import { chainTranslate } from '@/chains/translate';
import { supportLocales } from '@/locales/resources';
import { chatService } from '@/services/chat';
import { fileService } from '@/services/file';
import { imageGenerationService } from '@/services/imageGeneration';
import { messageService } from '@/services/message';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { ChatTTS, ChatTranslate } from '@/types/message';
import { DallEImageItem } from '@/types/tool/dalle';
import { setNamespace } from '@/utils/storeDebug';

const n = setNamespace('enhance');

/**
 * enhance chat action like translate,tts
 */
export interface ChatEnhanceAction {
  clearTTS: (id: string) => Promise<void>;
  clearTranslate: (id: string) => Promise<void>;
  generateImageFromPrompts: (items: DallEImageItem[], id: string) => Promise<void>;
  text2image: (id: string, data: DallEImageItem[]) => Promise<void>;
  toggleDallEImageLoading: (key: string, value: boolean) => void;
  translateMessage: (id: string, targetLang: string) => Promise<void>;
  ttsMessage: (
    id: string,
    state?: { contentMd5?: string; file?: string; voice?: string },
  ) => Promise<void>;
  updateImageItem: (id: string, updater: (data: DallEImageItem[]) => void) => Promise<void>;
  updateMessageTTS: (id: string, data: Partial<ChatTTS> | false) => Promise<void>;
  updateMessageTranslate: (id: string, data: Partial<ChatTranslate> | false) => Promise<void>;
}

export const chatEnhance: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatEnhanceAction
> = (set, get) => ({
  clearTTS: async (id) => {
    await get().updateMessageTTS(id, false);
  },

  clearTranslate: async (id) => {
    await get().updateMessageTranslate(id, false);
  },

  generateImageFromPrompts: async (items, messageId) => {
    const { toggleDallEImageLoading, updateImageItem } = get();
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const getMessageById = (id: string) => chatSelectors.getMessageById(id)(get());

    const message = getMessageById(messageId);
    const parent = getMessageById(message!.parentId!);
    const originPrompt = parent?.content;

    await pMap(items, async (params, index) => {
      toggleDallEImageLoading(messageId + params.prompt, true);
      const url = await imageGenerationService.generateImage(params);

      await updateImageItem(messageId, (draft) => {
        draft[index].previewUrl = url;
      });

      toggleDallEImageLoading(messageId + params.prompt, false);

      fileService
        .uploadImageByUrl(url, {
          metadata: { ...params, originPrompt: originPrompt },
          name: `${originPrompt || params.prompt}_${index}.png`,
        })
        .then(({ id }) => {
          updateImageItem(messageId, (draft) => {
            draft[index].imageId = id;
            draft[index].previewUrl = undefined;
          });
        });
    });
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
  translateMessage: async (id, targetLang) => {
    const { toggleChatLoading, updateMessageTranslate, dispatchMessage } = get();

    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    // create translate extra
    await updateMessageTranslate(id, { content: '', from: '', to: targetLang });

    toggleChatLoading(true, id, n('translateMessage(start)', { id }) as string);

    let content = '';
    let from = '';

    // detect from language
    chatService
      .fetchPresetTaskResult({
        params: chainLangDetect(message.content),
      })
      .then(async (data) => {
        if (data && supportLocales.includes(data)) from = data;

        await updateMessageTranslate(id, { content, from, to: targetLang });
      });

    // translate to target language
    await chatService.fetchPresetTaskResult({
      onMessageHandle: (text) => {
        dispatchMessage({
          id,
          key: 'translate',
          type: 'updateMessageExtra',
          value: produce({ content: '', from, to: targetLang }, (draft) => {
            content += text;
            draft.content += content;
          }),
        });
      },
      params: chainTranslate(message.content, targetLang),
    });

    await updateMessageTranslate(id, { content, from, to: targetLang });

    toggleChatLoading(false);
  },

  ttsMessage: async (id, state = {}) => {
    await get().updateMessageTTS(id, state);
  },

  updateImageItem: async (id, updater) => {
    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    const data: DallEImageItem[] = JSON.parse(message.content);

    const nextContent = produce(data, updater);
    await get().updateMessageContent(id, JSON.stringify(nextContent));
  },

  updateMessageTTS: async (id, data) => {
    await messageService.updateMessage(id, { tts: data as ChatTTS });
    await get().refreshMessages();
  },
  updateMessageTranslate: async (id, data) => {
    await messageService.updateMessage(id, { translate: data as ChatTranslate });
    await get().refreshMessages();
  },
});
