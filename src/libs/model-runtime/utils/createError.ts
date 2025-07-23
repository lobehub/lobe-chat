import { ILobeAgentRuntimeErrorType } from '../error';
import { AgentInitErrorPayload, ChatCompletionErrorPayload } from '../types';

export const AgentRuntimeError = {
  chat: (error: ChatCompletionErrorPayload): ChatCompletionErrorPayload => error,
  createError: (
    errorType: ILobeAgentRuntimeErrorType | string | number,
    error?: any,
  ): AgentInitErrorPayload => ({ error, errorType }),
  textToImage: (error: any): any => error,
};
