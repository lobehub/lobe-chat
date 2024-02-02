import { ILobeAgentRuntimeErrorType } from '../error';
import { ChatCompletionErrorPayload } from '../types';

export const AgentRuntimeError = {
  chat: (error: ChatCompletionErrorPayload): ChatCompletionErrorPayload => error,
  createError: (errorType: ILobeAgentRuntimeErrorType | string | number, error?: any) => {
    return new TypeError(JSON.stringify({ error, type: errorType }));
  },
};
