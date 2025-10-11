import type { getChatStoreState, useChatStore } from './store';

export type ChatStoreDeps = {
  getChatStoreState: typeof getChatStoreState;
  useChatStore: typeof useChatStore;
};

let deps: ChatStoreDeps | null = null;

export const setChatStoreDeps = (nextDeps: ChatStoreDeps) => {
  deps = nextDeps;
};

export const getChatStoreDeps = () => deps;
