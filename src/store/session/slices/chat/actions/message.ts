import { template } from 'lodash-es';
import { StateCreator } from 'zustand/vanilla';

import { LOADING_FLAT } from '@/const/message';
import { fetchChatModel } from '@/services/chatModel';
import { SessionStore } from '@/store/session';
import { ChatMessage } from '@/types/chatMessage';
import { fetchSSE } from '@/utils/fetch';
import { isFunctionMessageAtStart, testFunctionMessageAtEnd } from '@/utils/message';
import { setNamespace } from '@/utils/storeDebug';
import { nanoid } from '@/utils/uuid';

import { agentSelectors } from '../../agentConfig/selectors';
import { sessionSelectors } from '../../session/selectors';
import { MessageDispatch, messagesReducer } from '../reducers/message';
import { chatSelectors } from '../selectors';
import { getSlicedMessagesWithConfig } from '../utils';

const t = setNamespace('chat/message');

/**
 * 聊天操作
 */
export interface ChatMessageAction {
  /**
   * 清除消息
   */
  clearMessage: () => void;
  /**
   * 处理 ai 消息的核心逻辑（包含前处理与后处理）
   * @param messages - 聊天消息数组
   * @param parentId - 父消息 ID，可选
   */
  coreProcessMessage: (messages: ChatMessage[], parentId: string) => Promise<void>;
  /**
   * 删除消息
   * @param id - 消息 ID
   */
  deleteMessage: (id: string) => void;
  /**
   * 分发消息
   * @param payload - 消息分发参数
   */
  dispatchMessage: (payload: MessageDispatch) => void;
  /**
   * 实际获取 AI 响应
   * @param messages - 聊天消息数组
   * @param options - 获取 SSE 选项
   */
  fetchAIChatMessage: (
    messages: ChatMessage[],
    assistantMessageId: string,
  ) => Promise<{
    content: string;
    functionCallAtEnd: boolean;
    functionCallContent: string;
    isFunctionCall: boolean;
  }>;

  /**
   * 重新发送消息
   * @param id - 消息 ID
   */
  resendMessage: (id: string) => Promise<void>;
  /**
   * 发送消息
   * @param text - 消息文本
   */
  sendMessage: (text: string) => Promise<void>;
  stopGenerateMessage: () => void;

  toggleChatLoading: (
    loading: boolean,
    id?: string,
    action?: string,
  ) => AbortController | undefined;
}

export const chatMessage: StateCreator<
  SessionStore,
  [['zustand/devtools', never]],
  [],
  ChatMessageAction
> = (set, get) => ({
  clearMessage: () => {
    const { dispatchMessage, activeTopicId, dispatchTopic, toggleTopic } = get();

    dispatchMessage({ topicId: activeTopicId, type: 'resetMessages' });

    if (activeTopicId) {
      dispatchTopic({ id: activeTopicId, type: 'deleteChatTopic' });
    }

    // after remove topic , go back to default topic
    toggleTopic();
  },

  coreProcessMessage: async (messages, userMessageId) => {
    const { dispatchMessage, fetchAIChatMessage, triggerFunctionCall, activeTopicId } = get();

    const { model } = agentSelectors.currentAgentConfig(get());

    // 添加一个空的信息用于放置 ai 响应，注意顺序不能反
    // 因为如果顺序反了，messages 中将包含新增的 ai message
    const mid = nanoid();

    dispatchMessage({
      id: mid,
      message: LOADING_FLAT,
      parentId: userMessageId,
      role: 'assistant',
      type: 'addMessage',
    });

    // 如果有 activeTopicId，则添加 topicId
    if (activeTopicId) {
      dispatchMessage({ id: mid, key: 'topicId', type: 'updateMessage', value: activeTopicId });
    }

    // 为模型添加 fromModel 的额外信息
    dispatchMessage({ id: mid, key: 'fromModel', type: 'updateMessageExtra', value: model });

    // 生成 ai message
    const { isFunctionCall, content, functionCallAtEnd, functionCallContent } =
      await fetchAIChatMessage(messages, mid);

    // 如果是 function，则发送函数调用方法
    if (isFunctionCall) {
      let functionId = mid;

      if (functionCallAtEnd) {
        // create a new separate message and remove the function call from the prev message
        dispatchMessage({
          id: mid,
          key: 'content',
          type: 'updateMessage',
          value: content.replace(functionCallContent, ''),
        });

        functionId = nanoid();
        dispatchMessage({
          id: functionId,
          message: functionCallContent,
          parentId: userMessageId,
          role: 'assistant',
          type: 'addMessage',
        });

        // also add activeTopicId
        if (activeTopicId)
          dispatchMessage({
            id: functionId,
            key: 'topicId',
            type: 'updateMessage',
            value: activeTopicId,
          });
      }

      triggerFunctionCall(functionId);
    }
  },

  deleteMessage: (id) => {
    get().dispatchMessage({ id, type: 'deleteMessage' });
  },
  dispatchMessage: (payload) => {
    const { activeId } = get();
    const session = sessionSelectors.currentSession(get());
    if (!activeId || !session) return;

    const chats = messagesReducer(session.chats, payload);

    get().dispatchSession({ chats, id: activeId, type: 'updateSessionChat' });
  },

  fetchAIChatMessage: async (messages, assistantId) => {
    const { dispatchMessage, toggleChatLoading } = get();

    const abortController = toggleChatLoading(
      true,
      assistantId,
      t('generateMessage(start)', { assistantId, messages }) as string,
    );

    const config = agentSelectors.currentAgentConfig(get());

    const compiler = template(config.inputTemplate, { interpolate: /{{([\S\s]+?)}}/g });

    // ========================== //
    //   对 messages 做统一预处理    //
    // ========================== //

    // 1. 按参数设定截断长度
    const slicedMessages = getSlicedMessagesWithConfig(messages, config);

    // 2. 替换 inputMessage 模板
    const postMessages = !config.inputTemplate
      ? slicedMessages
      : slicedMessages.map((m) => {
          if (m.role === 'user') {
            try {
              return { ...m, content: compiler({ text: m.content }) };
            } catch (error) {
              console.error(error);

              return m;
            }
          }
          return m;
        });

    // 3. 添加 systemRole
    if (config.systemRole) {
      postMessages.unshift({ content: config.systemRole, role: 'system' } as ChatMessage);
    }

    const fetcher = () =>
      fetchChatModel(
        {
          messages: postMessages,
          model: config.model,
          ...config.params,
          plugins: config.plugins,
        },
        { signal: abortController?.signal },
      );

    let output = '';
    let isFunctionCall = false;
    let functionCallAtEnd = false;
    let functionCallContent = '';

    await fetchSSE(fetcher, {
      onErrorHandle: (error) => {
        dispatchMessage({ id: assistantId, key: 'error', type: 'updateMessage', value: error });
      },
      onMessageHandle: (text) => {
        output += text;

        dispatchMessage({ id: assistantId, key: 'content', type: 'updateMessage', value: output });

        // is this message is just a function call
        if (isFunctionMessageAtStart(output)) {
          isFunctionCall = true;
        }
      },
    });

    toggleChatLoading(false, undefined, t('generateMessage(end)') as string);

    // also exist message like this: 请稍等，我帮您查询一下。{"function_call": {"name": "plugin-identifier____recommendClothes____standalone", "arguments": "{\n "mood": "",\n "gender": "man"\n}"}}
    if (!isFunctionCall) {
      const { content, valid } = testFunctionMessageAtEnd(output);

      // if fc at end, replace the message
      if (valid) {
        isFunctionCall = true;
        functionCallAtEnd = true;
        functionCallContent = content;
      }
    }

    return { content: output, functionCallAtEnd, functionCallContent, isFunctionCall };
  },

  resendMessage: async (messageId) => {
    const session = sessionSelectors.currentSession(get());

    if (!session) return;

    // 1. 构造所有相关的历史记录
    const chats = chatSelectors.currentChats(get());

    const currentIndex = chats.findIndex((c) => c.id === messageId);
    if (currentIndex < 0) return;

    const currentMessage = chats[currentIndex];

    let contextMessages: ChatMessage[] = [];

    switch (currentMessage.role) {
      case 'function':
      case 'user': {
        contextMessages = chats.slice(0, currentIndex + 1);
        break;
      }
      case 'assistant': {
        // 消息是 AI 发出的因此需要找到它的 user 消息
        const userId = currentMessage.parentId;
        const userIndex = chats.findIndex((c) => c.id === userId);
        // 如果消息没有 parentId，那么同 user/function 模式
        contextMessages = chats.slice(0, userIndex < 0 ? currentIndex + 1 : userIndex + 1);
        break;
      }
    }

    if (contextMessages.length <= 0) return;

    const { coreProcessMessage } = get();

    const latestMsg = contextMessages.filter((s) => s.role === 'user').at(-1);

    if (!latestMsg) return;

    await coreProcessMessage(contextMessages, latestMsg.id);
  },

  sendMessage: async (message) => {
    const { dispatchMessage, coreProcessMessage, activeTopicId } = get();
    const session = sessionSelectors.currentSession(get());
    if (!session || !message) return;

    const userId = nanoid();
    dispatchMessage({ id: userId, message, role: 'user', type: 'addMessage' });

    // if there is activeTopicId，then add topicId to message
    if (activeTopicId) {
      dispatchMessage({ id: userId, key: 'topicId', type: 'updateMessage', value: activeTopicId });
    }

    // Get the current messages to generate AI response
    const messages = chatSelectors.currentChats(get());

    await coreProcessMessage(messages, userId);

    // check activeTopic and then auto create topic
    const chats = chatSelectors.currentChats(get());

    if (!activeTopicId && chats.length >= 2) {
      const { saveToTopic, toggleTopic } = get();
      const id = await saveToTopic();
      if (id) toggleTopic(id);
    }
  },

  stopGenerateMessage: () => {
    const { abortController, toggleChatLoading } = get();
    if (!abortController) return;

    abortController.abort();

    toggleChatLoading(false);
  },
  toggleChatLoading: (loading, id, action) => {
    if (loading) {
      const abortController = new AbortController();
      set({ abortController, chatLoadingId: id }, false, action);
      return abortController;
    } else {
      set({ abortController: undefined, chatLoadingId: undefined }, false, action);
    }
  },
});
