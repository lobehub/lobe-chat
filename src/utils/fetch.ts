import { t } from 'i18next';

import { fetchChatModel } from '@/services/chatModel';
import { ChatMessageError } from '@/types/chatMessage';
import { ErrorResponse, ErrorType } from '@/types/fetch';

export const getMessageError = async (response: Response) => {
  let chatMessageError: ChatMessageError;

  // 尝试取一波业务错误语义
  try {
    const data = (await response.json()) as ErrorResponse;
    chatMessageError = {
      body: data.body,
      message: t(`response.${data.errorType}`),
      type: data.errorType,
    };
  } catch {
    // 如果无法正常返回，说明是常规报错
    chatMessageError = {
      message: t(`response.${response.status}`),
      type: response.status as ErrorType,
    };
  }

  return chatMessageError;
};

export interface FetchSSEOptions {
  onErrorHandle?: (error: ChatMessageError) => void;
  onMessageHandle?: (text: string) => void;
}

/**
 * 使用流式方法获取数据
 * @param fetchFn
 * @param options
 */
export const fetchSSE = async (fetchFn: () => Promise<Response>, options: FetchSSEOptions = {}) => {
  const response = await fetchFn();

  // 如果不 ok 说明有请求错误
  if (!response.ok) {
    const chatMessageError = await getMessageError(response);

    options.onErrorHandle?.(chatMessageError);
    return;
  }

  const returnRes = response.clone();

  const data = response.body;

  if (!data) return;

  const reader = data.getReader();
  const decoder = new TextDecoder();

  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value, { stream: true });

    options.onMessageHandle?.(chunkValue);
  }

  return returnRes;
};

interface FetchAITaskResultParams<T> {
  abortController?: AbortController;
  /**
   * 错误处理函数
   */
  onError?: (e: Error, rawError?: any) => void;
  /**
   * 加载状态变化处理函数
   * @param loading - 是否处于加载状态
   */
  onLoadingChange?: (loading: boolean) => void;
  /**
   * 消息处理函数
   * @param text - 消息内容
   */
  onMessageHandle?: (text: string) => void;

  /**
   * 请求对象
   */
  params: T;
}

export const fetchAIFactory =
  <T>(fetcher: (params: T, options: { signal?: AbortSignal }) => Promise<Response>) =>
  async ({
    params,
    onMessageHandle,
    onError,
    onLoadingChange,
    abortController,
  }: FetchAITaskResultParams<T>) => {
    const errorHandle = (error: Error, errorContent?: any) => {
      onLoadingChange?.(false);
      if (abortController?.signal.aborted) {
        return;
      }
      onError?.(error, errorContent);
    };

    onLoadingChange?.(true);

    const data = await fetchSSE(() => fetcher(params, { signal: abortController?.signal }), {
      onErrorHandle: (error) => {
        errorHandle(new Error(error.message), error);
      },
      onMessageHandle,
    }).catch(errorHandle);

    onLoadingChange?.(false);

    return await data?.text();
  };

export const fetchPresetTaskResult = fetchAIFactory(fetchChatModel);
