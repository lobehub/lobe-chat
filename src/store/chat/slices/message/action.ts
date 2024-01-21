/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Note: DON'T REMOVE THE FIRST LINE
// Disable the auto sort key eslint rule to make the code more logic and readable
import { template } from 'lodash-es';
import useSWR, { SWRResponse, mutate } from 'swr';
import { StateCreator } from 'zustand/vanilla';

import { GPT4_VISION_MODEL_DEFAULT_MAX_TOKENS } from '@/const/llm';
import { LOADING_FLAT, isFunctionMessageAtStart, testFunctionMessageAtEnd } from '@/const/message';
import { CreateMessageParams } from '@/database/models/message';
import { chatService } from '@/services/chat';
import { messageService } from '@/services/message';
import { topicService } from '@/services/topic';
import { chatHelpers } from '@/store/chat/helpers';
import { ChatStore } from '@/store/chat/store';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { ChatMessage } from '@/types/message';
import { fetchSSE } from '@/utils/fetch';
import { setNamespace } from '@/utils/storeDebug';

import { chatSelectors } from '../../selectors';
import { MessageDispatch, messagesReducer } from './reducer';

const n = setNamespace('message');

interface SendMessageParams {
  message: string;
  files?: { id: string; url: string }[];
  onlyAddUserMessage?: boolean;
}

export interface ChatMessageAction {
  // create
  resendMessage: (id: string) => Promise<void>;
  sendMessage: (params: SendMessageParams) => Promise<void>;
  // delete
  /**
   * clear message on the active session
   */
  clearMessage: () => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  clearAllMessages: () => Promise<void>;
  // update
  updateInputMessage: (message: string) => void;
  updateMessageContent: (id: string, content: string) => Promise<void>;
  // query
  useFetchMessages: (sessionId: string, topicId?: string) => SWRResponse<ChatMessage[]>;
  stopGenerateMessage: () => void;

  /**
   * update message at the frontend point
   * this method will not update messages to database
   */
  dispatchMessage: (payload: MessageDispatch) => void;
  /**
   * core process of the AI message (include preprocess and postprocess)
   */
  coreProcessMessage: (messages: ChatMessage[], parentId: string) => Promise<void>;
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
  toggleChatLoading: (
    loading: boolean,
    id?: string,
    action?: string,
  ) => AbortController | undefined;
  refreshMessages: () => Promise<void>;
  createSmoothMessage: (id: string) => {
    startAnimation: (speed?: number) => Promise<void>;
    stopAnimation: () => void;
    outputQueue: string[];
    isAnimationActive: boolean;
  };
}

const getAgentConfig = () => agentSelectors.currentAgentConfig(useSessionStore.getState());

const preventLeavingFn = (e: BeforeUnloadEvent) => {
  // set returnValue to trigger alert modal
  // Note: No matter what value is set, the browser will display the standard text
  e.returnValue = '你有正在生成中的请求，确定要离开吗？';
};

export const chatMessage: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  ChatMessageAction
> = (set, get) => ({
  deleteMessage: async (id) => {
    await messageService.removeMessage(id);
    await get().refreshMessages();
  },
  clearMessage: async () => {
    const { activeId, activeTopicId, refreshMessages, refreshTopic, switchTopic } = get();

    await messageService.removeMessages(activeId, activeTopicId);

    if (activeTopicId) {
      await topicService.removeTopic(activeTopicId);
    }
    await refreshTopic();
    await refreshMessages();

    // after remove topic , go back to default topic
    switchTopic();
  },
  clearAllMessages: async () => {
    const { refreshMessages } = get();
    await messageService.clearAllMessage();
    await refreshMessages();
  },
  resendMessage: async (messageId) => {
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
  sendMessage: async ({ message, files, onlyAddUserMessage }) => {
    const { coreProcessMessage, activeTopicId, activeId } = get();
    if (!activeId) return;

    const fileIdList = files?.map((f) => f.id);

    // if message is empty and no files, then stop
    if (!message && (!fileIdList || fileIdList?.length === 0)) return;

    const newMessage: CreateMessageParams = {
      content: message,
      // if message has attached with files, then add files to message and the agent
      files: fileIdList,
      role: 'user',
      sessionId: activeId,
      // if there is activeTopicId，then add topicId to message
      topicId: activeTopicId,
    };

    const id = await messageService.create(newMessage);
    await get().refreshMessages();

    // if only add user message, then stop
    if (onlyAddUserMessage) return;

    // Get the current messages to generate AI response
    const messages = chatSelectors.currentChats(get());

    await coreProcessMessage(messages, id);

    // check activeTopic and then auto create topic
    const chats = chatSelectors.currentChats(get());

    const agentConfig = getAgentConfig();
    // if autoCreateTopic is false, then stop
    if (!agentConfig.enableAutoCreateTopic) return;

    if (!activeTopicId && chats.length >= agentConfig.autoCreateTopicThreshold) {
      const { saveToTopic, switchTopic } = get();
      const id = await saveToTopic();
      if (id) switchTopic(id);
    }
  },

  stopGenerateMessage: () => {
    const { abortController, toggleChatLoading } = get();
    if (!abortController) return;

    abortController.abort();

    toggleChatLoading(false, undefined, n('stopGenerateMessage') as string);
  },
  updateInputMessage: (message) => {
    set({ inputMessage: message }, false, n('updateInputMessage', message));
  },
  updateMessageContent: async (id, content) => {
    const { dispatchMessage, refreshMessages } = get();

    // Due to the async update method and refresh need about 100ms
    // we need to update the message content at the frontend to avoid the update flick
    // refs: https://medium.com/@kyledeguzmanx/what-are-optimistic-updates-483662c3e171
    dispatchMessage({ id, key: 'content', type: 'updateMessage', value: content });

    await messageService.updateMessage(id, { content });
    await refreshMessages();
  },
  useFetchMessages: (sessionId, activeTopicId) =>
    useSWR<ChatMessage[]>(
      [sessionId, activeTopicId],
      async ([sessionId, topicId]: [string, string | undefined]) =>
        messageService.getMessages(sessionId, topicId),
      {
        onSuccess: (messages, key) => {
          set(
            { activeId: sessionId, messages, messagesInit: true },
            false,
            n('useFetchMessages', {
              messages,
              queryKey: key,
            }),
          );
        },
        // default is 2000ms ,it makes the user's quick switch don't work correctly.
        // Cause issue like this: https://github.com/lobehub/lobe-chat/issues/532
        // we need to set it to 0.
        dedupingInterval: 0,
      },
    ),
  refreshMessages: async () => {
    await mutate([get().activeId, get().activeTopicId]);
  },

  // the internal process method of the AI message
  coreProcessMessage: async (messages, userMessageId) => {
    const { fetchAIChatMessage, triggerFunctionCall, refreshMessages, activeTopicId } = get();

    const { model } = getAgentConfig();

    // 1. Add an empty message to place the AI response
    const assistantMessage: CreateMessageParams = {
      role: 'assistant',
      content: LOADING_FLAT,
      fromModel: model,

      parentId: userMessageId,
      sessionId: get().activeId,
      topicId: activeTopicId, // if there is activeTopicId，then add it to topicId
    };

    const mid = await messageService.create(assistantMessage);
    await refreshMessages();

    // 2. fetch the AI response
    const { isFunctionCall, content, functionCallAtEnd, functionCallContent } =
      await fetchAIChatMessage(messages, mid);

    // 3. if it's the function call message, trigger the function method
    if (isFunctionCall) {
      let functionId = mid;

      // if the function call is at the end of the message, then create a new function message
      if (functionCallAtEnd) {
        // create a new separate message and remove the function call from the prev message

        await get().updateMessageContent(mid, content.replace(functionCallContent, ''));

        const functionMessage: CreateMessageParams = {
          role: 'function',
          content: functionCallContent,
          extra: {
            fromModel: model,
          },
          parentId: userMessageId,
          sessionId: get().activeId,
          topicId: activeTopicId,
        };
        functionId = await messageService.create(functionMessage);
      }

      await refreshMessages();
      await triggerFunctionCall(functionId);
    }
  },
  dispatchMessage: (payload) => {
    const { activeId } = get();

    if (!activeId) return;

    const messages = messagesReducer(get().messages, payload);

    set({ messages }, false, n(`dispatchMessage/${payload.type}`, payload));
  },
  fetchAIChatMessage: async (messages, assistantId) => {
    const {
      toggleChatLoading,
      refreshMessages,
      updateMessageContent,
      dispatchMessage,
      createSmoothMessage,
    } = get();

    const abortController = toggleChatLoading(
      true,
      assistantId,
      n('generateMessage(start)', { assistantId, messages }) as string,
    );

    const config = getAgentConfig();

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

    // 4. handle max_tokens
    config.params.max_tokens = config.enableMaxTokens ? config.params.max_tokens : undefined;

    // 5. handle config for the vision model
    // Due to the gpt-4-vision-preview model's default max_tokens is very small
    // we need to set the max_tokens a larger one.
    if (config.model === 'gpt-4-vision-preview') {
      /* eslint-disable unicorn/no-lonely-if */
      if (!config.params.max_tokens)
        config.params.max_tokens = GPT4_VISION_MODEL_DEFAULT_MAX_TOKENS;
    }

    const fetcher = () =>
      chatService.createAssistantMessage(
        {
          messages: preprocessMsgs,
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

    const { startAnimation, stopAnimation, outputQueue, isAnimationActive } =
      createSmoothMessage(assistantId);

    await fetchSSE(fetcher, {
      onErrorHandle: async (error) => {
        await messageService.updateMessageError(assistantId, error);
        await refreshMessages();
      },
      onAbort: async () => {
        stopAnimation();
      },
      onFinish: async (content) => {
        stopAnimation();

        // if there is still content not displayed,
        // and the message is not a function call
        // then continue the animation
        if (outputQueue.length > 0 && !isFunctionCall) {
          await startAnimation(15);
        }

        // update the content after fetch result
        await updateMessageContent(assistantId, content);
      },
      onMessageHandle: async (text) => {
        output += text;
        outputQueue.push(...text.split(''));

        // is this message is just a function call
        if (isFunctionMessageAtStart(output)) {
          stopAnimation();
          dispatchMessage({
            id: assistantId,
            key: 'content',
            type: 'updateMessage',
            value: output,
          });
          isFunctionCall = true;
        }

        // if it's the first time to receive the message,
        // and the message is not a function call
        // then start the animation
        if (!isAnimationActive && !isFunctionCall) startAnimation();
      },
    });

    toggleChatLoading(false, undefined, n('generateMessage(end)') as string);

    // also exist message like this:
    // 请稍等，我帮您查询一下。{"tool_calls":[{"id":"call_sbca","type":"function","function":{"name":"pluginName____apiName","arguments":{"key":"value"}}}]}
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
  toggleChatLoading: (loading, id, action) => {
    if (loading) {
      window.addEventListener('beforeunload', preventLeavingFn);

      const abortController = new AbortController();
      set({ abortController, chatLoadingId: id }, false, action);

      return abortController;
    } else {
      set({ abortController: undefined, chatLoadingId: undefined }, false, action);

      window.removeEventListener('beforeunload', preventLeavingFn);
    }
  },

  createSmoothMessage: (id) => {
    const { dispatchMessage } = get();

    let buffer = '';
    // why use queue: https://shareg.pt/GLBrjpK
    let outputQueue: string[] = [];

    // eslint-disable-next-line no-undef
    let animationTimeoutId: NodeJS.Timeout | null = null;
    let isAnimationActive = false;

    // when you need to stop the animation, call this function
    const stopAnimation = () => {
      isAnimationActive = false;
      if (animationTimeoutId !== null) {
        clearTimeout(animationTimeoutId);
        animationTimeoutId = null;
      }
    };

    // define startAnimation function to display the text in buffer smooth
    // when you need to start the animation, call this function
    const startAnimation = (speed = 2) =>
      new Promise<void>((resolve) => {
        if (isAnimationActive) {
          resolve();
          return;
        }

        isAnimationActive = true;

        const updateText = () => {
          // 如果动画已经不再激活，则停止更新文本
          if (!isAnimationActive) {
            clearTimeout(animationTimeoutId!);
            animationTimeoutId = null;
            resolve();
          }

          // 如果还有文本没有显示
          // 检查队列中是否有字符待显示
          if (outputQueue.length > 0) {
            // 从队列中获取前两个字符（如果存在）
            const charsToAdd = outputQueue.splice(0, speed).join('');
            buffer += charsToAdd;

            // 更新消息内容，这里可能需要结合实际情况调整
            dispatchMessage({ id, key: 'content', type: 'updateMessage', value: buffer });

            // 设置下一个字符的延迟
            animationTimeoutId = setTimeout(updateText, 16); // 16 毫秒的延迟模拟打字机效果
          } else {
            // 当所有字符都显示完毕时，清除动画状态
            isAnimationActive = false;
            animationTimeoutId = null;
            resolve();
          }
        };

        updateText();
      });

    return { startAnimation, stopAnimation, outputQueue, isAnimationActive };
  },
});
