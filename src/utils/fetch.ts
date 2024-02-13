import { t } from 'i18next';

import { LOBE_CHAT_TRACE_ID } from '@/const/trace';
import { ErrorResponse, ErrorType } from '@/types/fetch';
import { ChatMessageError } from '@/types/message';

export const getMessageError = async (response: Response) => {
  let chatMessageError: ChatMessageError;

  // 尝试取一波业务错误语义
  try {
    const data = (await response.json()) as ErrorResponse;
    chatMessageError = {
      body: data.body,
      message: t(`response.${data.errorType}` as any, { ns: 'error' }),
      type: data.errorType,
    };
  } catch {
    // 如果无法正常返回，说明是常规报错
    chatMessageError = {
      message: t(`response.${response.status}` as any, { ns: 'error' }),
      type: response.status as ErrorType,
    };
  }

  return chatMessageError;
};

type SSEFinishType = 'done' | 'error' | 'abort';

export type OnFinishHandler = (
  text: string,
  context: {
    traceId?: string | null;
    type?: SSEFinishType;
  },
) => Promise<void>;

export interface FetchSSEOptions {
  onAbort?: (text: string) => Promise<void>;
  onErrorHandle?: (error: ChatMessageError) => void;
  onFinish?: OnFinishHandler;
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
  let output = '';
  const reader = data.getReader();
  const decoder = new TextDecoder();

  let done = false;
  let finishedType: SSEFinishType = 'done';

  while (!done) {
    try {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value, { stream: true });

      output += chunkValue;
      options.onMessageHandle?.(chunkValue);
    } catch (error) {
      done = true;

      if ((error as TypeError).name === 'AbortError') {
        finishedType = 'abort';
        options?.onAbort?.(output);
      } else {
        finishedType = 'error';
        console.error(error);
      }
    }
  }

  const traceId = response.headers.get(LOBE_CHAT_TRACE_ID);
  await options?.onFinish?.(output, { traceId, type: finishedType });

  return returnRes;
};
