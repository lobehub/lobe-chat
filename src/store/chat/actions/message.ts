import { template } from 'lodash-es';
import { StateCreator } from 'zustand/vanilla';

import { VISION_MODEL_WHITE_LIST } from '@/const/llm';
import { LOADING_FLAT } from '@/const/message';
import { VISION_MODEL_DEFAULT_MAX_TOKENS } from '@/const/settings';
import { chatService } from '@/services/chat';
import { filesSelectors, useFileStore } from '@/store/files';
import { chatHelpers } from '@/store/chat/helpers';
import { ChatStore } from '@/store/chat/store';
import { agentSelectors, sessionSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/chatMessage';
import { OpenAIChatMessage, UserMessageContentPart } from '@/types/openai/chat';
import { fetchSSE } from '@/utils/fetch';
import { isFunctionMessageAtStart, testFunctionMessageAtEnd } from '@/utils/message';
import { setNamespace } from '@/utils/storeDebug';
import { nanoid } from '@/utils/uuid';

import { FileDispatch, filesReducer } from '../reducers/files';
import { MessageDispatch, messagesReducer } from '../reducers/message';
import { chatSelectors } from '../selectors';

const t = setNamespace('chat/message');

/**
 * 聊天操作
 */
export interface ChatMessageAction {
  /**
   * TODO: 根据 sessionId 和 topicId 删除消息记录
   * clear message on the active session
   */
  clearMessage: () => void;
  /**
   * 处理 ai 消息的核心逻辑（包含前处理与后处理）
   * @param messages - 聊天消息数组
   * @param parentId - 父消息 ID，可选
   */
  coreProcessMessage: (messages: ChatMessage[], parentId: string) => Promise<void>;
  /**
   * TODO: 删除单条消息
   * @param id - 消息 ID
   */
  deleteMessage: (id: string) => void;
  /**
   * agent files dispatch method
   */
  dispatchAgentFile: (payload: FileDispatch) => void;
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
  sendMessage: (text: string, images?: { id: string; url: string }[]) => Promise<void>;
  stopGenerateMessage: () => void;
  toggleChatLoading: (
    loading: boolean,
    id?: string,
    action?: string,
  ) => AbortController | undefined;

  updateInputMessage: (message: string) => void;
}

export const chatMessage: StateCreator<
  ChatStore,
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

  dispatchAgentFile: (payload) => {
    const { activeId } = get();
    const session = sessionSelectors.currentSession(get());
    if (!activeId || !session) return;

    const files = filesReducer(session.files || [], payload);

    get().dispatchSession({ files, id: activeId, type: 'updateSessionFiles' });
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

    // ================================== //
    //   messages uniformly preprocess    //
    // ================================== //

    // 1. slice messages with config
    let preprocessMsgs = chatHelpers.getSlicedMessagesWithConfig(messages, config);

    // 2. replace inputMessage template
    preprocessMsgs = !config.inputTemplate
      ? preprocessMsgs
      : preprocessMsgs.map((m) => {
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

    // 3. add systemRole
    if (config.systemRole) {
      preprocessMsgs.unshift({ content: config.systemRole, role: 'system' } as ChatMessage);
    }

    let postMessages: OpenAIChatMessage[] = preprocessMsgs;

    // 4. handle content type for vision model
    // for the models with visual ability, add image url to content
    // refs: https://platform.openai.com/docs/guides/vision/quick-start
    if (VISION_MODEL_WHITE_LIST.includes(config.model)) {
      postMessages = preprocessMsgs.map((m) => {
        if (!m.files) return m;

        const imageList = filesSelectors.getImageUrlOrBase64ByList(m.files)(
          useFileStore.getState(),
        );

        if (imageList.length === 0) return m;

        const content: UserMessageContentPart[] = [
          { text: m.content, type: 'text' },
          ...imageList.map(
            (i) => ({ image_url: { detail: 'auto', url: i.url }, type: 'image_url' }) as const,
          ),
        ];
        return { ...m, content };
      });

      // due to vision model's default max_tokens is very small, we need to set the max_tokens a larger one.
      if (!config.params.max_tokens) config.params.max_tokens = VISION_MODEL_DEFAULT_MAX_TOKENS;
    }

    const fetcher = () =>
      chatService.getChatCompletion(
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

    // also exist message like this:  请稍等，我帮您查询一下。{"function_call": {"name": "plugin-identifier____recommendClothes____standalone", "arguments": "{\n "mood": "",\n "gender": "man"\n}"}}
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

  sendMessage: async (message, files) => {
    const { dispatchMessage, dispatchAgentFile, coreProcessMessage, activeTopicId } = get();
    const session = sessionSelectors.currentSession(get());
    if (!session || !message) return;

    const userId = nanoid();

    dispatchMessage({
      id: userId,
      message: message,
      role: 'user',
      type: 'addMessage',
    });

    // if message has attached with files, then add files to message and the agent
    if (files && files.length > 0) {
      const fileIdList = files.map((f) => f.id);
      dispatchMessage({ id: userId, key: 'files', type: 'updateMessage', value: fileIdList });

      dispatchAgentFile({ files: fileIdList, type: 'addFiles' });
    }

    // if there is activeTopicId，then add topicId to message
    if (activeTopicId) {
      dispatchMessage({ id: userId, key: 'topicId', type: 'updateMessage', value: activeTopicId });
    }

    // Get the current messages to generate AI response
    const messages = chatSelectors.currentChats(get());

    await coreProcessMessage(messages, userId);

    // check activeTopic and then auto create topic
    const chats = chatSelectors.currentChats(get());

    const agentConfig = agentSelectors.currentAgentConfig(get());
    // if autoCreateTopic is false, then stop
    if (!agentConfig.enableAutoCreateTopic) return;

    if (!activeTopicId && chats.length >= agentConfig.autoCreateTopicThreshold) {
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
  updateInputMessage: (message) => {
    set({ inputMessage: message }, false, t('updateInputMessage'));
  },
});
