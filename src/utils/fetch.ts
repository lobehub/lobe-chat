import { fetchEventSource } from '@microsoft/fetch-event-source';
import { t } from 'i18next';
import { produce } from 'immer';

import { LOBE_CHAT_OBSERVATION_ID, LOBE_CHAT_TRACE_ID } from '@/const/trace';
import { ErrorResponse, ErrorType } from '@/types/fetch';
import {
  ChatMessageError,
  MessageToolCall,
  MessageToolCallChunk,
  MessageToolCallSchema,
} from '@/types/message';

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
    observationId?: string | null;
    toolCalls?: MessageToolCall[];
    traceId?: string | null;
    type?: SSEFinishType;
  },
) => Promise<void>;

export interface MessageTextChunk {
  text: string;
  type: 'text';
}

interface MessageToolCallsChunk {
  tool_calls: MessageToolCall[];
  type: 'tool_calls';
}

export interface FetchSSEOptions {
  fetcher?: typeof fetch;
  onAbort?: (text: string) => Promise<void>;
  onErrorHandle?: (error: ChatMessageError) => void;
  onFinish?: OnFinishHandler;
  onMessageHandle?: (chunk: MessageTextChunk | MessageToolCallsChunk) => void;
}

export const parseToolCalls = (origin: MessageToolCall[], value: MessageToolCallChunk[]) =>
  produce(origin, (draft) => {
    if (draft.length === 0) {
      draft.push(...value.map((item) => MessageToolCallSchema.parse(item)));
    } else {
      value.forEach(({ index, ...item }) => {
        if (!draft?.[index]) {
          draft?.splice(index, 0, MessageToolCallSchema.parse(item));
        } else {
          if (item.function?.arguments) {
            draft[index].function.arguments += item.function.arguments;
          }
        }
      });
    }
  });

/**
 * Fetch data using stream method
 */
// eslint-disable-next-line no-undef
export const fetchSSE = async (url: string, options: RequestInit & FetchSSEOptions = {}) => {
  let output = '';
  let toolCalls: undefined | MessageToolCall[];
  let triggerOnMessageHandler = false;

  let finishedType: SSEFinishType = 'done';
  let response!: Response;

  try {
    await fetchEventSource(url, {
      body: options.body,
      fetch: options?.fetcher,
      headers: options.headers as Record<string, string>,
      method: options.method,
      onerror: (error) => {
        if ((error as TypeError).name === 'AbortError') {
          finishedType = 'abort';
          options?.onAbort?.(output);
        } else {
          finishedType = 'error';
          console.error(error);
        }
        throw new Error('Fetch error');
        // options.onErrorHandle()
      },
      onmessage: (ev) => {
        triggerOnMessageHandler = true;
        let data;
        try {
          data = JSON.parse(ev.data);
        } catch (e) {
          console.warn('parse error, fallback to stream', e);
          options.onMessageHandle?.({ text: data, type: 'text' });
          return;
        }

        switch (ev.event) {
          case 'text': {
            output += data;
            options.onMessageHandle?.({ text: data, type: 'text' });
            break;
          }

          case 'tool_calls': {
            if (!toolCalls) {
              toolCalls = [];
            }

            toolCalls = parseToolCalls(toolCalls, data);

            options.onMessageHandle?.({
              tool_calls: toolCalls,
              type: 'tool_calls',
            });
          }
        }
      },
      onopen: async (res) => {
        response = res.clone();

        // 如果不 ok 说明有请求错误
        if (!response.ok) {
          const chatMessageError = await getMessageError(res);

          options.onErrorHandle?.(chatMessageError);
          return;
        }
      },

      signal: options.signal,
    });
  } catch {}

  // only call onFinish when response is available
  // so like abort, we don't need to call onFinish
  if (response) {
    // if there is no onMessageHandler, we should call onHandleMessage first
    if (!triggerOnMessageHandler) {
      output = await response.clone().text();
      options.onMessageHandle?.({ text: output, type: 'text' });
    }

    const traceId = response.headers.get(LOBE_CHAT_TRACE_ID);
    const observationId = response.headers.get(LOBE_CHAT_OBSERVATION_ID);
    await options?.onFinish?.(output, { observationId, toolCalls, traceId, type: finishedType });
  }

  return response;
};
