import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid';
import { createWithEqualityFn } from 'zustand/traditional';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ChatMessage } from '@/types/message';
import { fetchSSE } from '@/utils/fetchSSE';

import { useOpenAIStore } from '../openai';
import { shallow } from 'zustand/shallow';

interface ChatState {
  eventSource: { close: () => void } | null;
  // AI 调用状态
  isLoading: boolean;
  // 消息存储，key 为 sessionId
  messageMap: Record<string, ChatMessage[]>;
}

interface ChatActions {
  addMessage: (sessionId: string, message: Omit<ChatMessage, 'createdAt' | 'updatedAt'>) => void;
  clearMessages: (sessionId: string) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  // 消息相关操作
  getMessages: (sessionId: string) => ChatMessage[];
  regenerateMessage: (sessionId: string, messageId: string) => Promise<void>;

  // AI 调用相关
  sendMessage: (sessionId: string, content: string) => Promise<void>;
  stopGenerating: () => void;
  updateMessage: (sessionId: string, messageId: string, content: string) => void;
}

export const useChatStore = createWithEqualityFn<ChatState & ChatActions>()(
  persist(
    (set, get) => ({
      addMessage: (sessionId, message) => {
        const newMessage: ChatMessage = {
          ...message,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          messageMap: {
            ...state.messageMap,
            [sessionId]: [...(state.messageMap[sessionId] || []), newMessage],
          },
        }));
      },

      clearMessages: (sessionId) => {
        set((state) => ({
          messageMap: {
            ...state.messageMap,
            [sessionId]: [],
          },
        }));
      },

      deleteMessage: (sessionId, messageId) => {
        set((state) => ({
          messageMap: {
            ...state.messageMap,
            [sessionId]: (state.messageMap[sessionId] || []).filter((msg) => msg.id !== messageId),
          },
        }));
      },

      eventSource: null,

      // 消息管理
      getMessages: (sessionId) => {
        return get().messageMap[sessionId] || [];
      },

      isLoading: false,

      // 初始状态
      messageMap: {},

      regenerateMessage: async (sessionId, messageId) => {
        const state = get();

        // 获取当前会话的所有消息
        const messages = state.getMessages(sessionId);

        // 找到当前消息
        const currentMessage = messages.find((msg) => msg.id === messageId);
        if (!currentMessage) {
          throw new Error('无法找到指定消息');
        }

        // 找到对应的用户消息
        const userMessage = messages.find((msg) => msg.id === currentMessage.parentId);
        if (!userMessage) {
          throw new Error('无法找到对应的用户消息');
        }

        // 创建新的助手消息占位
        const assistantMessageId = nanoid();
        state.addMessage(sessionId, {
          content: '',
          id: assistantMessageId,
          parentId: userMessage.id,
          role: 'assistant',
        });

        set({ isLoading: true });

        try {
          const { proxy, apiKey } = useOpenAIStore.getState();

          // 找到用户消息的索引
          const userMessageIndex = messages.findIndex((msg) => msg.id === userMessage.id);

          // 只使用用户消息和之前的消息
          const contextMessages = messages
            .slice(0, userMessageIndex + 1)
            .filter((msg) => msg.id !== assistantMessageId)
            .map(({ role, content }) => ({
              content,
              role,
            }));

          const es = fetchSSE({
            apiKey,
            messages: contextMessages,
            onDone: () => {
              set({
                eventSource: null,
                isLoading: false,
              });
            },
            onError: () => {
              set({
                eventSource: null,
                isLoading: false,
              });
              get().updateMessage(
                sessionId,
                assistantMessageId,
                '请求失败，请检查网络或API Key配置',
              );
            },
            onMessage: (text) => {
              get().updateMessage(sessionId, assistantMessageId, text);
            },
            proxy,
          });

          set({ eventSource: es });
        } catch (error) {
          set({
            eventSource: null,
            isLoading: false,
          });
          get().updateMessage(sessionId, assistantMessageId, '请求失败，请检查网络或API Key配置');
          throw error;
        }
      },

      // AI 调用
      sendMessage: async (sessionId, content) => {
        const state = get();
        const { proxy, apiKey } = useOpenAIStore.getState();

        // 添加用户消息
        const userMessageId = nanoid();
        state.addMessage(sessionId, {
          content,
          id: userMessageId,
          role: 'user',
        });

        // 添加助手消息占位
        const assistantMessageId = nanoid();
        state.addMessage(sessionId, {
          content: '',
          id: assistantMessageId,
          parentId: userMessageId,
          role: 'assistant',
        });

        set({ isLoading: true });

        try {
          const es = fetchSSE({
            apiKey,
            messages: state
              .getMessages(sessionId)
              .filter((msg) => msg.id !== assistantMessageId)
              .map(({ role, content }) => ({
                content,
                role,
              })),
            onDone: () => {
              set({
                eventSource: null,
                isLoading: false,
              });
            },
            onError: () => {
              set({
                eventSource: null,
                isLoading: false,
              });
              get().updateMessage(
                sessionId,
                assistantMessageId,
                '请求失败，请检查网络或API Key配置',
              );
            },
            onMessage: (text) => {
              get().updateMessage(sessionId, assistantMessageId, text);
            },
            proxy,
          });

          set({ eventSource: es });
        } catch (error) {
          set({
            eventSource: null,
            isLoading: false,
          });
          get().updateMessage(sessionId, assistantMessageId, '请求失败，请检查网络或API Key配置');
          throw error;
        }
      },

      stopGenerating: () => {
        const { eventSource } = get();
        if (eventSource) {
          eventSource.close();
        }
        set({
          eventSource: null,
          isLoading: false,
        });
      },

      updateMessage: (sessionId, messageId, content) => {
        set((state) => ({
          messageMap: {
            ...state.messageMap,
            [sessionId]: (state.messageMap[sessionId] || []).map((msg) =>
              msg.id === messageId ? { ...msg, content, updatedAt: Date.now() } : msg,
            ),
          },
        }));
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
  shallow,
);
