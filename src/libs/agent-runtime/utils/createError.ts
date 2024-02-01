import { ILobeAgentRuntimeErrorType } from '../error';
import { ChatCompletionErrorPayload } from '../types';

export const AgentRuntimeError = {
  chat: (error: ChatCompletionErrorPayload): ChatCompletionErrorPayload => error,
  createError: (errorType: ILobeAgentRuntimeErrorType, error?: any) => {
    return new TypeError(JSON.stringify({ error, type: errorType }));
  },
};

export const createError = (errorType: ILobeAgentRuntimeErrorType, error?: any) => {
  return new TypeError(JSON.stringify({ error, type: errorType }));
};

export const createChatCompletionError = (
  error: ChatCompletionErrorPayload,
): ChatCompletionErrorPayload => error;
