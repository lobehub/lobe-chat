import AsyncStorage from '@react-native-async-storage/async-storage';
import { createWithEqualityFn } from 'zustand/traditional';
import { createJSONStorage, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

interface OpenAIConfig {
  apiKey: string;
  proxy: string;
}

interface OpenAIStore extends OpenAIConfig {
  setApiKey: (apiKey: string) => void;
  setProxy: (proxy: string) => void;
}

export const useOpenAIStore = createWithEqualityFn<OpenAIStore>()(
  persist(
    (set) => ({
      apiKey: '',
      proxy: '',
      setApiKey: (apiKey) => set({ apiKey }),
      setProxy: (proxy) => set({ proxy }),
    }),
    {
      name: 'openai-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
  shallow,
);
