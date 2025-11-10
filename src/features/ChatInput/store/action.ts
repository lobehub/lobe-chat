import { ContextEngine, GroupMessageFlattenProcessor } from '@lobechat/context-engine';
import { contextInputAutoComplete } from '@lobechat/prompts';
import { StateCreator } from 'zustand/vanilla';

import { chatService } from '@/services/chat';

import { PublicState, State, initialState } from './initialState';

export interface Action {
  autoCompleteInput: (
    input: string,
    afterText: string,
    selectionType: string,
  ) => Promise<string | null>;
  getJSONState: () => any;
  getMarkdownContent: () => string;
  handleSendButton: () => void;
  handleStop: () => void;
  setExpand: (expend: boolean) => void;
  setJSONState: (content: any) => void;
  setShowTypoBar: (show: boolean) => void;
  updateMarkdownContent: () => void;
}

export type Store = Action & State;

// const t = setNamespace('ChatInput');

type CreateStore = (
  initState?: Partial<PublicState>,
) => StateCreator<Store, [['zustand/devtools', never]]>;

export const store: CreateStore = (publicState) => (set, get) => ({
  ...initialState,
  ...publicState,
  autoCompleteInput: async (input) => {
    if (!input) return null;

    // Clear previous timer
    const timerId = get().autoCompleteTimerId;
    if (timerId) {
      clearTimeout(timerId);
    }

    // Increment request ID to track the latest request
    const currentRequestId = get().autoCompleteRequestId + 1;
    set({ autoCompleteRequestId: currentRequestId });

    // Create a debounced promise
    return new Promise<string | null>((resolve) => {
      const newTimerId = setTimeout(async () => {
        // Check if this is still the latest request
        if (get().autoCompleteRequestId !== currentRequestId) {
          resolve(null);
          return;
        }

        let contexts: string[] = [];

        if (get().getMessages) {
          const { messages } = await new ContextEngine({
            pipeline: [new GroupMessageFlattenProcessor()],
          }).process({ messages: get().getMessages!() });
          contexts = [messages.at(-1)?.content];
        }

        let result = '';

        await chatService.fetchPresetTaskResult({
          onFinish: async (text) => {
            result = text;
          },
          params: {
            ...contextInputAutoComplete({ context: contexts, input }),
            model: 'openai/gpt-oss-120b',
            provider: 'groq',
          },
        });

        resolve(result || null);
      }, 300);

      set({ autoCompleteTimerId: newTimerId });
    });
  },

  getJSONState: () => {
    return get().editor?.getDocument('json');
  },
  getMarkdownContent: () => {
    return String(get().editor?.getDocument('markdown') || '').trimEnd();
  },

  handleSendButton: () => {
    if (!get().editor) return;

    const editor = get().editor;

    get().onSend?.({
      clearContent: () => editor?.cleanDocument(),
      editor: editor!,
      getMarkdownContent: get().getMarkdownContent,
    });
  },

  handleStop: () => {
    if (!get().editor) return;

    get().sendButtonProps?.onStop?.({ editor: get().editor! });
  },

  setExpand: (expand) => {
    set({ expand });
  },

  setJSONState: (content) => {
    get().editor?.setDocument('json', content);
  },

  setShowTypoBar: (showTypoBar) => {
    set({ showTypoBar });
  },
  updateMarkdownContent: () => {
    if (!get().onMarkdownContentChange) return;

    const content = get().getMarkdownContent();

    if (content === get().markdownContent) return;

    get().onMarkdownContentChange?.(content);

    set({ markdownContent: content });
  },
});
