import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { chainLangDetect } from '@/chains/langDetect';
import { chainTranslate } from '@/chains/translate';
import { supportLocales } from '@/locales/resources';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
import { ChatTTS, ChatTranslate } from '@/types/message';
import { setNamespace } from '@/utils/storeDebug';

const n = setNamespace('enhance');

/**
 * enhance chat action like translate,tts
 */
export interface ChatEnhanceAction {
  clearTTS: (id: string) => Promise<void>;
  clearTranslate: (id: string) => Promise<void>;
  translateMessage: (id: string, targetLang: string) => Promise<void>;
  ttsMessage: (
    id: string,
    state?: { contentMd5?: string; file?: string; voice?: string },
  ) => Promise<void>;
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

  updateMessageTTS: async (id, data) => {
    await messageService.updateMessage(id, { tts: data as ChatTTS });
    await get().refreshMessages();
  },

  updateMessageTranslate: async (id, data) => {
    await messageService.updateMessage(id, { translate: data as ChatTranslate });
    await get().refreshMessages();
  },
});
