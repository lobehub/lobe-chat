import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { chainLangDetect } from '@/chains/langDetect';
import { chainTranslate } from '@/chains/translate';
import { supportLocales } from '@/locales/options';
import { chatService } from '@/services/chat';
import { ChatStore } from '@/store/chat/store';
import { setNamespace } from '@/utils/storeDebug';

import { sessionSelectors } from '../../session/selectors';

const t = setNamespace('chat/translate');

/**
 * 翻译事件
 */
export interface ChatTranslateAction {
  clearTTS: (id: string) => void;

  clearTranslate: (id: string) => void;
  /**
   * 翻译消息
   * @param id
   */
  translateMessage: (id: string, targetLang: string) => Promise<void>;
  ttsMessage: (id: string, init?: boolean) => void;
}

export const chatTranslate: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatTranslateAction
> = (set, get) => ({
  clearTTS: (id) => {
    get().dispatchMessage({
      id,
      key: 'tts',
      type: 'updateMessageExtra',
      value: null,
    });
  },

  clearTranslate: (id) => {
    get().dispatchMessage({
      id,
      key: 'translate',
      type: 'updateMessageExtra',
      value: null,
    });
  },

  translateMessage: async (id, targetLang) => {
    const { toggleChatLoading, dispatchMessage } = get();
    const session = sessionSelectors.currentSession(get());
    if (!session || !id) return;

    const message = session.chats[id];
    if (!message) return;

    let content = '';
    let from = '';

    dispatchMessage({
      id,
      key: 'translate',
      type: 'updateMessageExtra',
      value: { content: '', to: targetLang },
    });

    toggleChatLoading(true, id, t('translateMessage(start)', { id }) as string);

    // detect from language
    chatService
      .fetchPresetTaskResult({
        params: chainLangDetect(message.content),
      })
      .then((data) => {
        if (data && supportLocales.includes(data)) from = data;
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

    toggleChatLoading(false);
  },

  ttsMessage: (id, init) => {
    const { dispatchMessage } = get();
    dispatchMessage({
      id,
      key: 'tts',
      type: 'updateMessageExtra',
      value: {
        init: Boolean(init),
      },
    });
  },
});
