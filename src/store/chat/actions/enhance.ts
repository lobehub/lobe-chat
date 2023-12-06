import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { chainLangDetect } from '@/chains/langDetect';
import { chainTranslate } from '@/chains/translate';
import { supportLocales } from '@/locales/options';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatStore } from '@/store/chat/store';
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
}

export const chatEnhance: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatEnhanceAction
> = (set, get) => ({
  clearTTS: async (id) => {
    await messageService.updateMessageTTS(id, null);
    await get().refreshMessages();
  },

  clearTranslate: async (id) => {
    await messageService.updateMessageTranslate(id, null);
    await get().refreshMessages();
  },

  translateMessage: async (id, targetLang) => {
    const { toggleChatLoading, dispatchMessage, refreshMessages } = get();

    const message = chatSelectors.getMessageById(id)(get());
    if (!message) return;

    // create translate extra
    await messageService.updateMessageTranslate(id, { content: '', from: '', to: targetLang });
    await refreshMessages();

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

        await messageService.updateMessageTranslate(id, { content, from, to: targetLang });
        await refreshMessages();
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

    await messageService.updateMessageTranslate(id, { content, from, to: targetLang });
    await refreshMessages();

    toggleChatLoading(false);
  },

  ttsMessage: async (id, state = {}) => {
    await messageService.updateMessageTTS(id, state);
    await get().refreshMessages();
  },
});
